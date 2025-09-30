import fs from 'fs-extra'
import path from 'path'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'

export const registerPageBuilderHandler = (ipcMain) => {
  async function getExistingPagesTree(_event, folderPath) {
    console.log('Fetching existing pages tree for folderPath:', folderPath)
    const routingFilePath = path.join(folderPath, 'src', 'routing.jsx')
    if (fs.existsSync(routingFilePath)) {
      const routingFileContent = await fs.readFile(routingFilePath, 'utf-8')
      const ast = parse(routingFileContent, {
        sourceType: 'module',
        plugins: ['jsx']
      })

      // Recursive extractor
      function extractObject(node) {
        let obj = {}
        node.properties.forEach((prop) => {
          if (!prop.key) return

          const key = prop.key.name || prop.key.value

          if (key === 'label' && prop.value.type === 'StringLiteral') {
            obj.label = prop.value.value
          }

          if (key === 'path' && prop.value.type === 'StringLiteral') {
            obj.path = prop.value.value
          }

          if (key === 'hideInMenu' && prop.value.type === 'BooleanLiteral') {
            obj.hideInMenu = prop.value.value
          }

          if (key === 'children' && prop.value.type === 'ArrayExpression') {
            obj.children = prop.value.elements
              .filter((el) => el.type === 'ObjectExpression')
              .map((el) => extractObject(el))
          }
        })

        return obj
      }

      let routes = []

      traverse(ast, {
        VariableDeclarator(path) {
          if (path.node.id.name === 'sideMenuConfig' && path.node.init.type === 'ArrayExpression') {
            routes = path.node.init.elements.map((el) => extractObject(el))
          }
        }
      })

      return routes
    } else {
      throw new Error('Routing file does not exist')
      // console.log('Routing file does not exist')
    }
  }

  ipcMain.handle('pageBuilder:getExistingPagesTree', getExistingPagesTree)
}
