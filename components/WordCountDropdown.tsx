"use client"

import React from "react"
import { CustomDropdown, CustomDropdownTrigger, CustomDropdownContent } from "@/components/ui/custom-dropdown"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Break } from "@/types/editor"
import { ChevronDown } from "lucide-react"

interface WordCountDropdownProps {
  totalWordCount: number
  breaks: Break[]
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  onClose?: () => void
}

export const WordCountDropdown: React.FC<WordCountDropdownProps> = ({
  totalWordCount,
  breaks,
  isOpen,
  setIsOpen,
  onClose,
}) => {
  return (
    <CustomDropdown open={isOpen} onOpenChange={setIsOpen}>
      <CustomDropdownTrigger className="flex items-center justify-between w-full bg-card hover:bg-card/80 transition-colors">
        <span className="truncate font-medium">{totalWordCount} words</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </CustomDropdownTrigger>
      <CustomDropdownContent className="p-0 bg-background">
        <ScrollArea className="h-[300px]">
          <div className="p-2">
            {breaks.map((breakItem) => (
              <div
                key={breakItem.id}
                className="flex justify-between items-center py-2 px-2 bg-secondary/50 rounded-md mb-1 last:mb-0"
              >
                <span className="truncate flex-1 mr-4 font-medium text-foreground/90">{breakItem.title}</span>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {breakItem.wordCount} words
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CustomDropdownContent>
    </CustomDropdown>
  )
}

