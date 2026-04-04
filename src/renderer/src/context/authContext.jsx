import { createContext, useContext, useState } from 'react'
import { message } from 'antd'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [previewRole, setPreviewRole] = useState(null)
  // Hardcoded credentials
  const HARDCODED_USERNAME = '9731203535'
  const HARDCODED_PASSWORD = 'P@ssw0rd@100'

  const login = (username, password) => {
    return new Promise((resolve, reject) => {
      if (username === HARDCODED_USERNAME && password === HARDCODED_PASSWORD) {
        const fakeUser = {
          name: 'Admin User',
          username: username,
          role: 'admin'
        }
        setUser(fakeUser)
        message.success('Login Successful')
        resolve(fakeUser)
      } else {
        reject(new Error('Invalid credentials'))
      }
    })
  }

  const logout = () => {
    setUser(null)
    message.info('Logged out')
  }

  const isAuthenticated = !!user

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    previewRole,
    setPreviewRole
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
