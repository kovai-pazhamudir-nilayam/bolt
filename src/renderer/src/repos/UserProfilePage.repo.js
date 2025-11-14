const userProfileAPI = {
  getAll: () => {},
  getByPhone: () => {},
  upsert: () => {},
  delete: () => {}
}

const userProfileDB = {
  getAll: () => window.userProfileAPI.userProfile.getAll(),
  getByPhone: (phone_number) => window.userProfileAPI.userProfile.getByPhone(phone_number),
  upsert: (input) => window.userProfileAPI.userProfile.upsert(input),
  delete: (phone_number) => window.userProfileAPI.userProfile.delete(phone_number)
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
