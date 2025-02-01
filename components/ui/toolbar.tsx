import type React from "react"
import { cn } from "@/lib/utils"

interface ToolbarProps {
  children: React.ReactNode
  className?: string
}

export const Toolbar: React.FC<ToolbarProps> = ({ children, className }) => {
  return <div className={cn("flex items-center space-x-2 p-2 bg-secondary", className)}>{children}</div>
}

