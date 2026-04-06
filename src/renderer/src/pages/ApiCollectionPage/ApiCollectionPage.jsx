import {
  Alert,
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Progress,
  Select,
  Space,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  Upload
} from 'antd'
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  FileUp,
  Pencil,
  Play,
  Plus,
  Trash2,
  X
} from 'lucide-react'
import { Highlight, themes } from 'prism-react-renderer'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useMemo, useRef, useState } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import SubmitBtnForm from '../../components/SubmitBtnForm'
import withNotification from '../../hoc/withNotification'
import { apiCollectionFactory } from '../../repos/ApiCollectionPage.repo'

const { apiCollectionRepo } = apiCollectionFactory()

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

const METHOD_COLORS = {
  GET: 'green',
  POST: 'blue',
  PUT: 'orange',
  PATCH: 'purple',
  DELETE: 'red',
  HEAD: 'cyan',
  OPTIONS: 'default'
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function parseCurl(curlStr) {
  const cmd = curlStr.replace(/\\\n\s*/g, ' ').trim()
  let method = 'GET'
  const methodMatch = cmd.match(/(?:-X|--request)\s+(\w+)/)
  if (methodMatch) method = methodMatch[1].toUpperCase()
  const urlMatch = cmd.match(/(https?:\/\/[^\s'"\\>]+)/)
  const url = urlMatch ? urlMatch[1] : ''
  const headers = []
  const hSingle = [...cmd.matchAll(/(?:-H|--header)\s+'([^']+)'/g)]
  const hDouble = [...cmd.matchAll(/(?:-H|--header)\s+"([^"]+)"/g)]
  ;[...hSingle, ...hDouble].forEach((m) => {
    const raw = m[1]
    const colonIdx = raw.indexOf(':')
    if (colonIdx > 0)
      headers.push({ key: raw.slice(0, colonIdx).trim(), value: raw.slice(colonIdx + 1).trim() })
  })
  let body = ''
  const bodySQ = cmd.match(/(?:--data(?:-raw|-urlencode)?|-d)\s+'([^']*)'/)
  const bodyDQ = cmd.match(/(?:--data(?:-raw|-urlencode)?|-d)\s+"([^"]*)"/)
  if (bodySQ) body = bodySQ[1]
  else if (bodyDQ) body = bodyDQ[1]
  if (body && !methodMatch) method = 'POST'
  return { url, method, headers, body }
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return { columns: [], rows: [] }
  const columns = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
  const rows = lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
    return Object.fromEntries(columns.map((col, i) => [col, values[i] ?? '']))
  })
  return { columns, rows }
}

function substituteVars(template, vars) {
  const replace = (str) =>
    (str || '').replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? vars[k] : `{{${k}}}`))
  const headers =
    typeof template.headers === 'string' ? JSON.parse(template.headers) : template.headers || []
  return {
    url: replace(template.url),
    body: replace(template.body),
    headers: headers.map((h) => ({ key: replace(h.key), value: replace(h.value) }))
  }
}

function detectVars(str) {
  return [...(str || '').matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1])
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

function getStatusColor(status) {
  if (!status) return 'red'
  if (status >= 200 && status < 300) return 'green'
  if (status >= 300 && status < 500) return 'orange'
  return 'red'
}

// ─── JSON viewer ──────────────────────────────────────────────────────────────

function useIsDark() {
  return useMemo(() => !!document.querySelector('[data-theme="dark"]'), [])
}

const JsonViewer = ({ content }) => {
  const isDark = useIsDark()
  let code = content || ''
  try {
    code = JSON.stringify(JSON.parse(content), null, 2)
  } catch {
    /* use raw */
  }

  return (
    <Highlight theme={isDark ? themes.oneDark : themes.oneLight} code={code} language="json">
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <div
          style={{
            ...style,
            background: 'transparent',
            fontFamily: 'monospace',
            fontSize: 11,
            lineHeight: '20px',
            padding: '10px 0'
          }}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })} style={{ display: 'flex' }}>
              <span
                style={{
                  minWidth: 36,
                  paddingRight: 12,
                  textAlign: 'right',
                  color: 'rgba(128,128,128,0.45)',
                  userSelect: 'none',
                  fontSize: 11,
                  flexShrink: 0
                }}
              >
                {i + 1}
              </span>
              <span style={{ whiteSpace: 'pre' }}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </span>
            </div>
          ))}
        </div>
      )}
    </Highlight>
  )
}

