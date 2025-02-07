import { Component, type ErrorInfo, type ReactNode } from "react"
import { errorHandler } from "@/utils/errorHandler"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class EditorErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorInfoObj: Record<string, unknown> = {
      componentStack: errorInfo.componentStack,
      ...errorInfo
    }
    errorHandler.logError(error.message, "high", errorInfoObj)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full w-full p-4 bg-background text-foreground">
          <div className="w-full max-w-2xl bg-card rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4 text-primary">An error occurred in the editor</h1>
              <p className="mb-4 text-muted-foreground">
                We apologize for the inconvenience. Please try refreshing the page or contact support if the problem
                persists.
              </p>
              <ScrollArea className="h-64 w-full rounded border border-muted p-4 bg-muted/50">
                <details className="whitespace-pre-wrap text-sm">
                  <summary className="font-semibold cursor-pointer mb-2">Error details</summary>
                  <p className="mb-2">{this.state.error && this.state.error.toString()}</p>
                  {this.state.errorInfo && (
                    <>
                      <p className="font-semibold mt-4 mb-2">Component Stack:</p>
                      <pre className="text-xs overflow-x-auto">{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </details>
              </ScrollArea>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default EditorErrorBoundary

