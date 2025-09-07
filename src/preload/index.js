import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  selectFolder: async () => {
    return await ipcRenderer.invoke('select-folder')
  },
  runShellCommandStream: (command, onLog, onEnd) => {
    ipcRenderer.removeAllListeners('shell-command-log')
    ipcRenderer.removeAllListeners('shell-command-end')
    ipcRenderer.on('shell-command-log', (event, log) => {
      onLog && onLog(log)
    })
    ipcRenderer.once('shell-command-end', (event, code) => {
      onEnd && onEnd(code)
    })
    ipcRenderer.send('run-shell-command-stream', command)
  },
  // Legacy config APIs removed
  // GitHub Users management APIs
  githubUsers: {
    getAll: async () => {
      return await ipcRenderer.invoke('github-users-get-all')
    },
    add: async (name, githubHandle) => {
      return await ipcRenderer.invoke('github-users-add', name, githubHandle)
    },
    update: async (id, name, githubHandle) => {
      return await ipcRenderer.invoke('github-users-update', id, name, githubHandle)
    },
    delete: async (id) => {
      return await ipcRenderer.invoke('github-users-delete', id)
    }
  },
  // Companies APIs
  companies: {
    getAll: async () => {
      return await ipcRenderer.invoke('/get/companies')
    },
    add: async (code, name, logo) => {
      return await ipcRenderer.invoke('/add/companies', code, name, logo)
    },
    update: async (id, code, name, logo) => {
      return await ipcRenderer.invoke('/update/companies', id, code, name, logo)
    },
    delete: async (id) => {
      return await ipcRenderer.invoke('/delete/companies', id)
    }
  },
  // Environments APIs
  environments: {
    getAll: async () => {
      return await ipcRenderer.invoke('/get/environments')
    },
    add: async (code, name) => {
      return await ipcRenderer.invoke('/add/environments', code, name)
    },
    update: async (id, code, name) => {
      return await ipcRenderer.invoke('/update/environments', id, code, name)
    },
    delete: async (id) => {
      return await ipcRenderer.invoke('/delete/environments', id)
    }
  },
  // Core Token Configs APIs
  coreTokenConfigs: {
    getAll: async () => {
      return await ipcRenderer.invoke('/get/core-token-configs')
    },
    add: async (companyId, environmentId, domain, tokenApi, authKey) => {
      return await ipcRenderer.invoke(
        '/add/core-token-configs',
        companyId,
        environmentId,
        domain,
        tokenApi,
        authKey
      )
    },
    update: async (id, companyId, environmentId, domain, tokenApi, authKey) => {
      return await ipcRenderer.invoke(
        '/update/core-token-configs',
        id,
        companyId,
        environmentId,
        domain,
        tokenApi,
        authKey
      )
    },
    delete: async (id) => {
      return await ipcRenderer.invoke('/delete/core-token-configs', id)
    }
  },
  // GCP Project Configs APIs
  gcpProjectConfigs: {
    getAll: async () => {
      return await ipcRenderer.invoke('/get/gcp-project-configs')
    },
    add: async (companyId, environmentId, gcpProject, gcpCluster, gcpRegion) => {
      return await ipcRenderer.invoke(
        '/add/gcp-project-configs',
        companyId,
        environmentId,
        gcpProject,
        gcpCluster,
        gcpRegion
      )
    },
    update: async (id, companyId, environmentId, gcpProject, gcpCluster, gcpRegion) => {
      return await ipcRenderer.invoke(
        '/update/gcp-project-configs',
        id,
        companyId,
        environmentId,
        gcpProject,
        gcpCluster,
        gcpRegion
      )
    },
    delete: async (id) => {
      return await ipcRenderer.invoke('/delete/gcp-project-configs', id)
    }
  },
  // GitHub Configs APIs
  githubConfigs: {
    getAll: async () => {
      return await ipcRenderer.invoke('/get/github-configs')
    },
    add: async (companyId, githubToken, owner) => {
      return await ipcRenderer.invoke('/add/github-configs', companyId, githubToken, owner)
    },
    update: async (id, companyId, githubToken, owner) => {
      return await ipcRenderer.invoke('/update/github-configs', id, companyId, githubToken, owner)
    },
    delete: async (id) => {
      return await ipcRenderer.invoke('/delete/github-configs', id)
    }
  },
  // GitHub Repos APIs
  githubRepos: {
    getAll: async () => {
      return await ipcRenderer.invoke('/get/github-repos')
    },
    add: async (companyId, name) => {
      return await ipcRenderer.invoke('/add/github-repos', companyId, name)
    },
    delete: async (id) => {
      return await ipcRenderer.invoke('/delete/github-repos', id)
    },
    sync: async (companyId) => {
      return await ipcRenderer.invoke('/sync/github-repos', companyId)
    }
  },
  // GitHub Repo Access APIs
  githubRepoAccess: {
    getAll: async () => {
      return await ipcRenderer.invoke('/get/github-repo-access')
    },
    add: async (companyId, repoId, userId, accessLevel) => {
      return await ipcRenderer.invoke(
        '/add/github-repo-access',
        companyId,
        repoId,
        userId,
        accessLevel
      )
    },
    delete: async (id) => {
      return await ipcRenderer.invoke('/delete/github-repo-access', id)
    }
  },
  // Backup APIs
  backup: {
    export: async () => {
      return await ipcRenderer.invoke('export_database')
    },
    import: async (data) => {
      return await ipcRenderer.invoke('import_database', { data })
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
