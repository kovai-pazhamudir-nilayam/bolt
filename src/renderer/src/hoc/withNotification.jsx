import { notification } from 'antd'
import { nameHOC } from './hoc-utils'

const withNotification = (WrappedComponent) => {
  const ComponentwithNotification = (props) => {
    const [api, contextHolder] = notification.useNotification()
    return (
      <div>
        {contextHolder}
        <WrappedComponent
          {...props}
          renderErrorNotification={api.error}
          renderSuccessNotification={api.success}
        />
      </div>
    )
  }

  ComponentwithNotification.displayName = nameHOC(WrappedComponent, 'withNotification')

  return ComponentwithNotification
}
export default withNotification
