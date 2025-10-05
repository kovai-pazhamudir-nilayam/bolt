

import { Button, Col, Row, Tooltip, Tree } from 'antd'
import { EyeOff, FolderPlus } from 'lucide-react'
import { useRef, useState } from 'react'
import LogsViewer from '../../components/LogsViewer/LogsViewer'
import PageHeader from '../../components/PageHeader/PageHeader'
import withNotification from '../../hoc/withNotification'
import { systemFactory } from '../../repos/system.repo'
import { toolsPageFactory } from '../../repos/toolsPage.repo'

const { systemRepo } = systemFactory()
const { pageBuilderRepo } = toolsPageFactory()

const buildTree = (config) => {
  const parents = []
  const leaves = []

  config.forEach((item) => {
    const hasChildrenArray = item.children && Array.isArray(item.children)
    if (hasChildrenArray) {
      parents.push(item)
    } else {
      leaves.push(item)
    }
  })

  parents.sort((a, b) => a.label.localeCompare(b.label))
  leaves.sort((a, b) => a.label.localeCompare(b.label))

  const sortedConfig = [...parents, ...leaves]

  return sortedConfig.map((item, index) => {
    const isParent = item.children && item.children.length > 0
    return {
      title: (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>
            {item.label} {item?.hideInMenu && <EyeOff size={16} />}
          </span>
          {isParent && (
            <Tooltip title={`Add child to "${item.label}"`}>
              <Button
                type="link"
                icon={<FolderPlus size={16} />}
                onClick={(e) => {
                  e.stopPropagation()
                }}
              />
            </Tooltip>
          )}
        </div>
      ),
      key: `${item.path}-${index}`,
      icon: null, //isParent ? <FolderOutlined /> : null,
      children: isParent ? buildTree(item.children) : null,
      isParent: isParent
    }
  })
}

const PageBuilderPageWOC = ({ renderErrorNotification }) => {
  const [folderPath, setFolderPath] = useState('')
  const [logs, setLogs] = useState([])
  const logRef = useRef(null)
  const [routes, setRoutes] = useState([])

  const handleSelectFolder = async () => {
    const path = await systemRepo.selectFolder()
    if (path) {
      setFolderPath(path)
      try {
        const data = await pageBuilderRepo.getAll(path)
        setRoutes(buildTree(data))
      } catch (error) {
        console.error('Error fetching page data:', error)
        renderErrorNotification({
          error: error.message
        })
      }
    } else {
      renderErrorNotification({
        error: 'No folder selected'
      })
    }
  }

  return (
    <div>
      <PageHeader
        title="Command Center Page Builder"
        description="Use the page builder to create pages for your command center"
      />
      <Row gutter={[16, 16]}>
        <Col lg={10} xs={24}>
          <Row gutter={[16, 16]}>
            <Col>
              <strong>Select a Command Center folder to generated pages:</strong>
            </Col>
            <Col>
              <Button type="primary" onClick={handleSelectFolder}>
                Select Folder
              </Button>
              {folderPath && (
                <div style={{ marginTop: 8, wordBreak: 'break-all', fontSize: 12 }}>
                  <b>Selected folder:</b> {folderPath}
                </div>
              )}
            </Col>
            <Col>
              <Tree showIcon defaultExpandAll treeData={routes} style={{ padding: '0 8px' }} />
            </Col>
          </Row>
        </Col>
        <Col lg={14} xs={24}>
          <LogsViewer logRef={logRef} logs={logs} />
        </Col>
      </Row>
    </div>
  )
}

const PageBuilderPage = withNotification(PageBuilderPageWOC)

export default PageBuilderPage
