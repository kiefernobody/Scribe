"use client";

import type React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { handleCommand } from "@/utils/commandHandler";
import type { Project, Break } from "@/types/editor";
import { Lightbulb, LightbulbOff, Plus, FolderOpen, MoreVertical } from "lucide-react";
import { useGuidedWorkspace } from "@/contexts/GuidedWorkspaceContext";
import { errorHandler } from "@/utils/errorHandler";
import { CustomButton } from "@/components/ui/button";

interface AssistantProps {
  project: Project;
  updateBreak: (breakId: string, updates: Partial<Break>) => void;
  addBreak: (title: string) => void;
  removeBreak: (breakId: string) => void;
  switchBreak: (breakId: string) => void;
  updateProjectTitle: (newTitle: string) => void;
  onAddNote: (note: string) => void;
  setProject: (project: Project) => void;
  isMobileView: boolean;
  setShowProjectSelector: (value: boolean) => void;
  updateProjectsInStorage: (updatedProjects: Project[]) => void;
  activeMobileComponent: "editor" | "journal" | "assistant";
  shouldBlur: boolean;
}

const Assistant: React.FC<AssistantProps> = ({
  project,
  updateBreak,
  addBreak,
  removeBreak,
  switchBreak,
  updateProjectTitle,
  onAddNote,
  setProject,
  isMobileView,
  setShowProjectSelector,
  updateProjectsInStorage,
  activeMobileComponent,
  shouldBlur,
}) => {
  const [assistantState, setAssistantState] = useState<string>("");
  const { isGuidedWorkspaceEnabled } = useGuidedWorkspace();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!assistantState) {
      setAssistantState("Welcome to the Assistant!");
    }
  }, [assistantState]);

  const executeCommand = useCallback(
    async (command: string) => {
      try {
        const result = await handleCommand(
          command,
          project,
          updateBreak,
          addBreak,
          removeBreak,
          switchBreak,
          updateProjectTitle,
          setProject,
          project.currentBreakId,
          setShowProjectSelector,
          updateProjectsInStorage
        );
        if (result.success) {
          setAssistantState(`Command executed: ${command}`);
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        errorHandler(error);
        setAssistantState("An error occurred while executing the command.");
      }
    },
    [
      project,
      updateBreak,
      addBreak,
      removeBreak,
      switchBreak,
      updateProjectTitle,
      setProject,
      setShowProjectSelector,
      updateProjectsInStorage,
    ]
  );

  return (
    <div className={`assistant-panel ${shouldBlur ? "blurred" : ""}`}>
      <ScrollArea>
        <div className="assistant-header">
          <h2>Assistant</h2>
          {isGuidedWorkspaceEnabled ? <Lightbulb /> : <LightbulbOff />}
        </div>
        <div className="assistant-body">
          <p>{assistantState}</p>
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter command..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputRef.current) {
                executeCommand(inputRef.current.value);
                inputRef.current.value = "";
              }
            }}
          />
        </div>
      </ScrollArea>
      <CustomButton onClick={() => executeCommand("/help")}>
        <MoreVertical />
      </CustomButton>
    </div>
  );
};

export default Assistant;
