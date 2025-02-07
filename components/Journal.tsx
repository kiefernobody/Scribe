"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Download } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Toolbar } from "@/components/ui/toolbar"

interface JournalNote {
  type: "text" | "image"
  content: string
}

interface JournalProps {
  notes: JournalNote[]
  onAddNote: (note: JournalNote) => void
  isMobileView: boolean
  shouldBlur: boolean
}

const Journal: React.FC<JournalProps> = ({ notes: initialNotes, onAddNote, isMobileView, shouldBlur }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [newNote, setNewNote] = useState("")
  const [filteredNotes, setFilteredNotes] = useState(initialNotes)
  const [notes, setNotes] = useState(initialNotes)
  const [showWarning, setShowWarning] = useState(false)
  const [lastWarningCount, setLastWarningCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const storedNotes = localStorage.getItem("journalNotes")
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes))
    }
  }, [])

  useEffect(() => {
    const filtered = notes.filter((note) =>
      note.type === "text" ? note.content.toLowerCase().includes(searchTerm.toLowerCase()) : true,
    )
    setFilteredNotes(filtered)
  }, [searchTerm, notes])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleAddNote = useCallback(() => {
    if (newNote.trim() !== "") {
      const newNoteObj: JournalNote = { type: "text", content: newNote.trim() }
      const updatedNotes = [...notes, newNoteObj]
      setNotes(updatedNotes)
      setNewNote("")
      onAddNote(newNoteObj)
      localStorage.setItem("journalNotes", JSON.stringify(updatedNotes))

      if (updatedNotes.length > 5 && updatedNotes.length - lastWarningCount >= 5) {
        setShowWarning(true)
        setLastWarningCount(updatedNotes.length)
      }
    }
  }, [newNote, notes, onAddNote, lastWarningCount])

  const handleBackup = useCallback(() => {
    const content = filteredNotes
      .map((note) => (note.type === "text" ? note.content : `[Image: ${note.content}]`))
      .join("\n\n")
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "journal_notes_backup.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [filteredNotes])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const newImageNote: JournalNote = { type: "image", content: event.target?.result as string }
        const updatedNotes = [...notes, newImageNote]
        setNotes(updatedNotes)
        onAddNote(newImageNote)
        localStorage.setItem("journalNotes", JSON.stringify(updatedNotes))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div
      className={`h-full w-full bg-card flex flex-col rounded-lg overflow-hidden shadow-lg relative journal-component ${
        shouldBlur ? "blur-sm pointer-events-none" : ""
      }`}
    >
      <Toolbar className="justify-between bg-[#282828] w-full p-2">
        <Input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          className="flex-grow bg-secondary text-foreground border-none h-10 focus:ring-0 focus:ring-offset-0 px-2 mr-2"
          placeholder="Search notes..."
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackup}
          className="!h-10 !w-10 !p-0 bg-dark-gray text-light-gray hover:bg-primary hover:text-primary-foreground"
          style={{ minWidth: "2.5rem", minHeight: "2.5rem" }}
        >
          <Download className="h-4 w-4" />
        </Button>
      </Toolbar>
      <ScrollArea className="flex-grow p-4">
        {filteredNotes.map((note, index) => (
          <div key={index} className="mb-2 p-2 bg-secondary text-secondary-foreground rounded-lg shadow-md">
            {note.type === "text" ? (
              note.content
            ) : (
              <img src={note.content || "/placeholder.svg"} alt="Journal note" className="w-full h-auto" />
            )}
          </div>
        ))}
      </ScrollArea>
      <div className="flex items-center justify-between p-2 bg-secondary w-full">
        <Input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddNote()
            }
          }}
          className="flex-grow bg-secondary text-foreground border-none h-10 focus:ring-0 focus:ring-offset-0 px-2 mr-2"
          placeholder="Add a new note..."
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/jpeg,image/png"
          style={{ display: "none" }}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="!h-10 !w-10 !p-0 bg-dark-gray text-light-gray hover:bg-primary hover:text-primary-foreground"
          style={{ minWidth: "2.5rem", minHeight: "2.5rem" }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent className="bg-card text-foreground border-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-primary">
              Warning: Local Storage Limitations
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="bg-card border-l-4 border-yellow-500 text-foreground p-4 rounded">
                <p className="mb-2">
                  You have added more than 5 notes. Please be aware that notes are stored in your browser's local
                  storage, which can be cleared unexpectedly.
                </p>
                <p>Consider backing up your important notes to avoid data loss.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowWarning(false)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Journal

