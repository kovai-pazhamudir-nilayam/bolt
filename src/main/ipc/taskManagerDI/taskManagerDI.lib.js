import fs from 'fs-extra'
import path from 'path'
import { execSync } from 'child_process'
import { camelCase } from 'lodash'

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

export const getNamesAndPaths = ({ input }) => {
  const { task, module_input } = input
  const appDirPath = path.join(__dirname, '..', '..', 'src', 'app')
  const moduleDirPath = path.join(appDirPath, module_input.name)
  const downstreamDirPath = path.join(appDirPath, 'downstreamCalls')
  const downstreamTemplateFilePath = path.join(
    __dirname,
    '..',
    'templates',
    'downstreamCalls.template.js'
  )

  const taskFileTemplatePath = path.join(__dirname, '..', 'templates', 'taskFile.template.js')

  const paths = {
    appDirPath,
    moduleDirPath,
    downstreamDirPath,
    downstreamTemplateFilePath,
    taskFileTemplatePath
  }

  const names = {
    moduleName: module_input.name,
    taskName: getSanatizeText(task.task_name),
    taskFileName: camelCase(task.task_name),
    taskDescription: task.task_description
  }

  return {
    paths,
    names
  }
}

export function createDownstreamCallFile(downstreamDir, moduleName, templatePath) {
  const downstreamFilePath = path.join(downstreamDir, `${moduleName}.js`)
  let downstreamTemplate = fs.readFileSync(templatePath, 'utf8')
  downstreamTemplate = downstreamTemplate.replace(/TEMPLATE_/gi, moduleName)
  fs.writeFileSync(downstreamFilePath, downstreamTemplate)
  console.log(`Created downstream call file: ${downstreamFilePath}`)
}

export function createModuleFolder(moduleDirPath) {
  if (!fs.existsSync(moduleDirPath)) {
    fs.mkdirSync(moduleDirPath)
    console.log(`Created module folder: ${moduleDirPath}`)
  }
}

export function createTaskFile(moduleDirPath, templatePath, taskFileName) {
  const taskFilePath = path.join(moduleDirPath, `${taskFileName}.js`)
  let templateContent = fs.readFileSync(templatePath, 'utf8')
  templateContent = templateContent.replace(/TEMPLATE_TASK_NAME/gi, taskFileName)
  fs.writeFileSync(taskFilePath, templateContent)
  console.log(`Created task file: ${taskFilePath}`)
}

export const getExistingDomainFolders = () => {
  const folders_needs_to_be_excluded = [
    'commons',
    'downstreamCalls',
    'errorHandler',
    'hooks',
    'plugins',
    'task-di',
    'utils'
  ]
  const appDirPath = path.join(__dirname, '..', '..', 'src', 'app')

  const folders = fs
    .readdirSync(appDirPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

  const filteredFolders = folders.filter((folder) => !folders_needs_to_be_excluded.includes(folder))

  return filteredFolders
}

export const getExistingDownstreamFiles = () => {
  const appDirPath = path.join(__dirname, '..', '..', 'src', 'app', 'downstreamCalls')

  const files = fs
    .readdirSync(appDirPath, { withFileTypes: true })
    .filter((dirent) => dirent.isFile())
    .filter((dirent) => dirent.name.endsWith('.js'))
    .map((dirent) => dirent.name)

  return files
}

export const trasformUserInput = (input) => {
  const { task, ...rest } = input
  const data = {
    ...rest,
    task: {
      task_name: getSanatizeText(task.task_name),
      task_description: task.task_description
    }
  }

  return data
}

export function updateServiceConfiguration(appDir, moduleName, taskName, taskFileName) {
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
  const serviceTransformPath = path.join(__dirname, 'serviceTransform.js')
  fs.writeFileSync(serviceTransformPath, serviceTransform)
  execSync(`npx jscodeshift -t ${serviceTransformPath} ${serviceConfigPath}`)
  fs.unlinkSync(serviceTransformPath)
  console.log(`Updated SERVICE_MAPPING in ${serviceConfigPath}`)
}

export function updateSupportedTask(appDir, taskName, taskDescription) {
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
  const supportedTaskTransformPath = path.join(__dirname, 'supportedTaskTransform.js')
  fs.writeFileSync(supportedTaskTransformPath, supportedTaskTransform)
  execSync(`npx jscodeshift -t ${supportedTaskTransformPath} ${supportedTaskPath}`)
  fs.unlinkSync(supportedTaskTransformPath)
  console.log(`Updated SUPPORTED_TASK in ${supportedTaskPath}`)
}
