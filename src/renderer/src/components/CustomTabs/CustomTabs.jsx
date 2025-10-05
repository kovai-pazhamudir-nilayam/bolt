
import { Tabs } from 'antd'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

const CustomTabsWOC = ({ items, tabBarExtraContent }) => {
  const updatedItems = items
    .map((item) => {
      return {
        ...item,
        label: <>{item.label}</>,
        hasTabAccess: true
      }
    })
    .filter(({ hasTabAccess }) => hasTabAccess)

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryString = searchParams.toString()
  const { hash } = useLocation()

  const [activeTab, setActiveTab] = useState(hash.slice(1) || items[0].key)

  const onChange = (key) => {
    const match = items.find((item) => item.key === key)
    const considerSearchParams = match?.considerSearchParams ?? true
    if (considerSearchParams) {
      const url = _.isEmpty(queryString) ? `#${key}` : `?${queryString}#${key}`
      navigate(url)
    } else {
      navigate(`#${key}`)
    }
  }

  useEffect(() => {
    setActiveTab(hash.slice(1) || items[0].key)
  }, [hash])

  return (
    <Tabs
      destroyOnHidden={true}
      activeKey={activeTab}
      items={updatedItems}
      onChange={onChange}
      tabBarExtraContent={tabBarExtraContent}
    />
  )
}

const CustomTabs = CustomTabsWOC
export default CustomTabs
