import type React from "react"
import { useRef, useEffect } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface CustomDropdownProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  triggerContent: React.ReactNode
  dropdownContent: React.ReactNode
  className?: string
  expandDirection?: "left" | "right"
  dropdownClassName?: string
  onClose?: () => void
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  isOpen,
  setIsOpen,
  triggerContent,
  dropdownContent,
  className,
  expandDirection = "right",
  dropdownClassName,
  onClose,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        onClose?.()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, setIsOpen, onClose])

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  return (
    <div ref={dropdownRef} className={cn("relative h-full", className)}>
      <button
        className="bg-dark-gray text-light-gray rounded-lg px-3 py-2 text-sm flex items-center justify-between hover:bg-primary hover:text-primary-foreground w-full h-full transition-colors duration-200"
        onClick={handleToggle}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {triggerContent}
        {isOpen ? (
          <ChevronUp className="h-4 w-4 flex-shrink-0 ml-2" />
        ) : (
          <ChevronDown className="h-4 w-4 flex-shrink-0 ml-2" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn("absolute z-[100]", expandDirection === "left" ? "right-0" : "left-0", dropdownClassName)}
            style={{ top: "100%" }}
          >
            <div className="bg-background rounded-md shadow-lg overflow-hidden w-full">{dropdownContent}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

