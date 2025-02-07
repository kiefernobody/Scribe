"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Edit2, Plus, ChevronDown, Trash2 } from "lucide-react"
import type { Break } from "@/types/editor"
import { Input } from "@/components/ui/input"
import { CustomDropdown, CustomDropdownTrigger, CustomDropdownContent } from "@/components/ui/custom-dropdown"
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
  breaks: Break[]
  currentBreakId: string | null
  onBreakClick: (breakId: string) => void
  onEditBreakTitle: (breakId: string, newTitle: string) => void
  onDeleteBreak: (breakId: string) => void
  onAddBreak: (title: string) => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  onClose?: () => void
}

export const BreakDropdown: React.FC<BreakDropdownProps> = ({
  breaks,
  currentBreakId,
  onBreakClick,
  onEditBreakTitle,
  onDeleteBreak,
  onAddBreak,
  isOpen,
  setIsOpen,
  onClose,
}) => {
  const [editingBreakId, setEditingBreakId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [breakToDelete, setBreakToDelete] = useState<string | null>(null)
  const [showAddBreak, setShowAddBreak] = useState(false)
  const [newBreakTitle, setNewBreakTitle] = useState("")

  const handleEditClick = useCallback((breakId: string, currentTitle: string) => {
    setEditingBreakId(breakId)
    setNewTitle(currentTitle)
  }, [])

  const handleEditSubmit = useCallback((breakId: string) => {
    onEditBreakTitle(breakId, newTitle)
    setEditingBreakId(null)
    setNewTitle("")
  }, [newTitle, onEditBreakTitle])

  return (
    <>
      <CustomDropdown open={isOpen} onOpenChange={setIsOpen}>
        <CustomDropdownTrigger className="flex items-center justify-between w-full bg-card hover:bg-card/80 transition-colors">
          <span className="truncate font-medium">
            {breaks.find((b) => b.id === currentBreakId)?.title || "Select Break"}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </CustomDropdownTrigger>
        <CustomDropdownContent className="p-0 bg-background">
          <ScrollArea className="h-[300px]">
            <div className="p-2">
              {breaks.map((breakItem) => (
                <div
                  key={breakItem.id}
                  className="flex items-center justify-between py-2 px-2 bg-secondary/50 rounded-md mb-1 last:mb-0 group"
                >
                  {editingBreakId === breakItem.id ? (
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleEditSubmit(breakItem.id)
                        }
                      }}
                      onBlur={() => handleEditSubmit(breakItem.id)}
                      autoFocus
                      className="flex-1 mr-2 h-7 bg-secondary"
                    />
                  ) : (
                    <button
                      onClick={() => onBreakClick(breakItem.id)}
                      className="flex-1 text-left truncate hover:text-primary font-medium text-foreground/90"
                    >
                      {breakItem.title}
                    </button>
                  )}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CustomButton
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(breakItem.id, breakItem.title)}
                      className="h-7 w-7 hover:bg-muted"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </CustomButton>
                    <CustomButton
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setBreakToDelete(breakItem.id)
                        setShowDeleteAlert(true)
                      }}
                      className="h-7 w-7 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </CustomButton>
                  </div>
                </div>
              ))}
              <div className="pt-1 mt-1 border-t border-border/10">
                {showAddBreak ? (
                  <div className="flex items-center gap-2 px-2 py-1">
                    <Input
                      value={newBreakTitle}
                      onChange={(e) => setNewBreakTitle(e.target.value)}
                      placeholder="Break title"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newBreakTitle.trim()) {
                          onAddBreak(newBreakTitle.trim())
                          setNewBreakTitle("")
                          setShowAddBreak(false)
                        }
                      }}
                      className="h-8 bg-secondary"
                      autoFocus
                    />
                  </div>
                ) : (
                  <CustomButton
                    variant="ghost"
                    className="w-full justify-start px-2 py-2 hover:bg-secondary/50 rounded-md h-auto font-medium"
                    onClick={() => setShowAddBreak(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Break
                  </CustomButton>
                )}
              </div>
            </div>
          </ScrollArea>
        </CustomDropdownContent>
      </CustomDropdown>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">Delete Break</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this break? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel 
              onClick={() => setShowDeleteAlert(false)}
              className="bg-muted hover:bg-muted/80"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (breakToDelete) {
                  onDeleteBreak(breakToDelete)
                  setBreakToDelete(null)
                  setShowDeleteAlert(false)
                }
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

