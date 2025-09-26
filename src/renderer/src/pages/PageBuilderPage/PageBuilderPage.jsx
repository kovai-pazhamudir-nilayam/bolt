import CustomCard from '../../components/CustomCard/CustomCard'
import { EyeInvisibleOutlined, FolderAddOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Col, Form, Row, Space, Spin, Tooltip, Tree } from 'antd'
import { useEffect, useState } from 'react'
import PageManagerModal from './_blocks/PageManagerModal'

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      resolve(event.target.result) // file content as string
    }

    reader.onerror = (error) => {
      reject(error)
    }

    reader.readAsText(file)
  })
}

// Use a secure API key or environment variable in production
const API_KEY = 'your_strong_secret_key'

// Function to build a tree structure from the menu configuration
const buildTree = (config) => {
  // Separate items into two lists: with children and without children
  const parents = [] // Nodes that have a 'children' array
  const leaves = [] // Nodes that do not have a 'children' array (or it's an empty array)

  config.forEach((item) => {
    // A node is considered a 'parent' for sorting if it has a 'children' array
    // even if that array is currently empty. This allows newly created parents to be grouped.
    const hasChildrenArray = item.children && Array.isArray(item.children)
    if (hasChildrenArray) {
      parents.push(item)
    } else {
      leaves.push(item)
    }
  })

  // Sort parents and leaves alphabetically by label
  parents.sort((a, b) => a.label.localeCompare(b.label))
  leaves.sort((a, b) => a.label.localeCompare(b.label))

  // Combine them: parents first, then leaves (leaf nodes)
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
            {item.label} {item?.hideInMenu && <EyeInvisibleOutlined type="primary" />}
          </span>
          {isParent && (
            <Tooltip title={`Add child to "${item.label}"`}>
              <Button
                type="link"
                icon={<FolderAddOutlined />}
                onClick={(e) => {
                  e.stopPropagation() // Prevents tree node from expanding
                  showModal(item.path)
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

// State variables for the modal
let showModal

const PageBuilderPage = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [treeData, setTreeData] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isParentCreation, setIsParentCreation] = useState(false)
  const [selectedParentPath, setSelectedParentPath] = useState('')

  showModal = (parentPath = null) => {
    setIsModalVisible(true)
    if (parentPath) {
      setIsParentCreation(false)
      setSelectedParentPath(parentPath)
      form.setFieldsValue({ parentPath: parentPath })
    } else {
      setIsParentCreation(true)
      setSelectedParentPath('')
      form.resetFields()
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  const getCSVFileContent = async (values) => {
    const file = values.csvFile?.[0]?.originFileObj
    if (!file) return null
    const content = await readFileAsText(file)
    return content
  }

  const onFinish = async (values) => {
    setLoading(true)

    let CSVcontent = await getCSVFileContent(values)

    const payload = {
      ...values,
      ...(CSVcontent && { CSVcontent }),
      type: isParentCreation ? 'parent' : 'child',
      parentPath: isParentCreation ? '' : selectedParentPath
    }
    // try {
    //   await axios.post('http://localhost:3001/api/create-page', payload, {
    //     headers: {
    //       Authorization: `Bearer ${API_KEY}`
    //     }
    //   })
    //   message.success('Page created successfully! Please restart your React development server.')
    //   handleCancel()
    //   // Re-fetch or re-generate the tree data if necessary, or just inform the user to refresh
    //   window.location.reload()
    // } catch (error) {
    //   message.error(`Failed to create page: ${error.response?.data?.message || error.message}`)
    // } finally {
    //   setLoading(false)
    // }
  }

  useEffect(() => {
    // setTreeData(buildTree(sideMenuConfig))
    setTreeData([])
  }, [])

  return (
    <Space direction="vertical" style={{ display: 'flex' }}>
      <Row gutter={[16]} justify={'end'}>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
            Create New Parent Page
          </Button>
        </Col>
      </Row>
      <CustomCard title="Existing Pages">
        <Spin spinning={loading} tip="Creating files...">
          <Tree showIcon defaultExpandAll treeData={treeData} style={{ padding: '0 8px' }} />
        </Spin>
      </CustomCard>

      {isModalVisible && (
        <PageManagerModal
          isParentCreation={isParentCreation}
          selectedParentPath={selectedParentPath}
          handleCancel={handleCancel}
          loading={loading}
          onFinish={onFinish}
          form={form}
        />
      )}
    </Space>
  )
}

export default PageBuilderPage
