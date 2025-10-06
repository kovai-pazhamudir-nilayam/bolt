const userProfileAPI = {
  getAll: () => {},
  getByPhone: () => {},
  getByCompanyEnvironment: () => {},
  upsert: () => {},
  delete: () => {},
  updateFeatures: () => {}
}

const userProfileDB = {
  getAll: () => window.userProfileAPI.userProfile.getAll(),
  getByPhone: (phone_number) => window.userProfileAPI.userProfile.getByPhone(phone_number),
  getByCompanyEnvironment: (input) => window.userProfileAPI.userProfile.getByCompanyEnvironment(input),
  upsert: (input) => window.userProfileAPI.userProfile.upsert(input),
  delete: (phone_number) => window.userProfileAPI.userProfile.delete(phone_number),
  updateFeatures: (input) => window.userProfileAPI.userProfile.updateFeatures(input)
}

const userProfileFactory = () => {
  const mode = window.runtimeConfig?.mode || 'local'
  if (mode === 'api') {
    return {
      userProfileRepo: userProfileAPI
    }
  }
  return {
    userProfileRepo: userProfileDB
  }
}

export { userProfileFactory }
