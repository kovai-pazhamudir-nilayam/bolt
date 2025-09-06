export const renderSuccessNotification = ({ message, api }) => {
  if (api) {
    api.success({
      message: message,
      placement: 'topRight'
    })
  }
}
