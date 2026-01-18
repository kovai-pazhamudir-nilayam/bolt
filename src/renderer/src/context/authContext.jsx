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
  // Hardcoded credentials
  const HARDCODED_PHONE = '9999999999'
  const HARDCODED_PASSWORD = 'admin'

  const login = (phone, password) => {
    return new Promise((resolve, reject) => {
      // Simulate validation
      if (phone === HARDCODED_PHONE && password === HARDCODED_PASSWORD) {
        const fakeUser = {
          name: 'Admin User',
          phone: phone,
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
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
