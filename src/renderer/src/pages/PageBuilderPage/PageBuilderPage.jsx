/* eslint-disable react/prop-types */

import { Button, Col, Row, message } from 'antd'
import { useRef, useState } from 'react'
import LogsViewer from '../../components/LogsViewer/LogsViewer'
import PageHeader from '../../components/PageHeader/PageHeader'
import { systemFactory } from '../../repos/system.repo'
import { toolsPageFactory } from '../../repos/toolsPage.repo'
const { systemRepo } = systemFactory()
const { pageBuilderRepo } = toolsPageFactory()

const PageBuilderPage = () => {
  const [folderPath, setFolderPath] = useState('')
  const [logs, setLogs] = useState([])
  const logRef = useRef(null)

  const handleSelectFolder = async () => {
    const path = await systemRepo.selectFolder()
    if (path) {
      setFolderPath(path)
      await pageBuilderRepo.getAll(path)
    } else {
      message.warning('No folder selected')
    }
  }

  return (
    <div>
      <PageHeader
        title="Page Builder"
        description="Use the page builder to create pages for your command center"
      />
      <Row gutter={[16, 16]}>
        <Col lg={10} xs={24}>
          <Row gutter={[16, 16]}>
            <Col>
              <h3>Select a folder to save generated pages:</h3>
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
          </Row>
        </Col>
        <Col lg={14} xs={24}>
          <LogsViewer logRef={logRef} logs={logs} />
        </Col>
      </Row>
    </div>
  )
}

export default PageBuilderPage
