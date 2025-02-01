"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Edit2, Trash2, Plus } from "lucide-react"
import type { Chapter } from "@/types/editor"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface SectionDropdownProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  sections: Chapter[]
  currentSectionId: string | null
  onSectionClick: (sectionId: string) => void
  onEditSectionTitle: (sectionId: string, newTitle: string) => void
  onDeleteSection: (sectionId: string) => void
  onClose: () => void
  onAddSection: () => void
}

export const SectionDropdown: React.FC<SectionDropdownProps> = ({
  isOpen,
  setIsOpen,
  sections,
  currentSectionId,
  onSectionClick,
  onEditSectionTitle,
  onDeleteSection,
  onClose,
  onAddSection,
}) => {
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editedTitle, setEditedTitle] = useState("")
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setEditingSectionId(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [setIsOpen])

  const handleEditClick = useCallback((sectionId: string, currentTitle: string) => {
    setEditingSectionId(sectionId)
    setEditedTitle(currentTitle)
  }, [])

  const handleEditSubmit = useCallback(
    (sectionId: string) => {
      onEditSectionTitle(sectionId, editedTitle)
      setEditingSectionId(null)
    },
    [onEditSectionTitle, editedTitle],
  )

  const handleDeleteClick = useCallback((sectionId: string) => {
    setDeleteSectionId(sectionId)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (deleteSectionId) {
      onDeleteSection(deleteSectionId)
      setDeleteSectionId(null)
    }
  }, [deleteSectionId, onDeleteSection])

  const triggerContent = (
    <span className="truncate text-xs font-medium">
      {sections.find((section) => section.id === currentSectionId)?.title || "Select Section"}
    </span>
  )

  const dropdownContent = (
    <ScrollArea className="h-64 w-full bg-background rounded-md shadow-lg overflow-hidden">
      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        <div className="flex items-center justify-between px-2 py-1 text-xs hover:bg-muted">
          <span className="flex-grow">Add New Section</span>
          <CustomButton
            onClick={(e) => {
              e.stopPropagation()
              onAddSection()
            }}
            className="p-1 text-foreground hover:text-primary"
            aria-label="Add new section"
            isIcon
          >
            <Plus className="h-3 w-3" />
          </CustomButton>
        </div>
        {sections.map((section) => (
          <div
            key={section.id}
            className={`flex items-center px-2 py-1 text-xs ${
              currentSectionId === section.id
                ? "bg-secondary text-secondary-foreground"
                : "text-foreground hover:bg-muted"
            }`}
          >
            {editingSectionId === section.id ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={() => handleEditSubmit(section.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleEditSubmit(section.id)
                  }
                }}
                className="flex-grow text-sm h-8 py-0 px-2 bg-background text-foreground border-none rounded"
                autoFocus
              />
            ) : (
              <>
                <span className="flex-grow truncate cursor-pointer mr-2" onClick={() => onSectionClick(section.id)}>
                  {section.title}
                </span>
                <div className="flex-shrink-0 flex">
                  <CustomButton
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditClick(section.id, section.title)
                    }}
                    className="mr-1 p-0.5 text-foreground hover:text-primary"
                    aria-label={`Edit ${section.title}`}
                    isIcon
                  >
                    <Edit2 className="h-3 w-3" />
                  </CustomButton>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <CustomButton
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteClick(section.id)
                        }}
                        className="p-0.5 text-foreground hover:text-destructive"
                        aria-label={`Delete ${section.title}`}
                        isIcon
                      >
                        <Trash2 className="h-3 w-3" />
                      </CustomButton>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this section?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the section and all its content.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
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
    <div className="h-8 w-full">
      <CustomDropdown
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        triggerContent={triggerContent}
        dropdownContent={dropdownContent}
        className="w-full h-full flex-shrink-0 bg-dark-gray"
        dropdownClassName="w-80"
        expandDirection="left"
        onClose={onClose}
      />
    </div>
  )
}

