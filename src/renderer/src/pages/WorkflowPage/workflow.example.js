/**
 * Example workflow: CSV Read → Loop → API Call → JS Transform → CSV Write
 *
 * Flow:
 *   1. CSV Read     — provides sample user rows [{id, name}]
 *   2. Loop         — iterates over each user row individually
 *   3. API Call     — fetches posts for each user: GET https://jsonplaceholder.typicode.com/posts?userId={{id}}
 *   4. JS Transform — picks only title + userId from each post
 *   5. CSV Write    — downloads enriched_posts.csv
 */
export const EXAMPLE_WORKFLOW = {
  id: 'wf_example_001',
  version: '1.0',
  name: 'Users → Posts → CSV',
  savedAt: '2024-01-01T00:00:00.000Z',
  nodes: [
    {
      id: 'csvRead_1',
      type: 'csvRead',
      position: { x: 80, y: 100 },
      data: {
        label: 'CSV Read',
        config: {
          filePath: '',
          delimiter: ',',
          fileContent: 'id,name\n1,Alice\n2,Bob\n3,Carol'
        }
      }
    },
    {
      id: 'loop_1',
      type: 'loop',
      position: { x: 80, y: 260 },
      data: {
        label: 'Loop',
        config: { iterateOver: 'items' }
      }
    },
    {
      id: 'apiCall_1',
      type: 'apiCall',
      position: { x: 340, y: 260 },
      data: {
        label: 'Fetch Posts',
        config: {
          method: 'GET',
          url: 'https://jsonplaceholder.typicode.com/posts?userId={{id}}',
          headers: '{}',
          body: '',
          retryCount: 1
        }
      }
    },
    {
      id: 'jsTransform_1',
      type: 'jsTransform',
      position: { x: 600, y: 260 },
      data: {
        label: 'Pick Fields',
        config: {
          code: `return items.map(post => ({
  userId: post.userId,
  postId: post.id,
  title: post.title
}))`
        }
      }
    },
    {
      id: 'csvWrite_1',
      type: 'csvWrite',
      position: { x: 600, y: 420 },
      data: {
        label: 'CSV Write',
        config: { filePath: 'enriched_posts.csv', delimiter: ',' }
      }
    }
  ],
  edges: [
    {
      id: 'e1',
      source: 'csvRead_1',
      sourceHandle: null,
      target: 'loop_1',
      targetHandle: null
    },
    {
      id: 'e2',
      source: 'loop_1',
      sourceHandle: 'loopOutput',
      target: 'apiCall_1',
      targetHandle: null
    },
    {
      id: 'e3',
      source: 'apiCall_1',
      sourceHandle: null,
      target: 'jsTransform_1',
      targetHandle: null
    },
    {
      id: 'e4',
      source: 'jsTransform_1',
      sourceHandle: null,
      target: 'csvWrite_1',
      targetHandle: null
    }
  ]
}
