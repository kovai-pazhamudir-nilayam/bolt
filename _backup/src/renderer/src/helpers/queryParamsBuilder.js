import _ from 'lodash'

const buildQueryParams = (query) => {
  const queryParams = Object.keys(query)
    .filter((key) => {
      return !_.isEmpty(query[key])
    })
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
    .join('&')

  return queryParams
}

export default buildQueryParams
