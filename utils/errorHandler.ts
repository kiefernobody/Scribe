type ErrorSeverity = "low" | "medium" | "high"

interface ErrorLog {
  message: string
  severity: ErrorSeverity
  timestamp: Date
  stack?: string
  details?: string
  componentName?: string
  additionalInfo?: Record<string, unknown>
}

class ErrorHandler {
  private static instance: ErrorHandler
  private errorLogs: ErrorLog[] = []

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  public logError(
    message: string,
    severity: ErrorSeverity = "medium",
    error?: Error | unknown,
    componentName?: string,
    additionalInfo?: Record<string, unknown>,
  ) {
    const errorLog: ErrorLog = {
      message,
      severity,
      timestamp: new Date(),
      stack: error instanceof Error ? error.stack : undefined,
      details: error instanceof Error ? error.message : JSON.stringify(error),
      componentName,
      additionalInfo,
    }

    this.errorLogs.push(errorLog)
    console.error(`[${severity.toUpperCase()}] ${message}`, errorLog)

    // Here you could implement additional error handling logic,
    // such as sending errors to a backend service or displaying them to the user
    this.displayErrorToUser(errorLog)
  }

  private displayErrorToUser(errorLog: ErrorLog) {
    const errorMessage = `An error occurred${
      errorLog.componentName ? ` in ${errorLog.componentName}` : ""
    }: ${errorLog.message}. Please try again or refresh the page.`

    // You can implement a more sophisticated UI for displaying errors
    alert(errorMessage)
  }

  public getErrorLogs(): ErrorLog[] {
    return this.errorLogs
  }

  public clearErrorLogs(): void {
    this.errorLogs = []
  }
}

export const errorHandler = ErrorHandler.getInstance()

