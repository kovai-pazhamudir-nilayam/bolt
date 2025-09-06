import { Card } from 'antd'
import _ from 'lodash'
import './CustomCard.less'

const CustomCard = ({ title, children }) => {
  return (
    <Card className="CustomCard" size="small">
      {!_.isEmpty(title) && (
        <div className="CustomCard-title">
          <div>{title}</div>
        </div>
      )}
      <div>{children}</div>
    </Card>
  )
}

export default CustomCard
