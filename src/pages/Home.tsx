import {
  Bot,
  Code2,
  GraduationCap,
  Lightbulb,
  Search,
  ShoppingCart,
  Truck,
  Wrench,
} from "lucide-react"
import { Link } from "react-router-dom"

import Navbar from "../components/layout/Navbar"
import Footer from "../components/layout/Footer"
import ProductSection from "../components/products/ProductSection"
import ProjectSection from "../components/projects/ProjectSection"

function Home() {
  const features = [
    {
      icon: <Wrench size={24} />,
      title: "Premium Components",
      text: "Curated IoT parts — ESP32, Arduino, sensors, relays, and more. Quality tested and ready to use.",
    },
    {
      icon: <Code2 size={24} />,
      title: "Step-by-Step Projects",
      text: "Complete tutorials with video guides, circuit diagrams, code, and component lists.",
    },
    {
      icon: <ShoppingCart size={24} />,
      title: "One-Click Project Cart",
      text: "Found a project? Add all its components to cart in a single click. No hunting individually.",
    },
    {
      icon: <Bot size={24} />,
      title: "AI Project Assistant",
      text: "Describe your idea in plain English. Our AI recommends components and project guides instantly.",
    },
    {
      icon: <Truck size={24} />,
      title: "Fast Delivery",
      text: "Same-day dispatch on orders placed before 2PM. Pan-India delivery in 2–5 business days.",
    },
    {
      icon: <GraduationCap size={24} />,
      title: "Made for Students",
      text: "Affordable pricing, college project support, bulk discounts, and educator partnerships.",
    },
  ]

  const suggestions = [
    "Smart Irrigation System",
    "Smart Home Automation",
    "Smart Sanitization System",
    "Smart Poultry Farm",
    "Weather Monitoring System",
    "IoT Security System",
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc]">

      <Navbar />

      <main>

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden bg-[linear-gradient(110deg,#0b3553_0%,#0c5476_48%,#10778f_100%)] text-white">

          {/* Glow */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, #06b6d4 0%, transparent 50%), radial-gradient(circle at 80% 20%, #0ea5e9 0%, transparent 40%)",
            }}
          />

          {/* Dots */}
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-0">

            <div className="grid min-h-[575px] grid-cols-1 items-center gap-10 lg:grid-cols-2">

              {/* LEFT */}

              <div className="pt-[55px] pb-[35px] lg:pt-[20px] lg:pb-[75px]">

                {/* Badge */}

                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-4 py-2 text-[13px] font-medium text-[#aee8ff]">

                  <span className="h-2 w-2 rounded-full bg-[#2dd4bf]" />

                  India's #1 IoT Marketplace

                </div>

                {/* Main heading */}

                <h1 className="text-[48px] font-extrabold leading-[1.08] tracking-[-2.5px] sm:text-[56px] lg:text-[60px]">

                  Build Your IoT

                  <br />

                  <span className="bg-gradient-to-r from-[#38bdf8] to-[#22d3ee] bg-clip-text text-transparent">
                    Ideas Into Reality
                  </span>

                </h1>

                {/* Description */}

                <p className="mt-7 max-w-[525px] text-[17px] leading-[1.7] text-[#d4e8f2] sm:text-[18px]">

                  Discover IoT components, explore complete projects, learn
                  how to build them, and buy everything you need in one
                  place.

                </p>

                {/* Buttons */}

                <div className="mt-8 flex flex-wrap gap-3">

                  <Link
                    to="/shop"
                    className="rounded-[11px] bg-[#0ea5e9] px-6 py-4 text-[15px] font-bold text-white shadow-[0_8px_25px_rgba(14,165,233,.2)] transition hover:bg-[#38bdf8]"
                  >
                    Explore Products
                  </Link>

                  <Link
                    to="/projects"
                    className="rounded-[11px] border border-white/35 bg-white/[0.07] px-6 py-4 text-[15px] font-bold text-white transition hover:bg-white/[0.15]"
                  >
                    Explore Projects
                  </Link>

                </div>

                {/* Stats */}

                <div className="mt-10 border-t border-white/10 pt-5">

                  <div className="flex flex-wrap gap-x-10 gap-y-5">

                    <div>
                      <strong className="block text-[23px] font-extrabold text-white">
                        500+
                      </strong>
                      <span className="text-[12px] text-[#8db7cc]">
                        IoT Components
                      </span>
                    </div>

                    <div>
                      <strong className="block text-[23px] font-extrabold text-white">
                        80+
                      </strong>
                      <span className="text-[12px] text-[#8db7cc]">
                        Project Tutorials
                      </span>
                    </div>

                    <div>
                      <strong className="block text-[23px] font-extrabold text-white">
                        12K+
                      </strong>
                      <span className="text-[12px] text-[#8db7cc]">
                        Happy Makers
                      </span>
                    </div>

                    <div>
                      <strong className="block text-[23px] font-extrabold text-white">
                        4.9★
                      </strong>
                      <span className="text-[12px] text-[#8db7cc]">
                        Average Rating
                      </span>
                    </div>

                  </div>

                </div>

              </div>

              {/* RIGHT IOT GRAPHIC */}

              <div className="relative hidden h-[390px] lg:block">

                <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#29b6df]/20" />

                <div className="absolute left-1/2 top-1/2 h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#29b6df]/50" />

                {/* Center */}

                <div className="absolute left-1/2 top-1/2 grid h-[80px] w-[80px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[16px] border border-[#40c9f2]/50 bg-[#0c8bc0]/40 text-4xl">
                  📡
                </div>

                {/* Top */}

                <div className="absolute left-1/2 top-[25px] grid h-12 w-12 -translate-x-1/2 place-items-center rounded-xl border border-[#38bdf8]/20 bg-[#123c5b] text-xl">
                  🔧
                </div>

                {/* Top right */}

                <div className="absolute right-[45px] top-[70px] grid h-12 w-12 place-items-center rounded-xl border border-[#38bdf8]/20 bg-[#123c5b] text-xl">
                  💡
                </div>

                {/* Right */}

                <div className="absolute right-[5px] top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-xl border border-[#38bdf8]/20 bg-[#123c5b] text-xl">
                  📊
                </div>

                {/* Bottom */}

                <div className="absolute bottom-[20px] left-1/2 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-xl border border-[#38bdf8]/20 bg-[#123c5b] text-xl">
                  🌡️
                </div>

                {/* Bottom left */}

                <div className="absolute bottom-[65px] left-[75px] grid h-12 w-12 place-items-center rounded-xl border border-[#38bdf8]/20 bg-[#123c5b] text-xl">
                  🔌
                </div>

                {/* Left */}

                <div className="absolute left-[35px] top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-xl border border-[#38bdf8]/20 bg-[#123c5b] text-xl">
                  ☁️
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            AI SECTION
        ===================================================== */}

        <section className="bg-white py-[64px]">

          <div className="mx-auto max-w-[850px] px-4 text-center">

            <span className="inline-flex items-center gap-2 rounded-full border border-[#b8e7fb] bg-[#f3fbff] px-4 py-2 text-[13px] font-medium text-[#0076ba]">
              🤖 Powered by AI
            </span>

            <h2 className="mt-5 text-[30px] font-extrabold text-[#0f172b] sm:text-[36px]">
              Have an IoT Project Idea? Ask Our AI
            </h2>

            <p className="mx-auto mt-3 max-w-[650px] text-[17px] leading-7 text-[#5b7190] sm:text-[18px]">
              Describe your project idea and get instant component
              recommendations, project guidance, and shopping suggestions.
            </p>

            <div className="mt-8 rounded-[16px] border border-[#dbe4ee] bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,.07)]">

              <div className="flex gap-3">

                <input
                  className="h-[47px] min-w-0 flex-1 rounded-[12px] border border-[#dbe4ee] bg-[#f8fafc] px-4 text-[14px] outline-none focus:border-[#38bdf8]"
                  placeholder="Describe what you want to build... e.g., smart irrigation system for my farm"
                />

                <Link
                  to="/ai"
                  className="grid h-[47px] place-items-center rounded-[12px] bg-[#0ea5e9] px-6 text-[14px] font-bold text-white transition hover:bg-[#0284c7]"
                >
                  Ask AI
                </Link>

              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-left">

                <span className="mr-1 text-xs text-[#94a3b8]">
                  Try:
                </span>

                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="rounded-full border border-[#b8e7fb] bg-[#f3fbff] px-3 py-1.5 text-xs font-medium text-[#0076ba] transition hover:bg-[#e5f7ff]"
                  >
                    {suggestion}
                  </button>
                ))}

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            FEATURES
        ===================================================== */}

        <section className="bg-[#f8fafc] py-[58px]">

          <div className="mx-auto max-w-[1240px] px-4 lg:px-0">

            <div className="text-center">

              <h2 className="text-[30px] font-extrabold text-[#0f172b] sm:text-[32px]">
                Everything You Need to Build IoT
              </h2>

              <p className="mt-3 text-[16px] text-[#5f7694] sm:text-[17px]">
                From components to complete projects — one platform for every maker
              </p>

            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

              {features.map((feature) => (

                <div
                  key={feature.title}
                  className="min-h-[191px] rounded-[15px] border border-[#dce5ee] bg-white p-6 transition hover:border-[#7dd3fc] hover:shadow-[0_8px_25px_rgba(15,23,42,.06)]"
                >

                  <div className="mb-5 grid h-[48px] w-[48px] place-items-center rounded-[12px] bg-[#eaf6ff] text-[#0ea5e9]">
                    {feature.icon}
                  </div>

                  <h3 className="text-[16px] font-bold text-[#0f172b]">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-[14px] leading-6 text-[#5f7694]">
                    {feature.text}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </section>

        {/* =====================================================
            PRODUCTS — DATABASE ONLY
        ===================================================== */}

        <ProductSection />

        {/* =====================================================
            PROJECTS — DATABASE ONLY
        ===================================================== */}

        <ProjectSection />

        {/* =====================================================
            CTA
        ===================================================== */}

        <section className="bg-[#f8fafc] pb-[58px]">

          <div className="mx-auto max-w-[1240px] px-4 lg:px-0">

            <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(105deg,#0f223e_0%,#0d6d8e_100%)] px-6 py-[66px] text-center text-white">

              <div className="absolute inset-0 opacity-20">
                <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_70%_50%,#06b6d4_0%,transparent_60%)]" />
              </div>

              <div className="relative">

                <h2 className="text-[30px] font-extrabold sm:text-[34px]">
                  Ready to Start Building?
                </h2>

                <p className="mt-3 text-[16px] text-[#d7edf6] sm:text-[17px]">
                  Join 12,000+ makers who use IoT Hub to bring their ideas to life.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-3">

                  <Link
                    to="/shop"
                    className="rounded-[11px] bg-[#0ea5e9] px-7 py-3.5 font-bold text-white transition hover:bg-[#38bdf8]"
                  >
                    Shop Components
                  </Link>

                  <Link
                    to="/projects"
                    className="rounded-[11px] border border-white/35 bg-white/[0.06] px-7 py-3.5 font-bold text-white transition hover:bg-white/[0.12]"
                  >
                    Browse Projects
                  </Link>

                </div>

              </div>

            </div>

          </div>

        </section>

      </main>

      {/* FLOATING AI */}

      <button
        type="button"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-[17px] bg-[#08a8dc] px-5 py-4 text-[14px] font-bold text-white shadow-[0_10px_28px_rgba(8,168,220,.3)] transition hover:scale-105 hover:bg-[#079dcc]"
      >
        <Bot size={20} />
        <span className="hidden sm:inline">
          Ask IoT AI
        </span>
      </button>

      <Footer />

    </div>
  )
}

export default Home