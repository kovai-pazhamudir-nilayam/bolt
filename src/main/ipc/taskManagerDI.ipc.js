// taskManagerDI.ipc

import fs from 'fs-extra'
import path from 'path'

import { camelCase } from 'lodash'
import { getTemplateDir, runShellCommandInStream, sendLog } from '../helpers/ipc.helper'

const getSanatizeText = (input) => {
  const cleanedString = input.replace(/[^a-zA-Z\s]/g, '').trim()

  // 2. Make all uppercase.
  const uppercaseString = cleanedString.toUpperCase()

  // 3. Replace single spaces with underscores.
  // This step ensures we get underscores where spaces were.
  const underscoredString = uppercaseString.replace(/ /g, '_')

  // 4. Replace multiple consecutive underscores with a single underscore.
  // The regex /_+/g matches one or more (_) underscores globally.
  const finalString = underscoredString.replace(/_+/g, '_')

  return finalString
}

const getNamesAndPaths = ({ targetDir, input }) => {
  const { task_name, module_name, task_description } = input
  const appDirPath = path.join(targetDir, 'src', 'app')
  const moduleDirPath = path.join(appDirPath, module_name)
  const downstreamDirPath = path.join(appDirPath, 'downstreamCalls')
  const downstreamTemplateFilePath = path.join(
    getTemplateDir(),
    '..',
    'templates',
    'downstreamCalls.template.js'
  )

  const taskFileTemplatePath = path.join(getTemplateDir(), 'taskManagerDI', 'taskFile.template.js')

  const paths = {
    appDirPath,
    moduleDirPath,
    downstreamDirPath,
    downstreamTemplateFilePath,
    taskFileTemplatePath
  }

  const names = {
    moduleName: module_name,
    taskName: getSanatizeText(task_name),
    taskFileName: camelCase(task_name),
    taskDescription: task_description
  }

  return {
    paths,
    names
  }
}

function createDownstreamCallFile(downstreamDir, moduleName, templatePath, event) {
  const downstreamFilePath = path.join(downstreamDir, `${moduleName}.js`)
  let downstreamTemplate = fs.readFileSync(templatePath, 'utf8')
  downstreamTemplate = downstreamTemplate.replace(/TEMPLATE_/gi, moduleName)
  fs.writeFileSync(downstreamFilePath, downstreamTemplate)
  sendLog(event, `Created downstream call file: ${downstreamFilePath}`)
}

function createModuleFolder(moduleDirPath, event) {
  if (!fs.existsSync(moduleDirPath)) {
    fs.mkdirSync(moduleDirPath)
    sendLog(event, `Created module folder: ${moduleDirPath}`)
  }
}

function createTaskFile(moduleDirPath, templatePath, taskFileName, event) {
  const taskFilePath = path.join(moduleDirPath, `${taskFileName}.js`)
  let templateContent = fs.readFileSync(templatePath, 'utf8')
  templateContent = templateContent.replace(/TEMPLATE_TASK_NAME/gi, taskFileName)
  fs.writeFileSync(taskFilePath, templateContent)
  sendLog(event, `Created task file: ${taskFilePath}`)
}

const getExistingDownstreamFiles = () => {
  const appDirPath = path.join(getTemplateDir(), '..', '..', 'src', 'app', 'downstreamCalls')

  const files = fs
    .readdirSync(appDirPath, { withFileTypes: true })
    .filter((dirent) => dirent.isFile())
    .filter((dirent) => dirent.name.endsWith('.js'))
    .map((dirent) => dirent.name)

  return files
}

