/**  API implementation  */
const pageBuilderAPI = {
  getAll: () => {},
  upsert: () => {},
  delete: () => {}
}

const pageBuilderDB = {
  getAll: (folderPath) => {
    return window.toolsAPI.pageBuilder.getExistingPagesTree(folderPath)
  }
}

const toolsPageFactory = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return {
      pageBuilderRepo: pageBuilderAPI
    }
  }
  return {
    pageBuilderRepo: pageBuilderDB
  }
}

export { toolsPageFactory }
