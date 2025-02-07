"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, Upload, Download, Info, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { parseMarkdown } from "@/utils/markdownParser"
import type { Project } from "@/types/editor"
import type { JournalNote } from "@/types/journal"
import type { Message } from "@/types/assistant"

interface ProjectManagerProps {
  isOpen: boolean
  onClose: () => void
  currentProject: Project | null
  setCurrentProject: React.Dispatch<React.SetStateAction<Project | null>>
  setCurrentBreak: React.Dispatch<React.SetStateAction<Project["breaks"][0] | null>>
  onSelectProject: (project: Project) => void
  onDeleteProject: (projectId: string) => void
  onExportProject: (project: Project) => void
  projects: Project[]
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>
  createEmptyProject: () => Project
  setNotes: React.Dispatch<React.SetStateAction<JournalNote[]>>
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  setIsGuidedWorkspace: React.Dispatch<React.SetStateAction<boolean>>
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  isOpen,
  onClose,
  currentProject,
  setCurrentProject,
  setCurrentBreak,
  onSelectProject,
  onDeleteProject,
  onExportProject,
  projects,
  setProjects,
  createEmptyProject,
  setNotes,
  setMessages,
  setIsGuidedWorkspace,
}) => {
  const [importFile, setImportFile] = useState<File | null>(null)
  const [newProjectTitle, setNewProjectTitle] = useState("")
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showEraseConfirm, setShowEraseConfirm] = useState(false)

  useEffect(() => {
    if (projects.length === 0 && !isCreatingNew) {
      setIsCreatingNew(true)
    }
  }, [projects.length, isCreatingNew])

  const handleClose = () => {
    if (currentProject) {
      onClose()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0])
      handleImport(e.target.files[0])
    }
  }

  const handleImport = async (file: File) => {
    try {
      const content = await file.text()
      const { html, chapters } = await parseMarkdown(content)

      // Create a new project with properly formatted breaks
      const newProject: Project = {
        id: `project-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        breaks: chapters.map((chapter) => {
          // Convert chapter content to Slate format
          const paragraphs = chapter.content.split('\n\n').map((paragraph, index) => {
            // Check for indentation (if paragraph starts with spaces or tabs)
            const indentLevel = (paragraph.match(/^[\s\t]+/) || [''])[0].length;
            
            // Check for bold/italic formatting
            const formattedText = paragraph.split(/(\*\*.*?\*\*|\*.*?\*|__.*?__|_.*?_)/).map(part => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return { text: part.slice(2, -2), bold: true };
              } else if (part.startsWith('__') && part.endsWith('__')) {
                return { text: part.slice(2, -2), bold: true };
              } else if (part.startsWith('*') && part.endsWith('*')) {
                return { text: part.slice(1, -1), italic: true };
              } else if (part.startsWith('_') && part.endsWith('_')) {
                return { text: part.slice(1, -1), italic: true };
              } else if (part.trim()) {
                return { text: part };
              }
              return null;
            }).filter(Boolean);

            return {
              type: 'paragraph',
              indent: Math.floor(indentLevel / 2), // Convert spaces to indent levels
              children: formattedText.length > 0 ? formattedText : [{ text: paragraph }]
            };
          });

          return {
            id: `break-${Date.now()}-${Math.random()}`,
            title: chapter.title || "Untitled Break",
            content: JSON.stringify(paragraphs),
            wordCount: chapter.content.split(/\s+/).filter(Boolean).length,
          };
        }),
        currentBreakId: null
      };

      setProjects((prevProjects) => [...prevProjects, newProject]);
      onSelectProject(newProject);
      setImportFile(null);
    } catch (error) {
      console.error("Error importing project:", error);
      // Optionally, show an error message to the user
    }
  }

  const handleCreateNewProject = () => {
    if (!newProjectTitle.trim()) return

    const newProject: Project = {
      id: `project-${Date.now()}`,
      title: newProjectTitle.trim(),
      breaks: [
        {
          id: `break-${Date.now()}`,
          title: "Break 1",
          content: JSON.stringify([{ type: "paragraph", children: [{ text: "" }] }]),
          wordCount: 0,
        },
      ],
      currentBreakId: `break-${Date.now()}`,
    }

    setProjects((prevProjects) => [...prevProjects, newProject])
    onSelectProject(newProject)
    setNewProjectTitle("")
    setIsCreatingNew(false)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleDeleteProject = useCallback(
    (projectId: string) => {
      setProjects((prevProjects) => {
        const updatedProjects = prevProjects.filter((p) => p.id !== projectId)
        if (currentProject && currentProject.id === projectId) {
          const newCurrentProject = updatedProjects.length > 0 ? updatedProjects[0] : createEmptyProject()
          setCurrentProject(newCurrentProject)
          setCurrentBreak(newCurrentProject.breaks[0] || null)
        }
        return updatedProjects
      })
    },
    [currentProject, setCurrentProject, setCurrentBreak, createEmptyProject],
  )

  const handleEraseAllData = useCallback(() => {
    // Clear all localStorage completely
    localStorage.clear();
    
    // Reset all project-related state
    setProjects([]);
    setCurrentProject(null);
    setCurrentBreak(null);
    
    // Clear journal notes
    setNotes([]);
    
    // Clear assistant messages
    setMessages([]);
    
    // Reset workspace mode
    setIsGuidedWorkspace(false);
    
    // Reset any unsaved editor content and clear all contenteditable elements
    if (window) {
      // Clear all editor content
      const editors = document.querySelectorAll('[contenteditable="true"]');
      editors.forEach(editor => {
        editor.textContent = '';
        editor.innerHTML = '';
      });

      // Clear any slate-related data attributes
      const slateElements = document.querySelectorAll('[data-slate-node]');
      slateElements.forEach(element => {
        element.textContent = '';
        element.innerHTML = '';
      });
    }
    
    // Create a fresh empty project after clearing everything
    const emptyProject = createEmptyProject();
    setProjects([emptyProject]);
    
    // Close all dialogs and reset UI
    setShowEraseConfirm(false);
    onClose();

  }, [
    setProjects, 
    setCurrentProject, 
    setCurrentBreak, 
    setNotes, 
    setMessages, 
    setIsGuidedWorkspace,
    onClose, 
    createEmptyProject
  ]);

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open && currentProject) {
          onClose()
        }
      }}
      modal={true}
    >
      <DialogContent className="sm:max-w-[600px] z-50">
        <DialogHeader>
          <DialogTitle>Project Manager</DialogTitle>
          <DialogDescription>
            {currentProject 
              ? "Manage your writing projects"
              : "Select a project to continue"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          <Button
            onClick={() => currentProject && onExportProject(currentProject)}
            className="w-full text-sm flex items-center justify-center focus:outline-none focus:ring-0 py-2"
            disabled={!currentProject}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Project
          </Button>
          <Button
            onClick={triggerFileInput}
            className="w-full text-sm flex items-center justify-center focus:outline-none focus:ring-0 py-2"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import Project
          </Button>
        </div>

        <div className="bg-card text-foreground p-4 rounded mb-6 shadow-md">
          <div className="flex items-start">
            <Info className="h-5 w-5 mr-3 flex-shrink-0 text-muted-foreground mt-0.5" />
            <p className="text-sm">
              Projects are saved locally in your browser. Export your projects regularly to prevent data loss.
            </p>
          </div>
        </div>

        {isCreatingNew ? (
          <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
            <Input
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              placeholder="Enter project title"
              className="flex-grow w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateNewProject()
                }
              }}
            />
            <div className="flex gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
              <Button onClick={handleCreateNewProject} className="flex-grow sm:flex-grow-0">
                Create
              </Button>
              <Button variant="ghost" onClick={() => setIsCreatingNew(false)} className="flex-grow sm:flex-grow-0">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setIsCreatingNew(true)} className="w-full mb-4 flex items-center justify-center py-2">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        )}

        <div className="mb-2 font-semibold text-lg text-primary">Your Projects</div>
        <ScrollArea className="max-h-[40vh] sm:max-h-[300px] w-full">
          {projects.length === 0 ? (
            <p className="text-center text-muted-foreground p-4">
              No projects available. Create a new project or import one.
            </p>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between mb-2"
              >
                <Button
                  onClick={() => onSelectProject(project)}
                  variant="ghost"
                  className="flex-grow justify-start text-left font-medium truncate mr-2 hover:bg-muted/50"
                >
                  {project.title}
                </Button>
                <Button
                  onClick={() => handleDeleteProject(project.id)}
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </ScrollArea>
        <Input ref={fileInputRef} type="file" accept=".md" onChange={handleFileChange} className="hidden" />

        <div className="mt-6 pt-6 border-t border-primary/20">
          <TooltipProvider delayDuration={0}>
            <Tooltip defaultOpen={false}>
              <TooltipTrigger asChild>
                <Button 
                  variant="destructive"
                  onClick={() => setShowEraseConfirm(true)}
                  className="w-full text-sm flex items-center justify-center"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Erase All Data
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-card text-foreground p-4 rounded shadow-lg"
              >
                <p>Warning: This will permanently delete all projects, notes, and assistant chats.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Dialog open={showEraseConfirm} onOpenChange={setShowEraseConfirm}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-destructive">⚠️ Erase All Data?</DialogTitle>
              <DialogDescription className="pt-4">
                This action will permanently delete:
                <ul className="list-disc pl-6 pt-2 space-y-1">
                  <li>All projects and their content</li>
                  <li>All journal notes</li>
                  <li>All assistant chat history</li>
                  <li>All application settings</li>
                </ul>
                <p className="pt-4 font-semibold">This action cannot be undone.</p>
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEraseConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleEraseAllData}>
                Yes, Erase Everything
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}

export default ProjectManager

