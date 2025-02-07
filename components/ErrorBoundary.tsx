"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { errorHandler } from "@/utils/errorHandler"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
    errorHandler.logError(error.message, "high", { error, ...errorInfo as Record<string, unknown> })
    this.setState({ error, errorInfo })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <details className="whitespace-pre-wrap">
            <summary>Error details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            Component Stack:
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      )
    }

    return this.props.children
  }
}
