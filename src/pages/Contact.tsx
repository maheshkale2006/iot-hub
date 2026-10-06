import { useState } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { supabase } from "../lib/supabase";

const faqs = [
  {
    question: "How long does delivery take?",
    answer:
      "Most orders are delivered within 3–5 business days across India. Same-day dispatch on orders placed before 2PM.",
  },
  {
    question: "Are the components genuine?",
    answer:
      "Yes. We source IoT components from trusted suppliers and provide product specifications so you can verify compatibility before purchasing.",
  },
  {
    question: "Can I return a faulty component?",
    answer:
      "Yes. If you receive a faulty component, contact our support team with your order details and we will guide you through the replacement process.",
  },
  {
    question: "Do you offer bulk discounts?",
    answer:
      "Yes. Bulk and college project orders can qualify for special pricing. Contact our support team with the quantity you need.",
  },
  {
    question: "Do you provide technical support for projects?",
    answer:
      "Yes. Our technical support team can help with component selection, circuit connections, project development, and debugging.",
  },
];

function Contact() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Remove previous messages when user starts editing again
    setSubmitMessage("");
    setSubmitError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitMessage("");
    setSubmitError("");

    try {
      const { error } = await supabase
        .from("contact_messages")
        .insert([
          {
            full_name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim() || null,
            category: form.category,
            subject: form.subject.trim(),
            message: form.message.trim(),
            status: "new",
          },
        ]);

      if (error) {
        console.error("Supabase contact form error:", error);

        setSubmitError(
          error.message ||
            "Unable to send your message. Please try again."
        );

        return;
      }

      setSubmitMessage(
        "Thank you! Your message has been submitted successfully."
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        category: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Unexpected contact form error:", error);

      setSubmitError(
        "Something went wrong while sending your message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* =====================================================
            HERO
        ====================================================== */}

        <section
          className="text-white py-16"
          style={{
            background:
              "linear-gradient(110deg, #0c3553 0%, #0c5275 45%, #0d7590 100%)",
          }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              How Can We Help You?
            </h1>

            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Have a question about products, projects, orders, or IoT
              development? We're here to help.
            </p>
          </div>
        </section>

        {/* =====================================================
            SUPPORT CARDS
        ====================================================== */}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Product Support */}
            <div className="bg-white rounded-2xl border border-sky-200 p-5 hover:shadow-md transition-all">
              <div className="text-3xl mb-3">📦</div>

              <h3 className="font-display font-bold text-slate-900 mb-1.5">
                Product Support
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed">
                Questions about IoT components, specifications, and
                compatibility.
              </p>
            </div>

            {/* Project Support */}
            <div className="bg-white rounded-2xl border border-indigo-200 p-5 hover:shadow-md transition-all">
              <div className="text-3xl mb-3">🔧</div>

              <h3 className="font-display font-bold text-slate-900 mb-1.5">
                Project Support
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed">
                Help with building IoT projects, circuit connections, and
                debugging.
              </p>
            </div>

            {/* Order Support */}
            <div className="bg-white rounded-2xl border border-amber-200 p-5 hover:shadow-md transition-all">
              <div className="text-3xl mb-3">🛒</div>

              <h3 className="font-display font-bold text-slate-900 mb-1.5">
                Order Support
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed">
                Track orders, shipping status, returns, and billing queries.
              </p>
            </div>

            {/* AI Assistant */}
            <div
              className="bg-white rounded-2xl border border-cyan-200 p-5 hover:shadow-md transition-all bg-cyan-50 cursor-pointer hover:scale-[1.02]"
              onClick={() => {
                console.log("Open AI Assistant");
              }}
            >
              <div className="text-3xl mb-3">🤖</div>

              <h3 className="font-display font-bold text-slate-900 mb-1.5">
                AI Assistant
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed">
                Get instant IoT project guidance and component
                recommendations.
              </p>

              <span className="inline-block mt-3 text-xs text-cyan-600 font-semibold">
                Click to chat →
              </span>
            </div>
          </div>
        </section>

        {/* =====================================================
            CONTACT SECTION
        ====================================================== */}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid lg:grid-cols-5 gap-10">
            {/* =================================================
                CONTACT FORM
            ================================================= */}

            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">
                  Send Us a Message
                </h2>

                <p className="text-slate-500 text-sm mb-6">
                  We typically respond within 2–4 business hours.
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  {/* NAME + EMAIL */}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        Full Name *
                      </label>

                      <input
                        required
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Arjun Sharma"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        Email Address *
                      </label>

                      <input
                        required
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="arjun@email.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>
                  </div>

                  {/* PHONE + CATEGORY */}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        Phone Number
                      </label>

                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        Category *
                      </label>

                      <select
                        required
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 bg-white"
                      >
                        <option value="">
                          Select category
                        </option>

                        <option value="Product Query">
                          Product Query
                        </option>

                        <option value="Project Help">
                          Project Help
                        </option>

                        <option value="Order & Delivery">
                          Order & Delivery
                        </option>

                        <option value="Technical Support">
                          Technical Support
                        </option>

                        <option value="Bulk Order">
                          Bulk Order
                        </option>

                        <option value="Other">
                          Other
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* SUBJECT */}

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Subject *
                    </label>

                    <input
                      required
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>

                  {/* MESSAGE */}

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Message *
                    </label>

                    <textarea
                      required
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={6}
                      placeholder="Describe your query in detail..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 resize-none"
                    />
                  </div>

                  {/* SUBMIT BUTTON */}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-[52px] rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(14,165,233,0.25)] hover:from-[#0284c7] hover:to-[#0891b2] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Message →"
                    )}
                  </button>

                  {/* SUCCESS MESSAGE */}

                  {submitMessage && (
                    <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                      ✓ {submitMessage}
                    </div>
                  )}

                  {/* ERROR MESSAGE */}

                  {submitError && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      ✕ {submitError}
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* =================================================
                RIGHT SIDE
            ================================================= */}

            <div className="lg:col-span-2 space-y-5">
              {/* CONTACT INFORMATION */}

              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="font-display font-bold text-slate-900 mb-4">
                  Contact Information
                </h3>

                <div className="space-y-4">
                  {/* EMAIL */}

                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                      📧
                    </div>

                    <div>
                      <div className="text-xs text-slate-400">
                        Email Support
                      </div>

                      <div className="font-semibold text-slate-800 text-sm">
                        support@iothub.in
                      </div>

                      <div className="text-xs text-slate-400">
                        Response within 2–4 hours
                      </div>
                    </div>
                  </div>

                  {/* PHONE */}

                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                      📞
                    </div>

                    <div>
                      <div className="text-xs text-slate-400">
                        Phone Support
                      </div>

                      <div className="font-semibold text-slate-800 text-sm">
                        +91 98765 43210
                      </div>

                      <div className="text-xs text-slate-400">
                        Mon–Sat, 9AM–6PM IST
                      </div>
                    </div>
                  </div>

                  {/* BUSINESS HOURS */}

                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                      ⏰
                    </div>

                    <div>
                      <div className="text-xs text-slate-400">
                        Business Hours
                      </div>

                      <div className="font-semibold text-slate-800 text-sm">
                        Mon–Sat: 9AM–6PM
                      </div>

                      <div className="text-xs text-slate-400">
                        Sunday: Closed
                      </div>
                    </div>
                  </div>

                  {/* LOCATION */}

                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                      📍
                    </div>

                    <div>
                      <div className="text-xs text-slate-400">
                        Location
                      </div>

                      <div className="font-semibold text-slate-800 text-sm">
                        Bengaluru, Karnataka
                      </div>

                      <div className="text-xs text-slate-400">
                        India — 560034
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI CARD */}

              <div className="bg-gradient-to-br from-sky-500 to-cyan-500 rounded-2xl p-5 cursor-pointer hover:opacity-90 transition-all">
                <div className="text-3xl mb-2">
                  🤖
                </div>

                <h3 className="font-display font-bold text-white mb-1">
                  Chat with AI Assistant
                </h3>

                <p className="text-sky-100 text-sm mb-3">
                  Get instant answers about IoT components and projects 24/7.
                </p>

                <button
                  type="button"
                  className="inline-block bg-white/20 border border-white/30 text-white text-sm px-4 py-2 rounded-xl font-medium hover:bg-white/30 transition-all"
                >
                  Start Chat →
                </button>
              </div>

              {/* SOCIAL */}

              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="font-display font-bold text-slate-900 mb-3">
                  Follow IoT Hub
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="#"
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    <span>▶️</span>

                    <div>
                      <div className="text-xs font-semibold text-slate-700">
                        YouTube
                      </div>

                      <div className="text-xs text-slate-400">
                        @IoTHubIndia
                      </div>
                    </div>
                  </a>

                  <a
                    href="#"
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    <span>📸</span>

                    <div>
                      <div className="text-xs font-semibold text-slate-700">
                        Instagram
                      </div>

                      <div className="text-xs text-slate-400">
                        @iothub.in
                      </div>
                    </div>
                  </a>

                  <a
                    href="#"
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    <span>💻</span>

                    <div>
                      <div className="text-xs font-semibold text-slate-700">
                        GitHub
                      </div>

                      <div className="text-xs text-slate-400">
                        IoTHub-India
                      </div>
                    </div>
                  </a>

                  <a
                    href="#"
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    <span>🐦</span>

                    <div>
                      <div className="text-xs font-semibold text-slate-700">
                        Twitter
                      </div>

                      <div className="text-xs text-slate-400">
                        @IoTHubIndia
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              FAQ
          ================================================== */}

          <div className="mt-12">
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-6 text-center">
              Frequently Asked Questions
            </h2>

            <div className="max-w-3xl mx-auto space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <div
                    key={faq.question}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenFaq(isOpen ? null : index)
                      }
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-all"
                    >
                      <span className="font-semibold text-slate-800 text-sm pr-4">
                        {faq.question}
                      </span>

                      <span
                        className={`text-slate-400 text-lg transition-transform flex-shrink-0 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        ⌄
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-4 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================
          FLOATING AI BUTTON
      ====================================================== */}

      <button
        type="button"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] text-white font-semibold shadow-xl hover:opacity-90 hover:scale-105 transition-all"
      >
        <span className="text-xl">
          🤖
        </span>

        <span className="hidden sm:inline text-sm">
          Ask IoT AI
        </span>
      </button>

      <Footer />
    </div>
  );
}

export default Contact;