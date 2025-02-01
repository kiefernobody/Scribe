"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";

interface JournalProps {
  notes: string[];
  onAddNote: (note: string) => void;
  isMobileView: boolean;
  shouldBlur: boolean;
}

const Journal: React.FC<JournalProps> = ({ notes, onAddNote, isMobileView, shouldBlur }) => {
  const [newNote, setNewNote] = useState("");
  const [filteredNotes, setFilteredNotes] = useState<string[]>([]);

  useEffect(() => {
    const storedNotes = localStorage.getItem("journalNotes");
    if (storedNotes) {
      setFilteredNotes(JSON.parse(storedNotes));
    } else {
      setFilteredNotes([]);
    }
  }, []);

  useEffect(() => {
    const filtered = notes.filter((note) => note.trim() !== "");
    setFilteredNotes(filtered);
  }, [notes]);

  const handleAddNote = useCallback(() => {
    if (newNote.trim() === "") return;
    const updatedNotes = [...filteredNotes, newNote.trim()];
    setFilteredNotes(updatedNotes);
    localStorage.setItem("journalNotes", JSON.stringify(updatedNotes));
    onAddNote(newNote.trim());
    setNewNote("");
  }, [newNote, filteredNotes, onAddNote]);

  const handleDeleteNote = useCallback(
    (index: number) => {
      const updatedNotes = filteredNotes.filter((_, i) => i !== index);
      setFilteredNotes(updatedNotes);
      localStorage.setItem("journalNotes", JSON.stringify(updatedNotes));
    },
    [filteredNotes]
  );

  return (
    <motion.div
      className={`h-full w-full flex flex-col bg-card rounded-lg overflow-hidden shadow-lg p-4 ${
        shouldBlur ? "blur-sm" : ""
      }`}
    >
      <h2 className="text-lg font-bold text-primary mb-4">Journal</h2>
      <ScrollArea className="flex-grow p-2 overflow-auto">
        {filteredNotes.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center">No notes yet. Use the input below to add notes.</p>
        ) : (
          filteredNotes.map((note, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-secondary p-2 rounded-md mb-2"
            >
              <span className="text-sm text-foreground">{note}</span>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => handleDeleteNote(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </ScrollArea>
      <div className="flex items-center gap-2 mt-4">
        <Input
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a new note..."
          className="flex-grow"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddNote();
          }}
        />
        <Button onClick={handleAddNote} className="bg-primary text-primary-foreground">
          Add
        </Button>
      </div>
    </motion.div>
  );
};

export default Journal;
