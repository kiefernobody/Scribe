"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface UserContextType {
  userId: string | null
  setUserId: (id: string | null) => void
}

const UserContext = createContext<UserContextType>({
  userId: null,
  setUserId: () => {},
})

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Load user ID from localStorage on mount
    const storedUserId = localStorage.getItem('userId')
    if (storedUserId) {
      setUserId(storedUserId)
    }
  }, [])

  // Update localStorage when userId changes
  useEffect(() => {
    if (userId) {
      localStorage.setItem('userId', userId)
    } else {
      localStorage.removeItem('userId')
    }
  }, [userId])

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)

