import { apiCallExecutor } from './apiCall.executor'
import { csvReadExecutor } from './csvRead.executor'
import { csvWriteExecutor } from './csvWrite.executor'
import { jsTransformExecutor } from './jsTransform.executor'
import { loopExecutor } from './loop.executor'

export const EXECUTORS = {
  csvRead: csvReadExecutor,
  apiCall: apiCallExecutor,
  jsTransform: jsTransformExecutor,
  loop: loopExecutor,
  csvWrite: csvWriteExecutor
}
