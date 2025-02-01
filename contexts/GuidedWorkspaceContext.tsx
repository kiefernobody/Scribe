import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"

interface GuidedWorkspaceContextType {
  isGuidedWorkspace: boolean
  setIsGuidedWorkspace: React.Dispatch<React.SetStateAction<boolean>>
}

const GuidedWorkspaceContext = createContext<GuidedWorkspaceContextType | undefined>(undefined)

export const GuidedWorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isGuidedWorkspace, setIsGuidedWorkspace] = useState(false)

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

