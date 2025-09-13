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

const getNamesAndPaths = ({ targetDir, input }) => {
  const { task_name, module_name, task_description } = input
  const appDirPath = path.join(targetDir, 'src', 'app')
  const moduleDirPath = path.join(appDirPath, module_name)
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

function createDownstreamCallFile(downstreamDir, moduleName, templatePath) {
  const downstreamFilePath = path.join(downstreamDir, `${moduleName}.js`)
  let downstreamTemplate = fs.readFileSync(templatePath, 'utf8')
  downstreamTemplate = downstreamTemplate.replace(/TEMPLATE_/gi, moduleName)
  fs.writeFileSync(downstreamFilePath, downstreamTemplate)
  console.log(`Created downstream call file: ${downstreamFilePath}`)
}

function createModuleFolder(moduleDirPath) {
  if (!fs.existsSync(moduleDirPath)) {
    fs.mkdirSync(moduleDirPath)
    console.log(`Created module folder: ${moduleDirPath}`)
  }
}

function createTaskFile(moduleDirPath, templatePath, taskFileName) {
  const taskFilePath = path.join(moduleDirPath, `${taskFileName}.js`)
  let templateContent = fs.readFileSync(templatePath, 'utf8')
  templateContent = templateContent.replace(/TEMPLATE_TASK_NAME/gi, taskFileName)
  fs.writeFileSync(taskFilePath, templateContent)
  console.log(`Created task file: ${taskFilePath}`)
}

const getExistingDownstreamFiles = () => {
  const appDirPath = path.join(__dirname, '..', '..', 'src', 'app', 'downstreamCalls')

  const files = fs
    .readdirSync(appDirPath, { withFileTypes: true })
    .filter((dirent) => dirent.isFile())
    .filter((dirent) => dirent.name.endsWith('.js'))
    .map((dirent) => dirent.name)

  return files
}

function updateServiceConfiguration(appDir, moduleName, taskName, taskFileName) {
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

function updateSupportedTask(appDir, taskName, taskDescription) {
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

export const generateTaskManagerCode = ({ targetDir, values }) => {
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

  createTaskFile(moduleDirPath, taskFileTemplatePath, taskFileName)

  updateServiceConfiguration(appDirPath, moduleName, taskName, taskFileName)

  updateSupportedTask(appDirPath, taskName, input.task_description)

  if (isNewModule && !getExistingDownstreamFiles().includes(`${moduleName}.js`)) {
    createDownstreamCallFile(downstreamDirPath, moduleName, downstreamTemplateFilePath)
  }

  console.log('Automation complete.')
}
