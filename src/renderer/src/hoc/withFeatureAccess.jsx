import React from 'react'
import { Result, Button } from 'antd'
import { useFeatureConfig } from '../context/featureConfigContext'

/**
 * Higher-order component that wraps a page with feature access control
 * @param {React.Component} WrappedComponent - The component to wrap
 * @param {string} featureKey - The feature key to check access for
 * @param {string} requiredLevel - The required access level ('read' or 'write')
 * @param {React.Component} FallbackComponent - Optional custom fallback component
 */
const withFeatureAccess = (WrappedComponent, featureKey, requiredLevel = 'read', FallbackComponent = null) => {
  return function FeatureAccessWrapper(props) {
    const { hasFeatureAccess, isFeatureHidden, isFeatureReadOnly, superadminMode } = useFeatureConfig()

    // Check if feature is hidden
    if (isFeatureHidden(featureKey)) {
      if (FallbackComponent) {
        return <FallbackComponent {...props} />
      }
      
      return (
        <Result
          status="404"
          title="Feature Not Available"
          subTitle="This feature is currently disabled and not accessible."
        />
      )
    }

    // Check if user has required access level
    if (!hasFeatureAccess(featureKey, requiredLevel)) {
      if (FallbackComponent) {
        return <FallbackComponent {...props} />
      }

      return (
        <Result
          status="403"
          title="Access Denied"
          subTitle="You don't have permission to access this feature."
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              Go Back
            </Button>
          }
        />
      )
    }

    // Check if feature is read-only and user is trying to perform write operations
    const isReadOnly = isFeatureReadOnly(featureKey) && requiredLevel === 'write'
    if (isReadOnly && !superadminMode) {
      if (FallbackComponent) {
        return <FallbackComponent {...props} />
      }

      return (
        <Result
          status="403"
          title="Read-Only Mode"
          subTitle="This feature is currently in read-only mode. You can view data but cannot make changes."
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              Go Back
            </Button>
          }
        />
      )
    }

    // Pass feature access information as props to the wrapped component
    return (
      <WrappedComponent
        {...props}
        featureAccess={{
          isReadOnly: isFeatureReadOnly(featureKey),
          isHidden: isFeatureHidden(featureKey),
          hasWriteAccess: hasFeatureAccess(featureKey, 'write'),
          hasReadAccess: hasFeatureAccess(featureKey, 'read'),
          superadminMode
        }}
      />
    )
  }
}

export default withFeatureAccess
