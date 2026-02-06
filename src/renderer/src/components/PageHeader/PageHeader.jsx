import { Divider, Typography } from 'antd'

const { Title, Text } = Typography
const PageHeader = ({ title, description }) => {
  return (
    <>
      <Title style={{ margin: 0 }} level={3}>
        {title}
      </Title>
      <Text type="secondary">{description}</Text>

      <Divider />
    </>
  )
}

export default PageHeader
