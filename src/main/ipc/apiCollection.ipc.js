import https from 'https'
import http from 'http'

function makeHttpRequest({ url, method, headers, body }) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url)
    const isHttps = parsedUrl.protocol === 'https:'
    const lib = isHttps ? https : http

    const parsedHeaders = {}
    if (headers) {
      const headerList = typeof headers === 'string' ? JSON.parse(headers) : headers
      headerList.forEach(({ key, value }) => {
        if (key) parsedHeaders[key] = value
      })
    }

    const bodyStr = body || ''
    if (bodyStr && ['POST', 'PUT', 'PATCH'].includes((method || 'GET').toUpperCase())) {
      parsedHeaders['Content-Length'] = Buffer.byteLength(bodyStr)
    }

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: (method || 'GET').toUpperCase(),
      headers: parsedHeaders
    }

    const req = lib.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        if (data.length < 10240) data += chunk
      })
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          responseHeaders: res.headers,
          body: data,
          size: Buffer.byteLength(data, 'utf8')
        })
      })
    })

    req.setTimeout(30000, () => {
      req.destroy()
      reject(new Error('Request timed out after 30s'))
    })

    req.on('error', reject)

    if (bodyStr && ['POST', 'PUT', 'PATCH'].includes((method || 'GET').toUpperCase())) {
      req.write(bodyStr)
    }
    req.end()
  })
}

export const registerApiCollectionHandler = (ipcMain, configDb) => {
  async function getAll() {
    return configDb.knex('api_collection').select('*').orderBy('created_at', 'desc')
  }

  async function upsert(event, input) {
    const { id, title, method, url, headers, body } = input
    const headersJson = JSON.stringify(Array.isArray(headers) ? headers : [])

    if (id) {
      const [entry] = await configDb
        .knex('api_collection')
        .where({ id })
        .update({
          title,
          method,
          url,
          headers: headersJson,
          body: body || '',
          updated_at: configDb.knex.fn.now()
        })
        .returning('*')
      return entry
    }

    const [entry] = await configDb
      .knex('api_collection')
      .insert({
        title,
        method,
        url,
        headers: headersJson,
        body: body || '',
        created_at: configDb.knex.fn.now(),
        updated_at: configDb.knex.fn.now()
      })
      .returning('*')
    return entry
  }

  async function deleteEntry(event, id) {
    return configDb.knex('api_collection').where({ id }).del()
  }

  async function run(event, input) {
    const { url, method, headers, body, iterations = 1 } = input
    const results = []

    for (let i = 0; i < iterations; i++) {
      const start = Date.now()
      try {
        const result = await makeHttpRequest({ url, method, headers, body })
        results.push({
          iteration: i + 1,
          status: result.status,
          duration: Date.now() - start,
          body: result.body.substring(0, 2000),
          responseHeaders: result.responseHeaders,
          size: result.size
        })
      } catch (error) {
        results.push({
          iteration: i + 1,
          status: null,
          duration: Date.now() - start,
          error: error.message
        })
      }
    }

    return results
  }

  ipcMain.handle('apiCollection:getAll', getAll)
  ipcMain.handle('apiCollection:upsert', upsert)
  ipcMain.handle('apiCollection:delete', deleteEntry)
  ipcMain.handle('apiCollection:run', run)
}