async function updateServiceConfiguration(appDir, moduleName, taskName, taskFileName, event) {
  const serviceConfigPath = path.join(appDir, 'service.configuration.js')
  const serviceTransform = `
    module.exports = function(fileInfo, api) {
      const j = api.jscodeshift;
      const root = j(fileInfo.source);
      // Add require statement at the top
      const requireDecl = j.variableDeclaration('const', [
        j.variableDeclarator(
          j.identifier('${taskFileName}'),
          j.callExpression(
            j.identifier('require'),
            [j.literal('./${moduleName}/${taskFileName}')]
          )
        )
      ]);
      root.find(j.VariableDeclaration)
        .at(0)
        .insertBefore(requireDecl);
      // Add entry to SERVICE_MAPPING
      root.find(j.ObjectExpression)
        .forEach(path => {
          if (path.parent.value.id && path.parent.value.id.name === 'SERVICE_MAPPING') {
            path.value.properties.push(
              j.property('init', j.identifier('${taskName}'), j.identifier('${taskFileName}'))
            );
          }
        });
      return root.toSource();
    };
  `
  const serviceTransformPath = path.join(getTemplateDir(), 'serviceTransform.js')
  fs.writeFileSync(serviceTransformPath, serviceTransform)
  await runShellCommandInStream(
    event,
    `npx jscodeshift -t ${serviceTransformPath} ${serviceConfigPath}`
  )
  fs.unlinkSync(serviceTransformPath)
  sendLog(event, `Updated SERVICE_MAPPING in ${serviceConfigPath}`)
}

async function updateSupportedTask(appDir, taskName, taskDescription, event) {
  const supportedTaskPath = path.join(appDir, 'supported.task.js')
  const supportedTaskTransform = `
    module.exports = function(fileInfo, api) {
      const j = api.jscodeshift;
      const root = j(fileInfo.source);
      root.find(j.ArrayExpression)
        .forEach(path => {
          if (path.parent.value.id && path.parent.value.id.name === 'SUPPORTED_TASK') {
            path.value.elements.push(
              j.objectExpression([
                j.property('init', j.identifier('type'), j.literal('${taskName}')),
                j.property('init', j.identifier('description'), j.literal('${taskDescription}'))
              ])
            );
          }
        });
      return root.toSource();
    };
  `
  const supportedTaskTransformPath = path.join(getTemplateDir(), 'supportedTaskTransform.js')
  fs.writeFileSync(supportedTaskTransformPath, supportedTaskTransform)
  await runShellCommandInStream(
    event,
    `npx jscodeshift -t ${supportedTaskTransformPath} ${supportedTaskPath}`
  )
  fs.unlinkSync(supportedTaskTransformPath)
  sendLog(event, `Updated SUPPORTED_TASK in ${supportedTaskPath}`)
}

const generateTaskManagerCode = async ({ targetDir, values, event }) => {
  const input = values
  const moduleName = input.module_name
  const isNewModule = false

  const { paths, names } = getNamesAndPaths({ targetDir, input })
  const {
    appDirPath,
    moduleDirPath,
    downstreamDirPath,
    downstreamTemplateFilePath,
    taskFileTemplatePath
  } = paths

  const { taskFileName, taskName } = names

  if (isNewModule) {
    createModuleFolder(moduleDirPath)
  }

  createTaskFile(moduleDirPath, taskFileTemplatePath, taskFileName, event)

  await updateServiceConfiguration(appDirPath, moduleName, taskName, taskFileName, event)

  await updateSupportedTask(appDirPath, taskName, input.task_description, event)

  if (isNewModule && !getExistingDownstreamFiles().includes(`${moduleName}.js`)) {
    createDownstreamCallFile(downstreamDirPath, moduleName, downstreamTemplateFilePath, event)
  }

  sendLog(event, 'Automation complete.')
}

export const registerTaskManagerDIHandler = (ipcMain) => {
  // Folder selection dialog
  ipcMain.handle('generate:taskManagerDICode', async (event, { targetDir, values }) => {
    return await generateTaskManagerCode({ targetDir, values, event })
  })

  ipcMain.handle('folder:getExistingDomainFolders', async (event, targetDir) => {
    const folders_needs_to_be_excluded = [
      'commons',
      'downstreamCalls',
      'errorHandler',
      'hooks',
      'plugins',
      'task-di',
      'utils'
    ]
    const appDirPath = path.join(targetDir, 'src', 'app')

    const folders = fs
      .readdirSync(appDirPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)

    const filteredFolders = folders.filter(
      (folder) => !folders_needs_to_be_excluded.includes(folder)
    )

    return filteredFolders
  })
}
