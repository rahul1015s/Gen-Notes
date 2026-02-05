import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Smartphone,
  Lock,
  Zap,
  Share2,
  Clock,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/all-notes");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      {/* ---------------- HERO ---------------- */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              GenNotes
            </span>
            <br />
            Made Simple
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            Capture ideas instantly. Organize effortlessly. Access anywhere.
            <br className="hidden sm:block" />
            A modern note-taking experience inspired by Apple Notes.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg hover:bg-blue-700 transition"
            >
              <BookOpen className="h-5 w-5" />
              Get Started Free
            </Link>

            <Link
              to="/log-in"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-600/40 px-8 py-3 font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition"
            >
              Already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- FEATURES ---------------- */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
          Powerful Features
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: BookOpen,
              title: "Quick Capture",
              desc: "Write notes instantly with a clean and intuitive editor.",
            },
            {
              icon: Smartphone,
              title: "Works Everywhere",
              desc: "Use on desktop, tablet, or phone. Offline-ready PWA.",
            },
            {
              icon: Lock,
              title: "Secure & Private",
              desc: "Your notes are encrypted and protected by modern security.",
            },
            {
              icon: Zap,
              title: "Lightning Fast",
              desc: "Built with modern tech for blazing-fast performance.",
            },
            {
              icon: Clock,
              title: "Folders & Pins",
              desc: "Organize notes with folders and pin important ones.",
            },
            {
              icon: Share2,
              title: "Rich Formatting",
              desc: "Lists, links, formatting — everything you need.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 hover:border-blue-500 hover:shadow-xl transition"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition">
                <f.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-600 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- TESTIMONIALS ---------------- */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
          Loved by Users
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            `"Clean, fast, and exactly what I needed."`,
            `"Offline mode is a lifesaver for me."`,
            `"Best note-taking experience I've ever had."`,
          ].map((text, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8"
            >
              <div className="flex gap-1 text-yellow-400 mb-4">
                {"★★★★★"}
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {text}
              </p>
              <p className="font-semibold text-sm">Verified User</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-100/60 to-cyan-100/60 dark:from-blue-900/20 dark:to-cyan-900/20 p-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Start Taking Beautiful Notes
          </h2>
          <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 mb-8">
            Join thousands who trust GenNotes for daily note-taking.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/sign-up"
              className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700 transition"
            >
              Create Free Account
            </Link>
            <Link
              to="/log-in"
              className="rounded-xl border border-blue-600/40 px-8 py-3 font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="border-t border-slate-200 dark:border-slate-700 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
        © 2026 GenNotes. Built with ❤️
      </footer>
    </div>
  );
};

export default Home;
