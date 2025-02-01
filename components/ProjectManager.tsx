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
  const [importFile, setImportFile] = useState<File | null>(null);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImportFile(file);
      await handleImport(file);
    }
  };

  const handleImport = async (file: File) => {
    try {
      const content = await file.text();
      const { html, chapters } = await parseMarkdown(content);
      const markdownContent = htmlToMarkdown(html);

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

      const updatedProjects = [...projects, newProject];
      updateProjectsInStorage(updatedProjects);
      onSelectProject(newProject);
      setImportFile(null);
    } catch (error) {
      console.error("Error importing project:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} className="project-manager">
      <DialogContent className="sm:max-w-[425px] bg-background text-foreground border-none z-50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Project Manager</DialogTitle>
          <DialogDescription>Manage your writing projects</DialogDescription>
        </DialogHeader>
        <Button onClick={() => onExportProject(currentProject)} disabled={!currentProject.id}>
          <Download className="mr-2 h-4 w-4" /> Export Current
        </Button>
        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" /> Import
        </Button>
        <Input ref={fileInputRef} type="file" accept=".md" onChange={handleFileChange} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};
