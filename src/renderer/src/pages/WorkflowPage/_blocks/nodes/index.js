import ApiCallNode from './ApiCallNode'
import CsvReadNode from './CsvReadNode'
import CsvWriteNode from './CsvWriteNode'
import JsTransformNode from './JsTransformNode'
import LoopNode from './LoopNode'

const nodeTypes = {
  csvRead: CsvReadNode,
  apiCall: ApiCallNode,
  jsTransform: JsTransformNode,
  loop: LoopNode,
  csvWrite: CsvWriteNode
}

export default nodeTypes
