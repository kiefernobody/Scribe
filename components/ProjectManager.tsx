import type React from "react";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Upload, Download, Info, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Project } from "@/types/editor";
import { parseMarkdown } from "@/utils/markdownParser";
import { htmlToMarkdown } from "@/utils/htmlToMarkdown";

interface ProjectManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentProject: Project;
  onSelectProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onExportProject: (project: Project) => void;
  projects: Project[];
  updateProjectsInStorage: (updatedProjects: Project[]) => void;
  setShouldBlurUI: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  isOpen,
  onClose,
  currentProject,
  onSelectProject,
  onDeleteProject,
  onExportProject,
  projects,
  updateProjectsInStorage,
  setShouldBlurUI,
}) => {
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      try {
        const file = e.target.files[0];
        const content = await file.text();
        const { html, chapters } = await parseMarkdown(content);
        const newProject: Project = {
          id: `project-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          breaks: chapters.map((chapter) => ({
            id: chapter.id,
            title: chapter.title,
            content: chapter.content,
            wordCount: chapter.content.split(/\s+/).filter(Boolean).length,
          })),
          currentBreakId: chapters[0]?.id || null,
        };
        updateProjectsInStorage([...projects, newProject]);
        onSelectProject(newProject);
      } catch (error) {
        console.error("Error importing project:", error);
      }
    }
  };

  const handleCreateNewProject = () => {
    if (!newProjectTitle.trim()) return;
    const timestamp = Date.now();
    const newProject: Project = {
      id: `project-${timestamp}`,
      title: newProjectTitle.trim(),
      breaks: [{ id: `break-${timestamp}`, title: "Break 1", content: "", wordCount: 0 }],
      currentBreakId: `break-${timestamp}`,
    };
    updateProjectsInStorage([...projects, newProject]);
    onSelectProject(newProject);
    setNewProjectTitle("");
    setIsCreatingNew(false);
    setShouldBlurUI(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background text-foreground border-none z-50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Project Manager</DialogTitle>
          <DialogDescription>Manage your writing projects</DialogDescription>
        </DialogHeader>

        <div className="flex justify-between mb-4">
          <Button onClick={() => onExportProject(currentProject)} className="flex items-center">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} className="flex items-center">
            <Upload className="mr-2 h-4 w-4" /> Import
          </Button>
          <Input ref={fileInputRef} type="file" accept=".md" onChange={handleFileChange} className="hidden" />
        </div>

        <Button onClick={() => setIsCreatingNew(true)} className="w-full mb-4 flex items-center justify-center">
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>

        <ScrollArea className="h-[300px] w-full rounded-md">
          {projects.length === 0 ? (
            <p className="text-center text-muted-foreground p-4">No projects available. Create or import one.</p>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between mb-2 p-2 bg-secondary rounded-md">
                <Button onClick={() => onSelectProject(project)} variant="ghost" className="flex-grow justify-start text-left">
                  {project.title}
                </Button>
                <Button onClick={() => onDeleteProject(project.id)} variant="ghost" size="icon" className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </ScrollArea>

        <Button onClick={() => {
          if (window.confirm("Are you sure you want to erase all projects? This action cannot be undone.")) {
            localStorage.removeItem("projects");
            updateProjectsInStorage([]);
            setShouldBlurUI(true);
          }
        }} className="w-full mt-4 bg-destructive text-destructive-foreground">
          Reset All Data
        </Button>
      </DialogContent>
    </Dialog>
  );
};

