"use client";

import type React from "react";
import { useState, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import type { Project, Break } from "@/types/editor";
import { BreakDropdown } from "./BreakDropdown";
import { WordCountDropdown } from "./WordCountDropdown";
import { ProjectManager } from "./ProjectManager";
import { useGuidedWorkspace } from "@/contexts/GuidedWorkspaceContext";
import { Input } from "@/components/ui/input";
import { ResponsiveToolbar } from "./ResponsiveToolbar";
import EditorContent from "./EditorContent";
import EditorErrorBoundary from "./EditorErrorBoundary";
import type { JournalNote } from "@/types/journal";

interface EditorProps {
  project: Project | null;
  updateBreak: (breakId: string, updates: Partial<Break>) => void;
  addBreak: (title: string) => void;
  removeBreak: (breakId: string) => void;
  switchBreak: (breakId: string) => void;
  updateProjectTitle: (newTitle: string) => void;
  onAddNote: (note: JournalNote) => void;
  setProject: React.Dispatch<React.SetStateAction<Project | null>>;
  showProjectSelector: boolean;
  setShowProjectSelector: React.Dispatch<React.SetStateAction<boolean>>;
  projects: Project[];
  updateProjectsInStorage: (updatedProjects: Project[]) => void;
  handleSelectProject: (project: Project | null) => void;
  activeMobileComponent: "editor" | "journal" | "assistant";
  shouldBlur: boolean;
  setShouldBlurUI: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileView: boolean;
}

const Editor: React.FC<EditorProps> = ({
  project,
  updateBreak,
  addBreak,
  removeBreak,
  switchBreak,
  updateProjectTitle,
  onAddNote,
  setProject,
  showProjectSelector,
  setShowProjectSelector,
  updateProjectsInStorage,
  handleSelectProject,
  activeMobileComponent,
  shouldBlur,
  setShouldBlurUI,
  isMobileView,
}) => {
  const [openDropdown, setOpenDropdown] = useState<"wordCount" | "break" | null>(null);
  const { isGuidedWorkspace } = useGuidedWorkspace();
  const [isBreakSwitching, setIsBreakSwitching] = useState(false);

  const currentBreak = useMemo(() => {
    return project?.breaks.find(b => b.id === project.currentBreakId) || null;
  }, [project]);

  const handleDropdownToggle = useCallback((dropdownName: "wordCount" | "break", isOpen: boolean) => {
    setOpenDropdown(isOpen ? dropdownName : null);
  }, []);

  const handleDropdownClose = useCallback(() => {
    setOpenDropdown(null);
  }, []);

  const handleBreakSwitch = useCallback((breakId: string) => {
    setIsBreakSwitching(true);
    switchBreak(breakId);
    // Allow time for the editor to properly save current content
    setTimeout(() => setIsBreakSwitching(false), 50);
  }, [switchBreak]);

  return (
    <div className="flex flex-col h-full">
      <ResponsiveToolbar
        leftItems={[
          {
            key: "wordCount",
            content: (
              <div className="w-[120px] sm:w-[150px] md:w-[180px]">
                <WordCountDropdown 
                  totalWordCount={project?.breaks.reduce((sum, b) => sum + b.wordCount, 0) || 0}
                  breaks={project?.breaks || []}
                  isOpen={openDropdown === "wordCount"}
                  setIsOpen={(isOpen) => handleDropdownToggle("wordCount", isOpen)}
                  onClose={handleDropdownClose}
                />
              </div>
            ),
          },
        ]}
        centerItems={[
          {
            key: "projectTitle",
            content: (
              <Input
                type="text"
                value={project?.title || ""}
                onChange={(e) => updateProjectTitle(e.target.value)}
                className="max-w-[200px] text-center bg-secondary text-secondary-foreground border-secondary"
                placeholder="Project Title"
              />
            ),
          },
        ]}
        rightItems={[
          {
            key: "breaks",
            content: (
              <div className="w-[120px] sm:w-[150px] md:w-[180px]">
                <BreakDropdown
                  breaks={project?.breaks || []}
                  currentBreakId={project?.currentBreakId || ""}
                  onBreakClick={handleBreakSwitch}
                  onEditBreakTitle={(breakId, newTitle) => 
                    updateBreak(breakId, { title: newTitle })
                  }
                  onDeleteBreak={removeBreak}
                  onAddBreak={addBreak}
                  isOpen={openDropdown === "break"}
                  setIsOpen={(isOpen) => handleDropdownToggle("break", isOpen)}
                  onClose={handleDropdownClose}
                />
              </div>
            ),
          },
        ]}
        isMobileView={isMobileView}
      />
      <div className="flex-grow overflow-hidden bg-card p-6">
        <EditorErrorBoundary>
          <EditorContent
            currentBreak={currentBreak}
            updateBreak={updateBreak}
            isLoading={isBreakSwitching}
            isGuidedWorkspace={isGuidedWorkspace}
          />
        </EditorErrorBoundary>
      </div>
    </div>
  );
};

export default Editor;
