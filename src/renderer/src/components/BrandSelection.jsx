import { Dropdown, Button } from 'antd'
import kpnLogo from '../assets/kpn.svg'
import iboLogo from '../assets/ibo.svg'
import savoLogo from '../assets/savo.png'

const BRAND_ITEMS = [
  {
    key: 'KPN',
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src={kpnLogo} alt="KPN" style={{ width: 20, height: 20, objectFit: 'contain' }} />
        KPN
      </span>
    )
  },
  {
    key: 'IBO',
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src={iboLogo} alt="IBO" style={{ width: 20, height: 20, objectFit: 'contain' }} />
        IBO
      </span>
    )
  },
  {
    key: 'EBONO',
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src={savoLogo} alt="EBONO" style={{ width: 20, height: 20, objectFit: 'contain' }} />
        EBONO
      </span>
    )
  }
]

const BrandSelection = () => {
  return (
    <Dropdown menu={{ items: BRAND_ITEMS }} placement="bottomLeft" trigger={['click']}>
      <Button style={{ marginLeft: 8 }}>Select Brand</Button>
    </Dropdown>
  )
}

export default BrandSelection