// ─── code editor (body field) ────────────────────────────────────────────────

const EDITOR_HEIGHT = 220
const LINE_NUM_WIDTH = 36

// CodeEditor: syntax-highlighted editable textarea with line numbers
// Form.Item passes value + onChange directly
const CodeEditor = ({ value, onChange }) => {
  const isDark = useIsDark()
  const highlightRef = useRef(null)
  const lineNumRef = useRef(null)
  const code = value || ''
  const lineCount = code.split('\n').length

  const syncScroll = (e) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.target.scrollTop
      highlightRef.current.scrollLeft = e.target.scrollLeft
    }
    if (lineNumRef.current) {
      lineNumRef.current.scrollTop = e.target.scrollTop
    }
  }

  const sharedStyle = {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: '20px',
    padding: '8px 0 8px 12px',
    whiteSpace: 'pre',
    boxSizing: 'border-box',
    width: '100%',
    height: EDITOR_HEIGHT
  }

  const bgColor = isDark ? '#282c34' : '#f6f8fa'
  const lineNumColor = isDark ? '#636d83' : '#9da5b4'
  const lineNumBorder = isDark ? '#3e4451' : '#e0e0e0'

  return (
    <div
      style={{
        display: 'flex',
        borderRadius: 6,
        border: '1px solid #d9d9d9',
        overflow: 'hidden',
        height: EDITOR_HEIGHT,
        background: bgColor
      }}
    >
      {/* Line numbers column */}
      <div
        ref={lineNumRef}
        style={{
          width: LINE_NUM_WIDTH,
          minWidth: LINE_NUM_WIDTH,
          height: EDITOR_HEIGHT,
          overflow: 'hidden',
          background: bgColor,
          borderRight: `1px solid ${lineNumBorder}`,
          padding: '8px 0',
          boxSizing: 'border-box'
        }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div
            key={i}
            style={{
              height: 20,
              lineHeight: '20px',
              textAlign: 'right',
              paddingRight: 8,
              fontFamily: 'monospace',
              fontSize: 12,
              color: lineNumColor,
              userSelect: 'none'
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Code area */}
      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        {/* Highlighted layer — follows textarea scroll */}
        <Highlight
          theme={isDark ? themes.oneDark : themes.oneLight}
          code={code || ' '}
          language="json"
        >
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <div
              ref={highlightRef}
              style={{
                ...sharedStyle,
                ...style,
                background: bgColor,
                overflow: 'hidden',
                pointerEvents: 'none',
                userSelect: 'none',
                position: 'absolute',
                top: 0,
                left: 0
              }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </Highlight>

        {/* Editable layer — transparent text, visible caret */}
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          spellCheck={false}
          autoComplete="off"
          style={{
            ...sharedStyle,
            position: 'absolute',
            top: 0,
            left: 0,
            background: 'transparent',
            color: 'transparent',
            caretColor: isDark ? '#abb2bf' : '#383a42',
            border: 'none',
            outline: 'none',
            resize: 'none',
            overflow: 'auto'
          }}
        />
      </div>
    </div>
  )
}

// ─── detail panel (right side) ───────────────────────────────────────────────

// ─── copy hook ───────────────────────────────────────────────────────────────

function useCopy() {
  const [copied, setCopied] = useState(false)
  const copy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return [copied, copy]
}

// ─── collapsible section ──────────────────────────────────────────────────────

const CollapsibleSection = ({ label, count, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ marginBottom: 4 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 0',
          marginBottom: open ? 6 : 0,
          outline: 'none',
          width: '100%',
          textAlign: 'left'
        }}
      >
        {open ? (
          <ChevronDown size={12} style={{ opacity: 0.5, flexShrink: 0 }} />
        ) : (
          <ChevronRight size={12} style={{ opacity: 0.5, flexShrink: 0 }} />
        )}
        <Typography.Text
          type="secondary"
          style={{ fontSize: 11, letterSpacing: '0.05em', userSelect: 'none' }}
        >
          {label}
        </Typography.Text>
        {count != null && (
          <Typography.Text type="secondary" style={{ fontSize: 11, opacity: 0.6 }}>
            ({count})
          </Typography.Text>
        )}
      </button>
      {open && children}
    </div>
  )
}

