import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const initializeGoogleDrive = async (accessToken: string) => {
  console.log("Google Drive integration temporarily disabled")
  return null
}

export const createFolderStructure = async (projectTitle: string) => {
  console.log("Creating folder structure disabled, returning mock data")
  return {
    scribeId: "mock-scribe-id",
    projectsId: "mock-projects-id",
    projectId: "mock-project-id",
    chaptersId: "mock-chapters-id",
    notesId: "mock-notes-id",
  }
}

export const listProjects = async () => {
  console.log("Listing projects disabled, returning mock data")
  return [
    { id: "mock-1", name: "Sample Project 1" },
    { id: "mock-2", name: "Sample Project 2" },
  ]
}

export const deleteProjectFromSupabase = async (projectId: string) => {
  try {
    const { error } = await supabase.from("projects").delete().eq("id", projectId)

    if (error) {
      throw error
    }

    console.log(`Project ${projectId} deleted successfully`)
  } catch (error) {
    console.error("Error deleting project:", error)
    throw error
  }
}

