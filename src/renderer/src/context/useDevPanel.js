import { useContext } from 'react'
import { DevPanelContext } from './devPanelContext'

export const useDevPanel = () => useContext(DevPanelContext)