const TAB_STYLE = (active) => ({
  padding: '8px 14px',
  cursor: 'pointer',
  fontSize: 13,
  borderBottom: active ? '2px solid #1677ff' : '2px solid transparent',
  color: active ? '#1677ff' : undefined,
  background: 'none',
  border: 'none',
  outline: 'none',
  fontWeight: active ? 500 : 400
})

const HeadersTable = ({ headers }) => {
  const entries = Object.entries(headers || {})
  if (!entries.length) return <Typography.Text type="secondary">No headers</Typography.Text>
  return (
    <div style={{ fontFamily: 'monospace', fontSize: 12 }}>
      {entries.map(([k, v]) => (
        <div
          key={k}
          style={{
            display: 'flex',
            gap: 0,
            padding: '5px 0',
            borderBottom: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <span style={{ width: 240, flexShrink: 0, fontWeight: 500, color: '#d19a66' }}>{k}</span>
          <span style={{ color: '#98c379', wordBreak: 'break-all' }}>{String(v)}</span>
        </div>
      ))}
    </div>
  )
}

const DetailPanel = ({ result }) => {
  const [tab, setTab] = useState('response')
  const [respCopied, copyResp] = useCopy()
  const [bodyCopied, copyBody] = useCopy()

  useEffect(() => {
    setTab('response')
  }, [result?._key])

  if (!result) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(128,128,128,0.5)'
        }}
      >
        <Typography.Text type="secondary">← Select a result to inspect</Typography.Text>
      </div>
    )
  }

  const isError = !!result.error
  const reqHeaders = (result.requestSnapshot?.headers || []).filter((h) => h.key)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          flexShrink: 0
        }}
      >
        <Typography.Text type="secondary" style={{ fontSize: 12, flexShrink: 0 }}>
          {result.label}
        </Typography.Text>
        <span style={{ color: 'rgba(128,128,128,0.4)' }}>›</span>
        <Tag color={METHOD_COLORS[result.requestSnapshot?.method]} style={{ margin: 0 }}>
          {result.requestSnapshot?.method}
        </Tag>
        <Typography.Text
          style={{
            flex: 1,
            fontSize: 12,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {result.requestSnapshot?.url}
        </Typography.Text>
        <Space size={8} style={{ flexShrink: 0 }}>
          {isError ? (
            <Tag color="red">Error</Tag>
          ) : (
            <Tag color={getStatusColor(result.status)}>
              <strong>{result.status}</strong>
            </Tag>
          )}
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {result.duration} ms
          </Typography.Text>
          {result.size > 0 && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {formatSize(result.size)}
            </Typography.Text>
          )}
        </Space>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          flexShrink: 0,
          padding: '0 8px'
        }}
      >
        {['response', 'headers', 'body'].map((t) => (
          <button key={t} style={TAB_STYLE(tab === t)} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'headers' && (
              <span style={{ marginLeft: 4, fontSize: 11, opacity: 0.6 }}>
                ({reqHeaders.length + Object.keys(result.responseHeaders || {}).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        {tab === 'response' && (
          <div>
            {!isError && result.body && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
                <Tooltip title={respCopied ? 'Copied!' : 'Copy response'}>
                  <Button
                    type="text"
                    size="small"
                    icon={respCopied ? <Check size={13} /> : <Copy size={13} />}
                    onClick={() => copyResp(result.body)}
                    style={{ color: respCopied ? '#52c41a' : undefined }}
                  />
                </Tooltip>
              </div>
            )}
            {isError ? (
              <div style={{ padding: '16px 0' }}>
                <Typography.Text type="danger" style={{ fontFamily: 'monospace' }}>
                  {result.error}
                </Typography.Text>
              </div>
            ) : (
              <JsonViewer content={result.body || ''} />
            )}
          </div>
        )}
        {tab === 'headers' && (
          <div style={{ paddingTop: 12 }}>
            <CollapsibleSection label="REQUEST HEADERS" count={reqHeaders.length}>
              {reqHeaders.length > 0 ? (
                <HeadersTable
                  headers={Object.fromEntries(reqHeaders.map((h) => [h.key, h.value]))}
                />
              ) : (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  No request headers
                </Typography.Text>
              )}
            </CollapsibleSection>
            <div style={{ marginTop: 16 }}>
              <CollapsibleSection
                label="RESPONSE HEADERS"
                count={Object.keys(result.responseHeaders || {}).length}
              >
                {result.responseHeaders && Object.keys(result.responseHeaders).length > 0 ? (
                  <HeadersTable headers={result.responseHeaders} />
                ) : (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    No response headers
                  </Typography.Text>
                )}
              </CollapsibleSection>
            </div>
          </div>
        )}
        {tab === 'body' && (
          <div style={{ paddingTop: 12 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 12,
                gap: 8
              }}
            >
              <div style={{ fontFamily: 'monospace', fontSize: 12, flex: 1 }}>
                <span style={{ color: '#d19a66', fontWeight: 600 }}>
                  {result.requestSnapshot?.method}
                </span>
                {'  '}
                <span style={{ color: '#98c379' }}>{result.requestSnapshot?.url}</span>
              </div>
              {result.requestSnapshot?.body && (
                <Tooltip title={bodyCopied ? 'Copied!' : 'Copy body'}>
                  <Button
                    type="text"
                    size="small"
                    icon={bodyCopied ? <Check size={13} /> : <Copy size={13} />}
                    onClick={() => copyBody(result.requestSnapshot.body)}
                    style={{ color: bodyCopied ? '#52c41a' : undefined, flexShrink: 0 }}
                  />
                </Tooltip>
              )}
            </div>
            {result.requestSnapshot?.body ? (
              <JsonViewer content={result.requestSnapshot.body} />
            ) : (
              <Typography.Text type="secondary">No body sent</Typography.Text>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── left list item ───────────────────────────────────────────────────────────

const ResultListItem = ({ result, selected, onClick }) => {
  const isError = !!result.error
  const status = result.status
  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 14px',
        cursor: 'pointer',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        borderLeft: `3px solid ${selected ? '#1677ff' : 'transparent'}`,
        background: selected ? 'rgba(22,119,255,0.06)' : 'transparent',
        transition: 'background 0.1s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <Tag
          color={METHOD_COLORS[result.requestSnapshot?.method]}
          style={{ margin: 0, fontSize: 11 }}
        >
          {result.requestSnapshot?.method}
        </Tag>
        <Typography.Text style={{ flex: 1, fontSize: 12, fontWeight: 500 }} ellipsis>
          {result.title}
        </Typography.Text>
        {isError ? (
          <Tag color="red" style={{ margin: 0, fontSize: 11 }}>
            ERR
          </Tag>
        ) : (
          <Tag color={getStatusColor(status)} style={{ margin: 0, fontSize: 11 }}>
            {status}
          </Tag>
        )}
      </div>
      <Typography.Text
        type="secondary"
        style={{
          fontSize: 11,
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {result.requestSnapshot?.url}
      </Typography.Text>
      <Typography.Text type="secondary" style={{ fontSize: 11 }}>
        {result.label} · {result.duration}ms
        {result.size > 0 ? `  ·  ${formatSize(result.size)}` : ''}
      </Typography.Text>
    </div>
  )
}

// ─── run view ─────────────────────────────────────────────────────────────────

const StatItem = ({ label, value }) => (
  <div>
    <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
      {label}
    </Typography.Text>
    <Typography.Text strong style={{ fontSize: 15 }}>
      {value}
    </Typography.Text>
  </div>
)

const RunView = ({ record }) => {
  const [phase, setPhase] = useState('idle')
  const [delay, setDelay] = useState(0)
  const [csvData, setCsvData] = useState(null)
  const [results, setResults] = useState([])
  const resultsAccRef = useRef([])
  const flushTimerRef = useRef(null)
  const [selectedKey, setSelectedKey] = useState(null)
  const [filter, setFilter] = useState('all')
  const [totalDuration, setTotalDuration] = useState(0)

  const allText = [record.url, record.body, record.headers].join(' ')
  const detectedVars = [...new Set(detectVars(allText))]
  const totalExpected = csvData?.rows.length ?? 0
  const progress = totalExpected > 0 ? Math.round((results.length / totalExpected) * 100) : 0

  const successCount = results.filter((r) => !r.error && r.status >= 200 && r.status < 300).length
  const errorCount = results.filter((r) => r.error || (r.status && r.status >= 400)).length
  const avgDuration = results.length
    ? Math.round(results.reduce((s, r) => s + r.duration, 0) / results.length)
    : 0

  const handleCSVUpload = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const parsed = parseCSV(e.target.result)
      if (parsed.rows.length === 0) return
      setCsvData(parsed)
      setResults([])
    }
    reader.readAsText(file)
    return false
  }

  const handleRun = async () => {
    setPhase('running')
    setResults([])
    resultsAccRef.current = []
    if (flushTimerRef.current) clearInterval(flushTimerRef.current)
    setSelectedKey(null)
    setFilter('all')
    const runStart = Date.now()

    const reqs = csvData.rows.map((row, i) => ({ idx: i, vars: row, label: `Row ${i + 1}` }))

    // Flush accumulated results to state at most every 200ms to avoid O(n²) re-renders
    flushTimerRef.current = setInterval(() => {
      setResults(resultsAccRef.current.slice())
    }, 200)

    for (let i = 0; i < reqs.length; i++) {
      const req = reqs[i]
      if (i > 0 && delay > 0) await new Promise((r) => setTimeout(r, delay))

      const sub = substituteVars(record, req.vars)

      const [res] = await apiCollectionRepo.run({
        url: sub.url,
        method: record.method,
        headers: sub.headers,
        body: sub.body,
        iterations: 1
      })

      resultsAccRef.current.push({
        ...res,
        _key: req.idx,
        label: req.label,
        title: record.title,
        rowData: req.vars,
        requestSnapshot: {
          url: sub.url,
          method: record.method,
          headers: sub.headers,
          body: sub.body
        }
      })
      if (resultsAccRef.current.length === 1) setSelectedKey(0)
    }

    clearInterval(flushTimerRef.current)
    flushTimerRef.current = null
    // Final flush with stable reference
    const finalResults = resultsAccRef.current.slice()
    setResults(finalResults)
    setTotalDuration(Date.now() - runStart)
    setPhase('done')
  }

  const filteredResults = useMemo(() => {
    if (filter === 'success')
      return results.filter((r) => !r.error && r.status >= 200 && r.status < 300)
    if (filter === 'failed') return results.filter((r) => r.error || (r.status && r.status >= 400))
    return results
  }, [results, filter])

  const selectedResult = useMemo(
    () => (selectedKey != null ? (results.find((r) => r._key === selectedKey) ?? null) : null),
    [results, selectedKey]
  )

  const resultListRef = useRef(null)
  const rowVirtualizer = useVirtualizer({
    count: filteredResults.length,
    getScrollElement: () => resultListRef.current,
    estimateSize: () => 58,
    overscan: 10
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 12,
          flexShrink: 0,
          flexWrap: 'wrap'
        }}
      >
        {detectedVars.length > 0 && phase === 'idle' && (
          <Alert
            type="info"
            style={{ flex: 1, minWidth: 0 }}
            message={
              <span style={{ fontSize: 12 }}>
                Variables:{' '}
                {detectedVars.map((v) => (
                  <Tag key={v} style={{ fontFamily: 'monospace', fontSize: 11 }}>{`{{${v}}}`}</Tag>
                ))}
              </span>
            }
          />
        )}
        {csvData ? (
          <Space>
            <Tag color="blue" style={{ padding: '3px 8px' }}>
              CSV · {csvData.rows.length} rows · {csvData.columns.join(', ')}
            </Tag>
            <Button
              size="small"
              icon={<X size={12} />}
              onClick={() => {
                setCsvData(null)
                setDelay(0)
                setResults([])
                setSelectedKey(null)
                setFilter('all')
                setPhase('idle')
              }}
            >
              Clear
            </Button>
          </Space>
        ) : (
          <>
            <Upload accept=".csv" showUploadList={false} beforeUpload={handleCSVUpload}>
              <Button icon={<FileUp size={14} />}>Upload CSV</Button>
            </Upload>
            <InputNumber
              min={0}
              max={30000}
              value={delay}
              onChange={setDelay}
              addonBefore="Delay"
              addonAfter="ms"
              style={{ width: 190 }}
            />
          </>
        )}
        <Tooltip title={!csvData ? 'Upload a CSV file to run' : undefined}>
          <Button
            type="primary"
            icon={<Play size={14} />}
            loading={phase === 'running'}
            disabled={!csvData}
            onClick={handleRun}
          >
            {csvData ? `Run (${csvData.rows.length} rows)` : 'Run'}
          </Button>
        </Tooltip>
      </div>

      {/* Progress */}
      {phase === 'running' && (
        <Progress
          percent={progress}
          status="active"
          format={() => `${results.length} / ${totalExpected}`}
          style={{ marginBottom: 10, flexShrink: 0 }}
        />
      )}

      {/* Stats */}
      {(phase === 'running' || phase === 'done') && (
        <div style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 48, padding: '10px 0' }}>
            <StatItem label="Requests" value={totalExpected} />
            <StatItem label="Duration" value={phase === 'done' ? `${totalDuration}ms` : '…'} />
            <StatItem label="Errors" value={errorCount} />
            <StatItem label="Avg Resp. Time" value={results.length ? `${avgDuration}ms` : '…'} />
          </div>
          <Divider style={{ margin: '6px 0' }} />
        </div>
      )}

      {/* Filter tabs + split pane */}
      {results.length > 0 && (
        <>
          {/* Filter */}
          <div style={{ display: 'flex', gap: 2, marginBottom: 8, flexShrink: 0 }}>
            {[
              { key: 'all', label: 'All', count: results.length },
              { key: 'success', label: 'Passed', count: successCount },
              { key: 'failed', label: 'Failed', count: errorCount }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  padding: '4px 12px',
                  fontSize: 13,
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  borderBottom: filter === key ? '2px solid #1677ff' : '2px solid transparent',
                  color: filter === key ? '#1677ff' : undefined,
                  fontWeight: filter === key ? 500 : 400,
                  outline: 'none'
                }}
              >
                {label} <span style={{ opacity: 0.7 }}>{count}</span>
              </button>
            ))}
          </div>

          {/* Split pane */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 6
            }}
          >
            {/* Left: result list — virtualised */}
            <div
              ref={resultListRef}
              style={{
                width: 360,
                flexShrink: 0,
                overflowY: 'auto',
                borderRight: '1px solid rgba(0,0,0,0.08)'
              }}
            >
              <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map((vRow) => {
                  const result = filteredResults[vRow.index]
                  return (
                    <div
                      key={result._key}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${vRow.start}px)`
                      }}
                    >
                      <ResultListItem
                        result={result}
                        selected={selectedKey === result._key}
                        onClick={() => setSelectedKey(result._key)}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right: detail */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <DetailPanel result={selectedResult} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── sidebar entry item ───────────────────────────────────────────────────────

const EntryListItem = ({ entry, selected, onSelect, onEdit, onDelete }) => (
  <div
    onClick={() => onSelect(entry)}
    style={{
      padding: '9px 12px',
      cursor: 'pointer',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      borderLeft: `3px solid ${selected ? '#1677ff' : 'transparent'}`,
      background: selected ? 'rgba(22,119,255,0.06)' : 'transparent',
      transition: 'background 0.1s'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
      <Tag
        color={METHOD_COLORS[entry.method] || 'default'}
        style={{ margin: 0, fontSize: 10, lineHeight: '16px', padding: '0 5px' }}
      >
        {entry.method}
      </Tag>
      <Typography.Text
        style={{ flex: 1, fontSize: 12, fontWeight: 500, minWidth: 0 }}
        ellipsis={{ tooltip: entry.title }}
      >
        {entry.title}
      </Typography.Text>
      <Space size={0} onClick={(e) => e.stopPropagation()}>
        <Tooltip title="Edit">
          <Button
            type="text"
            size="small"
            icon={<Pencil size={12} />}
            onClick={() => onEdit(entry)}
          />
        </Tooltip>
        <Tooltip title="Delete">
          <Button
            type="text"
            size="small"
            danger
            icon={<Trash2 size={12} />}
            onClick={() => onDelete(entry)}
          />
        </Tooltip>
      </Space>
    </div>
    <Typography.Text
      type="secondary"
      style={{
        fontSize: 11,
        display: 'block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}
    >
      {entry.url}
    </Typography.Text>
  </div>
)

// ─── curl import section ──────────────────────────────────────────────────────

const CurlImportSection = ({ onParse }) => {
  const [curlInput, setCurlInput] = useState('')
  return (
    <div style={{ background: 'rgba(0,0,0,0.04)', borderRadius: 6, padding: 12, marginBottom: 16 }}>
      <Typography.Text strong style={{ display: 'block', marginBottom: 6 }}>
        Import from cURL
      </Typography.Text>
      <Input.TextArea
        rows={10}
        placeholder={
          'curl -X POST https://api.example.com/data \\\n  -H \'Content-Type: application/json\' \\\n  -d \'{"key": "value"}\''
        }
        value={curlInput}
        onChange={(e) => setCurlInput(e.target.value)}
        style={{ fontFamily: 'monospace', fontSize: 12 }}
      />
      <Button
        size="small"
        style={{ marginTop: 8 }}
        onClick={() => {
          onParse(curlInput)
          setCurlInput('')
        }}
        disabled={!curlInput.trim()}
      >
        Parse &amp; Fill
      </Button>
    </div>
  )
}

// ─── edit modal ───────────────────────────────────────────────────────────────

const EditModal = ({ record, onCancel, onFinish }) => {
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('manual')
  const method = Form.useWatch('method', form)

  useEffect(() => {
    if (record.id) {
      form.setFieldsValue({
        title: record.title,
        method: record.method,
        url: record.url,
        headers: JSON.parse(record.headers || '[]'),
        body: record.body
      })
    } else {
      form.resetFields()
      form.setFieldsValue({ method: 'GET', headers: [] })
    }
    setActiveTab('manual')
  }, [record, form])

  const handleParseCurl = (curlStr) => {
    const p = parseCurl(curlStr)
    form.setFieldsValue({ method: p.method, url: p.url, headers: p.headers, body: p.body })
    setActiveTab('manual')
  }

  const showBody = ['POST', 'PUT', 'PATCH'].includes(method)

  const manualTab = (
    <Form
      form={form}
      layout="vertical"
      requiredMark={false}
      onFinish={(v) => onFinish({ ...v, id: record.id })}
    >
      <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Required' }]}>
        <Input placeholder="e.g., Create User" />
      </Form.Item>
      <Space.Compact style={{ width: '100%' }}>
        <Form.Item
          name="method"
          label="Method"
          rules={[{ required: true }]}
          style={{ width: 130, marginBottom: 16 }}
        >
          <Select>
            {HTTP_METHODS.map((m) => (
              <Select.Option key={m} value={m}>
                <Tag color={METHOD_COLORS[m]}>{m}</Tag>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="url"
          label="URL"
          rules={[{ required: true, message: 'Required' }]}
          style={{ flex: 1, marginBottom: 16 }}
        >
          <Input placeholder="https://api.example.com/endpoint" />
        </Form.Item>
      </Space.Compact>
      <Form.Item label="Headers">
        <Form.List name="headers">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name }) => (
                <div key={key} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <Form.Item name={[name, 'key']} style={{ flex: 1, marginBottom: 0 }}>
                    <Input placeholder="Header name" />
                  </Form.Item>
                  <Form.Item name={[name, 'value']} style={{ flex: 2, marginBottom: 0 }}>
                    <Input placeholder="Value" />
                  </Form.Item>
                  <Tooltip title="Remove">
                    <Button
                      type="text"
                      danger
                      icon={<Trash2 size={14} />}
                      onClick={() => remove(name)}
                    />
                  </Tooltip>
                </div>
              ))}
              <Button type="dashed" size="small" icon={<Plus size={14} />} onClick={() => add()}>
                Add Header
              </Button>
            </>
          )}
        </Form.List>
      </Form.Item>
      {showBody && (
        <Form.Item name="body" label="Body">
          <CodeEditor />
        </Form.Item>
      )}
      <SubmitBtnForm />
    </Form>
  )

  const curlTab = (
    <div>
      <CurlImportSection onParse={handleParseCurl} />
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        Parsing will fill the Manual Configure tab and switch to it automatically.
      </Typography.Text>
    </div>
  )

  return (
    <Modal
      title={record.id ? 'Edit Request' : 'New Request'}
      open
      footer={null}
      onCancel={onCancel}
      width={640}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'manual', label: 'Manual Configure', children: manualTab },
          { key: 'curl', label: 'By cURL', children: curlTab }
        ]}
      />
    </Modal>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

const ApiCollectionPageWOC = ({ renderSuccessNotification }) => {
  const [entries, setEntries] = useState([])
  const [editingRecord, setEditingRecord] = useState(null)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    const data = await apiCollectionRepo.getAll()
    setEntries(data)
  }

  useEffect(() => {
    setLoading(true)
    loadData().finally(() => setLoading(false))
  }, [])

  const handleDelete = async (record) => {
    await apiCollectionRepo.delete(record.id)
    if (selectedEntry?.id === record.id) setSelectedEntry(null)
    loadData()
    renderSuccessNotification({ message: 'Request deleted' })
  }

  const handleFinish = async (values) => {
    await apiCollectionRepo.upsert(values)
    setEditingRecord(null)
    loadData()
    renderSuccessNotification({ message: `Request ${values.id ? 'updated' : 'saved'}` })
  }

  const filteredEntries = entries.filter(
    (e) =>
      !searchText ||
      e.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      e.url?.toLowerCase().includes(searchText.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <PageHeader
        title="API Collection"
        description="Save and run HTTP requests with iteration support. Import from cURL to get started quickly."
      />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left sidebar */}
        <div
          style={{
            width: 280,
            flexShrink: 0,
            borderRight: '1px solid rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Sidebar header */}
          <div
            style={{
              padding: '10px 10px',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              display: 'flex',
              gap: 8,
              flexShrink: 0
            }}
          >
            <Input
              placeholder="Search requests..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="small"
              style={{ flex: 1 }}
              allowClear
            />
            <Tooltip title="New request">
              <Button
                type="primary"
                size="small"
                icon={<Plus size={14} />}
                onClick={() => setEditingRecord({})}
              />
            </Tooltip>
          </div>

          {/* Entry list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 16, textAlign: 'center' }}>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Loading…
                </Typography.Text>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div style={{ padding: 16, textAlign: 'center' }}>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {searchText ? 'No matches' : 'No requests yet. Click + to add one.'}
                </Typography.Text>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <EntryListItem
                  key={entry.id}
                  entry={entry}
                  selected={selectedEntry?.id === entry.id}
                  onSelect={setSelectedEntry}
                  onEdit={setEditingRecord}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>

        {/* Right pane */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '16px 20px' }}>
          {selectedEntry ? (
            <RunView key={selectedEntry.id} record={selectedEntry} />
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography.Text type="secondary">
                ← Select a request from the list to run it
              </Typography.Text>
            </div>
          )}
        </div>
      </div>

      {editingRecord !== null && (
        <EditModal
          record={editingRecord}
          onCancel={() => setEditingRecord(null)}
          onFinish={handleFinish}
        />
      )}
    </div>
  )
}

const ApiCollectionPage = withNotification(ApiCollectionPageWOC)
export default ApiCollectionPage
