"use client";

import type React from "react";
import { useState, useEffect, useCallback, Suspense } from "react";
import { motion } from "framer-motion";
import type { Project, Break } from "@/types/editor";
import dynamic from "next/dynamic";
import { UserProvider } from "@/contexts/UserContext";
import { GuidedWorkspaceProvider } from "@/contexts/GuidedWorkspaceContext";
import LoadingScreen from "@/components/LoadingScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Assistant = dynamic(() => import("@/components/Assistant"), {
  ssr: false,
  loading: () => <LoadingScreen />,
});
const Editor = dynamic(() => import("@/components/Editor"), {
  ssr: false,
  loading: () => <LoadingScreen />,
});
const Journal = dynamic(() => import("@/components/Journal"), {
  ssr: false,
  loading: () => <LoadingScreen />,
});
const ProjectManager = dynamic(() => import("@/components/ProjectManager"), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

const defaultProject: Project = {
  id: "default",
  title: "Untitled Project",
  breaks: [],
  currentBreakId: null,
};

const WorkspaceClient: React.FC = () => {
  const [project, setProject] = useState<Project>(defaultProject);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(true);
  const [shouldBlurUI, setShouldBlurUI] = useState(false);

  useEffect(() => {
    const loadingTimeout = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(loadingTimeout);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
      setShouldBlurUI(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem("projects");
      const parsedProjects = storedProjects ? JSON.parse(storedProjects) : [];

      if (Array.isArray(parsedProjects) && parsedProjects.every(isValidProject)) {
        setProjects(parsedProjects);
      }

      const storedCurrentProject = localStorage.getItem("currentProject");
      if (storedCurrentProject) {
        const parsedCurrentProject = JSON.parse(storedCurrentProject);
        if (isValidProject(parsedCurrentProject)) {
          setProject(parsedCurrentProject);
          setShowProjectSelector(false);
        }
      } else if (parsedProjects.length > 0) {
        setProject(parsedProjects[0]);
        setShowProjectSelector(false);
      } else {
        setShowProjectSelector(true);
      }
    } catch (error) {
      console.error("Error loading projects from localStorage:", error);
      setProjects([]);
      setProject(defaultProject);
      setShowProjectSelector(true);
    }
  }, []);

  if (isLoading) return <LoadingScreen />;
  if (error)
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h1 className="text-xl font-bold mb-2">An error occurred in WorkspaceClient</h1>
        <pre className="whitespace-pre-wrap">{error.message}</pre>
      </div>
    );

  return (
    <ErrorBoundary>
      <UserProvider>
        <GuidedWorkspaceProvider>
          <div className="flex h-screen w-full bg-background p-4 space-x-4 overflow-hidden relative custom-scrollbar">
            <Suspense fallback={<LoadingScreen />}>
              <Editor
                project={project}
                updateBreak={() => {}}
                isMobileView={isMobileView}
                shouldBlur={shouldBlurUI}
              />
              <ProjectManager
                isOpen={showProjectSelector}
                onClose={() => setShowProjectSelector(false)}
                currentProject={project}
                onSelectProject={setProject}
                projects={projects}
                updateProjectsInStorage={setProjects}
                setShouldBlurUI={setShouldBlurUI}
              />
            </Suspense>
          </div>
        </GuidedWorkspaceProvider>
      </UserProvider>
    </ErrorBoundary>
  );
};

function isValidProject(project: any): project is Project {
  return (
    typeof project === "object" &&
    project !== null &&
    typeof project.id === "string" &&
    typeof project.title === "string" &&
    Array.isArray(project.breaks) &&
    (project.currentBreakId === null || typeof project.currentBreakId === "string")
  );
}

export default WorkspaceClient;
