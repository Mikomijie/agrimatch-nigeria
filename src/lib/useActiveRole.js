import { useState, useEffect } from 'react'

export function useActiveRole() {
  const [activeRole, setActiveRole] = useState(() => {
    try {
      return localStorage.getItem('activeRole') || 'farmer'
    } catch {
      return 'farmer'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('activeRole', activeRole)
    } catch {
      // private/incognito mode — ignore
    }
  }, [activeRole])

  return [activeRole, setActiveRole]
}