"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import LoadingScreen from "@/components/LoadingScreen"
import { ErrorBoundary } from "@/components/ErrorBoundary"

const WorkspaceClient = dynamic(() => import("@/components/WorkspaceClient"), {
  loading: () => <LoadingScreen />,
  ssr: false,
})

export default function WorkspacePage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <WorkspaceClient />
      </Suspense>
    </ErrorBoundary>
  )
}

