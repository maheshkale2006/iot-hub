import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  X,
  PlaySquare,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import Navbar from "../components/layout/Navbar";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

interface Project {
  id: number;
  name: string;
  short_description: string;
  description?: string | null;
  category: string;
  difficulty: Difficulty;
  estimated_cost: number;
  image_url: string;
  video_url?: string | null;
  tags: string[];

  components: Array<{
    name: string;
    quantity?: number;
    price?: number;
    product_id?: number;
    image_url?: string;
  }>;

  how_it_works?: Array<{
    icon?: string;
    title: string;
  }>;

  build_steps?: Array<{
    step: number;
    title: string;
    description: string;
  }>;

  code?: string | null;
}

const CATEGORIES = [
  "Smart Home",
  "Agriculture",
  "Healthcare",
  "Security",
  "Automation",
  "Environment",
  "Smart City",
  "College Projects",
  "Arduino Projects",
  "ESP32 Projects",
];

const DIFFICULTIES: Difficulty[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

const BUDGETS = [
  {
    label: "Any Budget",
    min: 0,
    max: Infinity,
  },
  {
    label: "Under ₹500",
    min: 0,
    max: 499,
  },
  {
    label: "₹500 – ₹1,000",
    min: 500,
    max: 1000,
  },
  {
    label: "₹1,000 – ₹2,500",
    min: 1000,
    max: 2500,
  },
  {
    label: "Above ₹2,500",
    min: 2501,
    max: Infinity,
  },
];

const difficultyClass = (d: Difficulty) =>
  d === "Beginner"
    ? "bg-green-100 text-green-700"
    : d === "Intermediate"
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-600";

const price = (v: number) =>
  `₹${Number(v || 0).toLocaleString("en-IN")}`;

export default function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  const [budgetIndex, setBudgetIndex] = useState(0);

  const [mobileFilters, setMobileFilters] = useState(false);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("projects")
        .select(
          "id,name,short_description,description,category,difficulty,estimated_cost,image_url,video_url,tags,components,how_it_works,build_steps,code"
        )
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setProjects((data || []) as Project[]);
    } catch (e) {
      console.error(e);
      setError("Unable to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    const budget = BUDGETS[budgetIndex];

    return projects.filter((project) => {
      const searchableText = [
        project.name,
        project.short_description,
        project.description || "",
        project.category,
        ...(project.tags || []),
      ]
        .join(" ")
        .toLowerCase();

      const searchOk =
        !q || searchableText.includes(q);

      const categoryOk =
        categories.length === 0 ||
        categories.some(
          (category) =>
            project.category === category ||
            (project.tags || []).includes(category)
        );

      const difficultyOk =
        difficulties.length === 0 ||
        difficulties.includes(project.difficulty);

      const cost = Number(project.estimated_cost || 0);

      const budgetOk =
        cost >= budget.min &&
        cost <= budget.max;

      return (
        searchOk &&
        categoryOk &&
        difficultyOk &&
        budgetOk
      );
    });
  }, [
    projects,
    search,
    categories,
    difficulties,
    budgetIndex,
  ]);

  const clearFilters = () => {
    setSearch("");
    setCategories([]);
    setDifficulties([]);
    setBudgetIndex(0);
  };

  const toggle = <T,>(
    value: T,
    values: T[],
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    setter(
      values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value]
    );
  };

  const Filters = ({
    mobile = false,
  }: {
    mobile?: boolean;
  }) => (
    <div
      className={
        mobile
          ? "rounded-2xl border border-slate-200 bg-white p-5"
          : "sticky top-24 rounded-2xl border border-slate-200 bg-white p-5"
      }
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display font-bold text-slate-900">
          Filters
        </h2>

        <button
          onClick={clearFilters}
          className="text-xs text-sky-600 hover:text-sky-700"
        >
          Clear All
        </button>
      </div>

      {/* CATEGORY */}
      <section className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Category
        </h3>

        <div className="space-y-2">
          {CATEGORIES.map((category) => (
            <label
              key={category}
              className="flex cursor-pointer items-center gap-2.5"
            >
              <input
                type="checkbox"
                checked={categories.includes(category)}
                onChange={() =>
                  toggle(
                    category,
                    categories,
                    setCategories
                  )
                }
                className="h-4 w-4 accent-sky-500"
              />

              <span className="text-sm text-slate-600">
                {category}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* DIFFICULTY */}
      <section className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Difficulty
        </h3>

        <div className="space-y-2">
          {DIFFICULTIES.map((difficulty) => (
            <label
              key={difficulty}
              className="flex cursor-pointer items-center gap-2.5"
            >
              <input
                type="checkbox"
                checked={difficulties.includes(
                  difficulty
                )}
                onChange={() =>
                  toggle(
                    difficulty,
                    difficulties,
                    setDifficulties
                  )
                }
                className="h-4 w-4 accent-sky-500"
              />

              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyClass(
                  difficulty
                )}`}
              >
                {difficulty}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* BUDGET */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Budget
        </h3>

        <div className="space-y-2">
          {BUDGETS.map((budget, index) => (
            <label
              key={budget.label}
              className="flex cursor-pointer items-center gap-2.5"
            >
              <input
                type="radio"
                name={
                  mobile
                    ? "mobile-budget"
                    : "desktop-budget"
                }
                checked={budgetIndex === index}
                onChange={() =>
                  setBudgetIndex(index)
                }
                className="h-4 w-4 accent-sky-500"
              />

              <span className="text-sm text-slate-600">
                {budget.label}
              </span>
            </label>
          ))}
        </div>
      </section>

      {mobile && (
        <button
          onClick={() => setMobileFilters(false)}
          className="mt-6 w-full rounded-lg bg-sky-500 py-2.5 text-sm font-medium text-white hover:bg-sky-600"
        >
          Apply Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">

      {/* NAVBAR */}
      <Navbar />

      <main>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

          {/* HEADER */}
          <div className="mb-8">
            <h1 className="mb-2 font-display text-3xl font-bold text-slate-900">
              Build IoT Projects
            </h1>

            <p className="text-slate-500">
              Learn step-by-step and get every component
              required to build your project
            </p>
          </div>

          {/* SEARCH */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search IoT projects… e.g., Smart Home, Irrigation, Security"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm outline-none shadow-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex gap-6">

            {/* DESKTOP FILTER */}
            <aside className="hidden w-64 flex-shrink-0 lg:block">
              <Filters />
            </aside>

            <div className="min-w-0 flex-1">

              {/* RESULT HEADER */}
              <div className="mb-4 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <button
                    onClick={() =>
                      setMobileFilters(true)
                    }
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 lg:hidden"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </button>

                  <span className="text-sm text-slate-500">
                    {filteredProjects.length} projects
                  </span>

                </div>

                {(search ||
                  categories.length ||
                  difficulties.length ||
                  budgetIndex !== 0) && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs font-medium text-sky-600"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                )}
              </div>

              {/* LOADING */}
              {loading && (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className="overflow-hidden rounded-2xl border bg-white"
                      >
                        <div className="h-48 animate-pulse bg-slate-200" />

                        <div className="space-y-3 p-4">
                          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />

                          <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />

                          <div className="h-10 animate-pulse rounded bg-slate-100" />
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* ERROR */}
              {!loading && error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                  <p className="mb-4 text-sm text-red-600">
                    {error}
                  </p>

                  <button
                    onClick={loadProjects}
                    className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-medium text-white"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* EMPTY */}
              {!loading &&
                !error &&
                filteredProjects.length === 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                    <div className="mb-3 text-4xl">
                      🔎
                    </div>

                    <h3 className="mb-2 font-display text-lg font-bold text-slate-900">
                      No projects found
                    </h3>

                    <p className="mb-5 text-sm text-slate-500">
                      Try another search or clear your filters.
                    </p>

                    <button
                      onClick={clearFilters}
                      className="rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-medium text-white"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}

              {/* PROJECT CARDS */}
              {!loading &&
                !error &&
                filteredProjects.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                    {filteredProjects.map(
                      (project) => (
                        <article
                          key={project.id}
                          onClick={() =>
                            navigate(
                              `/iot-projects/${project.id}`
                            )
                          }
                          className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
                        >

                          {/* IMAGE */}
                          <div className="relative h-48 overflow-hidden bg-slate-100">

                            <img
                              src={
                                project.image_url ||
                                "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop&auto=format"
                              }
                              alt={project.name}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/10 to-transparent" />

                            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1">
                              {(project.tags || [])
                                .slice(0, 4)
                                .map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full border border-white/30 bg-white/20 px-2 py-0.5 text-xs text-white backdrop-blur-sm"
                                  >
                                    {tag}
                                  </span>
                                ))}
                            </div>

                          </div>

                          {/* CARD CONTENT */}
                          <div className="p-4">

                            <div className="mb-2 flex items-center gap-2">

                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyClass(
                                  project.difficulty
                                )}`}
                              >
                                {project.difficulty}
                              </span>

                              <span className="text-xs text-slate-400">
                                {project.category}
                              </span>

                            </div>

                            <h3 className="mb-2 line-clamp-2 font-display font-bold text-slate-900">
                              {project.name}
                            </h3>

                            <p className="mb-3 line-clamp-2 text-xs text-slate-500">
                              {project.short_description}
                            </p>

                            <div className="flex items-center justify-between">

                              <div>
                                <div className="text-xs text-slate-400">
                                  Estimated Cost
                                </div>

                                <div className="font-display font-bold text-sky-600">
                                  {price(
                                    project.estimated_cost
                                  )}
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-xs text-slate-400">
                                  Components
                                </div>

                                <div className="font-semibold text-slate-700">
                                  {Array.isArray(
                                    project.components
                                  )
                                    ? project.components.length
                                    : 0}{" "}
                                  parts
                                </div>
                              </div>

                            </div>

                            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">

                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <PlaySquare className="h-3.5 w-3.5" />
                                Video Tutorial
                              </div>

                              <span className="flex items-center gap-1 text-xs font-semibold text-sky-600">
                                View Project
                                <ChevronRight className="h-3.5 w-3.5" />
                              </span>

                            </div>

                          </div>

                        </article>
                      )
                    )}

                  </div>
                )}

            </div>
          </div>
        </div>
      </main>

      {/* MOBILE FILTERS */}
      {mobileFilters && (
        <div className="fixed inset-0 z-[100] lg:hidden">

          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() =>
              setMobileFilters(false)
            }
          />

          <div className="absolute inset-y-0 right-0 w-[min(90%,380px)] overflow-y-auto bg-slate-50 p-4 shadow-2xl">

            <div className="mb-3 flex items-center justify-between">

              <h2 className="font-display text-lg font-bold text-slate-900">
                Project Filters
              </h2>

              <button
                onClick={() =>
                  setMobileFilters(false)
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-white"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <Filters mobile />

          </div>
        </div>
      )}

    </div>
  );
}