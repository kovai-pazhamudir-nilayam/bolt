import { Button, Col, Form, Modal, Row, Space, Table, Tabs } from 'antd'
import SelectFormItem from '../../../components/SelectFormItem'
import { Download, Play, TableIcon, Terminal } from 'lucide-react'
import LogsViewer from '../../../components/LogsViewer/LogsViewer'

const SavedDBQueryResultModal = ({
  queryToRun,
  runForm,
  onRunSubmit,
  datasource,
  loading,
  queryResult,
  logs,
  logRef,
  downloadCSV,
  setIsRunModalOpen
}) => {
  return (
    <Modal
      title={`Run: ${queryToRun?.title}`}
      open
      onCancel={() => setIsRunModalOpen(false)}
      footer={null}
      width={900}
    >
      <Form form={runForm} onFinish={onRunSubmit} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col span={10}>
            <SelectFormItem
              options={datasource.companies}
              name="company_code"
              label="Company"
              transform="COMPANIES"
              placeholder="Select Company"
              loading={loading}
            />
          </Col>
          <Col span={10}>
            <SelectFormItem
              options={datasource.environments}
              name="env_code"
              label="Environment"
              transform="ENVIRONMENTS"
              placeholder="Select Environment"
              loading={loading}
            />
          </Col>
          <Col span={4}>
            <Form.Item label=" ">
              <Button type="primary" htmlType="submit" loading={loading} block icon={<Play />}>
                Run
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Tabs
        defaultActiveKey="results"
        style={{ marginTop: 16 }}
        items={[
          {
            key: 'results',
            label: (
              <Space>
                <TableIcon size={14} /> Results
              </Space>
            ),
            children: (
              <div>
                {queryResult && (
                  <Row justify={'end'}>
                    <Col>
                      <Button
                        icon={<Download size={14} />}
                        onClick={() => downloadCSV(queryResult)}
                        style={{ marginBottom: 8 }}
                      >
                        Download CSV
                      </Button>
                    </Col>
                  </Row>
                )}
                <Table
                  dataSource={queryResult?.dataSource || []}
                  columns={queryResult?.columns || []}
                  size="small"
                  scroll={{ x: 'max-content', y: 400 }}
                  pagination={{ size: 'small', pageSize: 10 }}
                  locale={{
                    emptyText: queryResult ? 'No data found' : 'Run query to see results'
                  }}
                />
              </div>
            )
          },
          {
            key: 'logs',
            label: (
              <Space>
                <Terminal size={14} /> Logs
              </Space>
            ),
            children: <LogsViewer logRef={logRef} logs={logs} height={400} />
          }
        ]}
      />
    </Modal>
  )
}

export default SavedDBQueryResultModal
