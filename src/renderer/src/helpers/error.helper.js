/**
 * Render error notifications.
 *
 * @param {Array<{ message: string }>} [errors=[]] - An array of error objects.
 * @param {Object} api - The notification API from useNotification hook
 */

export const renderErrorNotification = (errors = [], api) => {
  if (!api) return

  errors?.forEach((errorMessage) => {
    const errorTitle = errorMessage.title ? errorMessage.title : 'Internal Server Error'
    const description = errorMessage.message ? errorMessage.message : 'No message'

    api.error({
      message: `${errorTitle} - ${description}`,
      placement: 'topRight',
      duration: 5
    })
  })
}
