import { Dropdown, Button } from 'antd'

const ENV_ITEMS = [
  {
    key: 'STAGING',
    label: 'Staging'
  },
  {
    key: 'PRODUCTION',
    label: 'Production'
  }
]

const EnvironmentSelection = () => (
  <Dropdown menu={{ items: ENV_ITEMS }} placement="bottomLeft" trigger={['click']}>
    <Button style={{ marginLeft: 8 }}>Select Environment</Button>
  </Dropdown>
)

export default EnvironmentSelection
