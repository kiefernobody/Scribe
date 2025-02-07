import type React from "react"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { UserProvider } from "@/contexts/UserContext"
import { GuidedWorkspaceProvider } from "@/contexts/GuidedWorkspaceContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <UserProvider>
        <GuidedWorkspaceProvider>{children}</GuidedWorkspaceProvider>
      </UserProvider>
    </ErrorBoundary>
  )
}

