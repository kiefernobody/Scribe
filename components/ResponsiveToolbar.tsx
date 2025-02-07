"use client"

import type React from "react"
import { useState } from "react"
import { Menu } from "lucide-react"
import { CustomButton } from "@/components/ui/custom-button"
import { Toolbar } from "@/components/ui/toolbar"

interface ToolbarItem {
  key: string
  content: React.ReactNode
}

interface ResponsiveToolbarProps {
  leftItems?: ToolbarItem[]
  centerItems?: ToolbarItem[]
  rightItems?: ToolbarItem[]
  className?: string
  isMobileView: boolean
}

export const ResponsiveToolbar: React.FC<ResponsiveToolbarProps> = ({
  leftItems = [],
  centerItems = [],
  rightItems = [],
  className,
  isMobileView,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <Toolbar className={`justify-between bg-[#282828] w-full relative ${className}`}>
      {isMobileView ? (
        <>
          <CustomButton
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            className="!h-10 !w-10 !p-0 bg-dark-gray text-light-gray hover:bg-primary hover:text-primary-foreground"
          >
            <Menu className="h-6 w-6" />
          </CustomButton>
          {isMenuOpen && (
            <div className="absolute top-full left-0 w-full bg-[#282828] z-50 p-2 space-y-2">
              {[...leftItems, ...centerItems, ...rightItems].map((item) => (
                <div key={item.key} className="w-full">
                  {item.content}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center">
            {leftItems.map((item) => (
              <div key={item.key}>{item.content}</div>
            ))}
          </div>
          <div className="flex items-center justify-center flex-grow">
            {centerItems.map((item) => (
              <div key={item.key} className="mx-1">
                {item.content}
              </div>
            ))}
          </div>
          <div className="flex items-center">
            {rightItems.map((item) => (
              <div key={item.key}>{item.content}</div>
            ))}
          </div>
        </>
      )}
    </Toolbar>
  )
}

