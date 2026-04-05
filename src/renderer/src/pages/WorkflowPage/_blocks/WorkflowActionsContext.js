import { createContext, useContext } from 'react'

export const WorkflowActionsContext = createContext({
  retryNode: null,
  deleteNode: null
})

export const useWorkflowActions = () => useContext(WorkflowActionsContext)
