"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Edit2, Plus } from "lucide-react"
import type { Break } from "@/types/editor"
import { Input } from "@/components/ui/input"
import { CustomDropdown } from "@/components/ui/custom-dropdown"
import { CustomButton } from "@/components/ui/custom-button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface BreakDropdownProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  breaks: Break[]
  currentBreakId: string | null
  onBreakClick: (breakId: string) => void
  onEditBreakTitle: (breakId: string, newTitle: string) => void
  onDeleteBreak: (breakId: string) => void
  onClose: () => void
  onAddBreak: () => void
}

export const BreakDropdown: React.FC<BreakDropdownProps> = ({
  isOpen,
  setIsOpen,
  breaks,
  currentBreakId,
  onBreakClick,
  onEditBreakTitle,
  onDeleteBreak,
  onClose,
  onAddBreak,
}) => {
  const [editingBreakId, setEditingBreakId] = useState<string | null>(null)
  const [editedTitle, setEditedTitle] = useState("")
  const [deleteBreakId, setDeleteBreakId] = useState<string | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setEditingBreakId(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [setIsOpen])

  const handleEditClick = useCallback((breakId: string, currentTitle: string) => {
    setEditingBreakId(breakId)
    setEditedTitle(currentTitle)
  }, [])

  const handleEditSubmit = useCallback(
    (breakId: string) => {
      onEditBreakTitle(breakId, editedTitle)
      setEditingBreakId(null)
    },
    [onEditBreakTitle, editedTitle],
  )

  const handleDeleteClick = useCallback((breakId: string) => {
    setDeleteBreakId(breakId)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (deleteBreakId) {
      onDeleteBreak(deleteBreakId)
      setDeleteBreakId(null)
      setIsOpen(false) // Close the dropdown after deletion
    }
  }, [deleteBreakId, onDeleteBreak, setIsOpen])

  const triggerContent = (
    <span className="truncate text-xs font-medium w-24 text-center">
      {breaks.find((breakItem) => breakItem.id === currentBreakId)?.title || "Select Break"}
    </span>
  )

  const dropdownContent = (
    <ScrollArea className="h-64 w-full bg-background rounded-md shadow-lg overflow-hidden">
      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        <div className="flex items-center justify-between px-2 py-1 text-xs hover:bg-muted">
          <span className="flex-grow">Add New Break</span>
          <CustomButton
            onClick={(e) => {
              e.stopPropagation()
              onAddBreak()
            }}
            className="p-1 text-foreground hover:text-primary"
            aria-label="Add new break"
            isIcon
          >
            <Plus className="h-3 w-3" />
          </CustomButton>
        </div>
        {breaks.map((breakItem) => (
          <div
            key={breakItem.id}
            className={`flex items-center px-2 py-1 text-xs ${
              currentBreakId === breakItem.id
                ? "bg-secondary text-secondary-foreground"
                : "text-foreground hover:bg-muted"
            }`}
          >
            {editingBreakId === breakItem.id ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={() => handleEditSubmit(breakItem.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleEditSubmit(breakItem.id)
                  }
                }}
                className="flex-grow text-sm h-8 py-0 px-2 bg-background text-foreground border-none rounded"
                autoFocus
              />
            ) : (
              <>
                <span className="flex-grow truncate cursor-pointer mr-2" onClick={() => onBreakClick(breakItem.id)}>
                  {breakItem.title}
                </span>
                <div className="flex-shrink-0 flex">
                  <CustomButton
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditClick(breakItem.id, breakItem.title)
                    }}
                    className="mr-1 p-0.5 text-foreground hover:text-primary"
                    aria-label={`Edit ${breakItem.title}`}
                    isIcon
                  >
                    <Edit2 className="h-3 w-3" />
                  </CustomButton>
                  <AlertDialog open={!!deleteBreakId} onOpenChange={(isOpen) => !isOpen && setDeleteBreakId(null)}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this break?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the break and all its content.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteBreakId(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )

  const dropdownRef = useRef<HTMLDivElement>(null)

  return (
    <div className="h-10">
      <CustomDropdown
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        triggerContent={triggerContent}
        dropdownContent={dropdownContent}
        className="w-full h-full flex-shrink-0 bg-dark-gray"
        dropdownClassName="w-64 right-0 mt-1"
        expandDirection="left"
        onClose={onClose}
      />
    </div>
  )
}

