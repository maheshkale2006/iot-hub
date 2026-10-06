import { useEffect, useState } from "react"
import { FolderOpen } from "lucide-react"
import { Link } from "react-router-dom"

import {
  getFeaturedProjects,
  type Project,
} from "../../services/projectService"

function ProjectSection() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    try {
      setLoading(true)
      setError("")

      const data = await getFeaturedProjects()

      setProjects(data)
    } catch (err) {
      console.error("PROJECT SECTION ERROR:", err)

      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Unable to load projects")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-white py-[64px]">

      <div className="mx-auto max-w-[1240px] px-4 lg:px-0">

        {/* HEADER */}

        <div className="mb-8 flex items-center justify-between">

          <div>
            <h2 className="text-[28px] font-extrabold text-[#0f172b]">
              Featured IoT Projects
            </h2>

            <p className="mt-1 text-[16px] text-[#5f7694]">
              Step-by-step tutorials with complete component lists
            </p>
          </div>

          <Link
            to="/iot-projects"
            className="text-[14px] font-semibold text-[#0284c7] transition hover:text-[#0369a1]"
          >
            View All →
          </Link>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[380px] animate-pulse rounded-[16px] bg-[#f1f5f9]"
              />
            ))}

          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="rounded-[16px] border border-red-200 bg-red-50 p-10 text-center">

            <div className="text-4xl">
              ⚠️
            </div>

            <h3 className="mt-3 font-bold text-red-600">
              Projects could not be loaded
            </h3>

            <p className="mt-2 text-sm text-red-500">
              {error}
            </p>

          </div>
        )}

        {/* EMPTY */}

        {!loading && !error && projects.length === 0 && (
          <div className="rounded-[16px] border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-6 py-[70px] text-center">

            <div className="mx-auto grid h-[60px] w-[60px] place-items-center rounded-full bg-[#eaf6ff] text-[#0ea5e9]">
              <FolderOpen size={28} />
            </div>

            <h3 className="mt-5 text-[18px] font-bold text-[#0f172b]">
              Projects Coming Soon
            </h3>

            <p className="mx-auto mt-2 max-w-[470px] text-[14px] leading-6 text-[#64748b]">
              Projects added to your Supabase database will automatically
              appear in this section.
            </p>

          </div>
        )}

        {/* PROJECT CARDS */}

        {!loading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

            {projects.map((project) => (

              <Link
                key={project.id}
                to={`/iot-projects/${project.id}`}
                className="group overflow-hidden rounded-[16px] border border-[#dce5ee] bg-white shadow-[0_3px_8px_rgba(15,23,42,.05)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(15,23,42,.12)]"
              >

                {/* IMAGE */}

                <div className="relative h-[190px] overflow-hidden bg-[#eef5f9]">

                  {project.image_url ? (
                    <img
                      src={project.image_url}
                      alt={project.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-5xl">
                        🔧
                      </div>
                    </div>
                  )}

                  {/* CATEGORY */}

                  {project.category && (
                    <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                      {project.category}
                    </span>
                  )}

                </div>

                {/* CONTENT */}

                <div className="p-5">

                  {/* DIFFICULTY */}

                  <div className="mb-2 flex items-center gap-2">

                    {project.difficulty && (
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          project.difficulty.toLowerCase() === "beginner"
                            ? "bg-[#dcfce7] text-[#15803d]"
                            : project.difficulty.toLowerCase() === "advanced"
                            ? "bg-[#fee2e2] text-[#dc2626]"
                            : "bg-[#fef3c7] text-[#b45309]"
                        }`}
                      >
                        {project.difficulty}
                      </span>
                    )}

                    {project.category && (
                      <span className="text-[12px] text-[#7c91aa]">
                        {project.category}
                      </span>
                    )}

                  </div>

                  {/* NAME */}

                  <h3 className="line-clamp-2 text-[17px] font-extrabold text-[#0f172b] group-hover:text-[#0284c7]">
                    {project.name}
                  </h3>

                  {/* DESCRIPTION */}

                  <p className="mt-2 line-clamp-2 min-h-[42px] text-[13px] leading-[20px] text-[#5f7694]">
                    {project.feature ||
                      project.description ||
                      "Step-by-step IoT project tutorial"}
                  </p>

                  {/* COST + COMPONENTS */}

                  <div className="mt-4 flex items-center justify-between border-t border-[#e2e8f0] pt-4">

                    <div>
                      <p className="text-[11px] text-[#94a3b8]">
                        Estimated Cost
                      </p>

                      <p className="mt-1 text-[17px] font-extrabold text-[#008bd0]">
                        {project.estimated_cost !== null
                          ? `₹${project.estimated_cost}`
                          : "View Project"}
                      </p>
                    </div>

                    <div className="text-right">

                      <p className="text-[11px] text-[#94a3b8]">
                        Components
                      </p>

                     <p className="mt-1 text-[16px] font-bold text-[#0f172b]">
  {project.components?.length || 0} parts
</p>

                    </div>

                  </div>

                  {/* FOOTER */}

                  <div className="mt-4 flex items-center justify-between border-t border-[#e2e8f0] pt-4">

                    <span className="text-[12px] text-[#64748b]">
                      🎬 Video Tutorial
                    </span>

                    <span className="text-[13px] font-semibold text-[#0284c7]">
                      View Project →
                    </span>

                  </div>

                </div>

              </Link>

            ))}

          </div>
        )}

      </div>

    </section>
  )
}

export default ProjectSection