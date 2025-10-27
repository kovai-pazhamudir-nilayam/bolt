const userProfileAPI = {
  getAll: () => {},
  getByPhone: () => {},
  getByCompanyEnvironment: () => {},
  upsert: () => {},
  delete: () => {},
  updateFeatures: () => {},
  getUserIdsByPhone: () => {},
  upsertUserIds: () => {},
  deleteUserIds: () => {}
}

const userProfileDB = {
  getAll: () => window.userProfileAPI.userProfile.getAll(),
  getByPhone: (phone_number) => window.userProfileAPI.userProfile.getByPhone(phone_number),
  getByCompanyEnvironment: (input) => window.userProfileAPI.userProfile.getByCompanyEnvironment(input),
  upsert: (input) => window.userProfileAPI.userProfile.upsert(input),
  delete: (phone_number) => window.userProfileAPI.userProfile.delete(phone_number),
  updateFeatures: (input) => window.userProfileAPI.userProfile.updateFeatures(input),
  getUserIdsByPhone: (phone_number) => window.userProfileAPI.userProfile.getUserIdsByPhone(phone_number),
  upsertUserIds: (input) => window.userProfileAPI.userProfile.upsertUserIds(input),
  deleteUserIds: (phone_number) => window.userProfileAPI.userProfile.deleteUserIds(phone_number)
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
