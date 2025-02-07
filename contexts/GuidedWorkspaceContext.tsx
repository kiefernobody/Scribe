"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, type Dispatch, type SetStateAction } from "react"

interface GuidedWorkspaceContextType {
  isGuidedWorkspace: boolean
  setIsGuidedWorkspace: Dispatch<SetStateAction<boolean>>
}

const GuidedWorkspaceContext = createContext<GuidedWorkspaceContextType | undefined>(undefined)

export const GuidedWorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isGuidedWorkspace, setIsGuidedWorkspace] = useState(false)

  useEffect(() => {
    const storedValue = localStorage.getItem("isGuidedWorkspace")
    if (storedValue !== null) {
      setIsGuidedWorkspace(JSON.parse(storedValue))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("isGuidedWorkspace", JSON.stringify(isGuidedWorkspace))
  }, [isGuidedWorkspace])

  return (
    <GuidedWorkspaceContext.Provider value={{ isGuidedWorkspace, setIsGuidedWorkspace }}>
      {children}
    </GuidedWorkspaceContext.Provider>
  )
}

export const useGuidedWorkspace = () => {
  const context = useContext(GuidedWorkspaceContext)
  if (context === undefined) {
    throw new Error("useGuidedWorkspace must be used within a GuidedWorkspaceProvider")
  }
  return context
}
