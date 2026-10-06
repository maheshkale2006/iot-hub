import { supabase } from "../lib/supabase"

export interface ProjectComponent {
  name: string
  quantity?: number
  price?: number
  product_id?: number
  image_url?: string
}

export interface HowItWorksItem {
  icon?: string
  title: string
}

export interface BuildStep {
  step: number
  title: string
  description: string
}

export interface Project {
  id: number
  name: string
  short_description: string
  description?: string | null
  category: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  estimated_cost: number
  image_url: string
  video_url?: string | null
  tags: string[]
  components: ProjectComponent[]
  how_it_works?: HowItWorksItem[]
  build_steps?: BuildStep[]
  code?: string | null
}


/* =========================================================
   GET FEATURED PROJECTS
   Used on Home page
========================================================= */

export async function getFeaturedProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(`
      id,
      name,
      short_description,
      description,
      category,
      difficulty,
      estimated_cost,
      image_url,
      video_url,
      tags,
      components,
      how_it_works,
      build_steps,
      code
    `)
    .order("id", { ascending: false })
    .limit(3)

  console.log("FEATURED PROJECTS:", data)
  console.log("FEATURED PROJECT ERROR:", error)

  if (error) {
    console.error("Failed to fetch featured projects:", error)
    throw error
  }

  return (data ?? []) as Project[]
}


/* =========================================================
   GET ALL PROJECTS
   Used on Projects page
========================================================= */

export async function getAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(`
      id,
      name,
      short_description,
      description,
      category,
      difficulty,
      estimated_cost,
      image_url,
      video_url,
      tags,
      components,
      how_it_works,
      build_steps,
      code
    `)
    .order("id", { ascending: false })

  console.log("ALL PROJECTS:", data)
  console.log("ALL PROJECT ERROR:", error)

  if (error) {
    console.error("Failed to fetch projects:", error)
    throw error
  }

  return (data ?? []) as Project[]
}


/* =========================================================
   GET SINGLE PROJECT
   Used on ProjectDetails page
========================================================= */

export async function getProjectById(
  id: number
): Promise<Project | null> {

  const { data, error } = await supabase
    .from("projects")
    .select(`
      id,
      name,
      short_description,
      description,
      category,
      difficulty,
      estimated_cost,
      image_url,
      video_url,
      tags,
      components,
      how_it_works,
      build_steps,
      code
    `)
    .eq("id", id)
    .single()

  console.log("PROJECT DETAILS:", data)
  console.log("PROJECT DETAILS ERROR:", error)

  if (error) {
    console.error("Failed to fetch project:", error)
    throw error
  }

  return data as Project
}