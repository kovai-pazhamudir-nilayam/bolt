/**
 * JS Transform executor.
 * Runs user-supplied JavaScript code in a sandboxed new Function context.
 * The function receives `items` (array) and must return an array.
 *
 * Example code:
 *   return items.map(item => ({ ...item, amount: Number(item.amount) * 2 }))
 */
export async function jsTransformExecutor(node, items) {
  const { code = 'return items' } = node.data.config || {}

  let result
  // eslint-disable-next-line no-new-func
  const fn = new Function('items', code)
  result = await fn(items)

  if (!Array.isArray(result)) {
    throw new Error('JS Transform must return an array')
  }
  return result
}
