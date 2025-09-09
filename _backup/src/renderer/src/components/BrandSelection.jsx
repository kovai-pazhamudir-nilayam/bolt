import { Dropdown, Button } from 'antd'
import { useMasterDataContext } from '../context/masterDataContext'

const BrandSelection = () => {
  // Deprecated: use MasterSelectionModal instead
  const { companies } = useMasterDataContext()
  const items = (companies || []).map((c) => ({ key: c.code, label: c.name || c.code }))

  return (
    <Dropdown menu={{ items }} placement="bottomLeft" trigger={['click']}>
      <Button style={{ marginLeft: 8 }}>Select Company</Button>
    </Dropdown>
  )
}

export default BrandSelection
