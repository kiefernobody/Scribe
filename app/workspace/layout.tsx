import type { ReactNode } from "react"

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <main
      className="min-h-screen bg-[#191919] text-[#F5F5F5] flex overflow-hidden"
      role="main"
      aria-label="Workspace area"
    >
      {children}
    </main>
  )
}

