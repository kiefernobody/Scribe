import type React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CustomButtonProps extends ButtonProps {
  isIcon?: boolean
}

export const CustomButton: React.FC<CustomButtonProps> = ({ children, className, isIcon = false, ...props }) => {
  return (
    <Button
      className={cn(
        "bg-dark-gray text-light-gray hover:bg-primary hover:text-primary-foreground",
        isIcon ? "!h-10 !w-10 !p-0 flex items-center justify-center" : "px-3 py-2",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

