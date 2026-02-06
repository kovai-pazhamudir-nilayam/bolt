import { Search } from 'lucide-react'
import { Input, List, Modal } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './CommandPalette.less'

const CommandPalette = ({ ROUTES }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()

  // Flatten the menu config into a searchable list of routes
  // Flatten the menu config into a searchable list of routes
  const searchableRoutes = useMemo(() => {
    const routes = []

    const processRoutes = (items, parentPath = '') => {
      items.forEach((item) => {
        let currentPath

        // 1. Resolve Path
        if (item.index) {
          currentPath = parentPath
        } else if (item.path) {
          const cleanParent = parentPath === '/' ? '' : parentPath.replace(/\/$/, '')
          const cleanChild = item.path.startsWith('/') ? item.path.slice(1) : item.path
          currentPath = `${cleanParent}/${cleanChild}`
        } else {
          // Grouping node (no path): pass parent path to children
          if (item.children) processRoutes(item.children, parentPath)
          return
        }

        // Ensure absolute path
        if (!currentPath.startsWith('/')) currentPath = '/' + currentPath

        // 2. Validate & Add
        if (item.label) {
          routes.push({
            label: item.label,
            path: currentPath,
            icon: item.icon
          })
        }

        // 3. Recurse
        if (item.children) {
          processRoutes(item.children, currentPath)
        }
      })
    }

    processRoutes(ROUTES)
    return routes
  }, [])

  // Filter routes based on search query
  const filteredRoutes = useMemo(() => {
    if (!searchQuery) return searchableRoutes
    const lowerQuery = searchQuery.toLowerCase()
    return searchableRoutes.filter(
      (route) =>
        route.label.toLowerCase().includes(lowerQuery) ||
        route.path.toLowerCase().includes(lowerQuery)
    )
  }, [searchQuery, searchableRoutes])

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + K or Cmd + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
        setSearchQuery('')
        setSelectedIndex(0)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSelect = (route) => {
    navigate(route.path)
    setIsOpen(false)
  }

  const handleKeyDownInInput = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % filteredRoutes.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filteredRoutes.length) % filteredRoutes.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredRoutes[selectedIndex]) {
        handleSelect(filteredRoutes[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  // Auto-scroll to active item if needed
  const itemRefs = React.useRef({})

  useEffect(() => {
    // Clear refs when routes change to avoid stale references
    itemRefs.current = {}
  }, [filteredRoutes])

  useEffect(() => {
    const activeItem = itemRefs.current[selectedIndex]
    if (activeItem) {
      activeItem.scrollIntoView({
        block: 'nearest',
        behavior: 'auto'
      })
    }
  }, [selectedIndex])

  const inputRef = React.useRef(null)

  useEffect(() => {
    if (isOpen) {
      // Small timeout to ensure modal is rendered
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  return (
    <Modal
      open={isOpen}
      onCancel={() => setIsOpen(false)}
      footer={
        <div className="command-palette-footer">
          <span>
            <span className="key-hint">↵</span> to select
          </span>
          <span>
            <span className="key-hint">↑</span> <span className="key-hint">↓</span> to navigate
          </span>
          <span>
            <span className="key-hint">esc</span> to close
          </span>
        </div>
      }
      closable={false}
      className="command-palette-modal"
      width={600}
      destroyOnHidden
    >
      <div className="command-palette-search">
        <Input
          ref={inputRef}
          prefix={<Search size={16} style={{ color: '#ccc' }} />}
          placeholder="Type a command or search..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setSelectedIndex(0)
          }}
          onKeyDown={handleKeyDownInInput}
        />
      </div>
      <div className="command-palette-list">
        <List
          dataSource={filteredRoutes}
          renderItem={(item, index) => (
            <List.Item
              className={index === selectedIndex ? 'active' : ''}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="palette-item-content" ref={(el) => (itemRefs.current[index] = el)}>
                <div className="palette-item-text">
                  <div className="palette-item-label">{item.label}</div>
                  <div className="palette-item-path">{item.path}</div>
                </div>
                {index === selectedIndex && (
                  <div className="palette-item-arrow">
                    <u style={{ textDecoration: 'none' }}>↵</u>
                  </div>
                )}
              </div>
            </List.Item>
          )}
          locale={{ emptyText: 'No matching commands found' }}
        />
      </div>
    </Modal>
  )
}

export default CommandPalette
