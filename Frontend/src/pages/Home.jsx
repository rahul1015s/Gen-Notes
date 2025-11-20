import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Smartphone, Lock, Zap, Share2, Clock } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/all-notes");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-100 to-base-200 text-base-content">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              GenNotes
            </span>
            <br />
            Made Simple
          </h1>
          <p className="text-lg sm:text-xl text-base-content/70 mb-8 leading-relaxed">
            Capture your thoughts instantly. Organize effortlessly. Access anywhere.
            <br className="hidden sm:block" />
            Your personal note-taking companion, inspired by Apple Notes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/sign-up" 
              className="btn btn-primary btn-lg gap-2 w-full sm:w-auto"
            >
              <BookOpen className="size-5" />
              Get Started Free
            </Link>
            <Link 
              to="/log-in" 
              className="btn btn-outline btn-lg gap-2 w-full sm:w-auto"
            >
              Already Have Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Powerful Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Feature 1 */}
          <div className="group p-8 bg-base-100 rounded-2xl border border-base-200 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <BookOpen className="size-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Quick Capture</h3>
            <p className="text-base-content/70">
              Jot down your thoughts instantly with a beautiful, intuitive editor.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group p-8 bg-base-100 rounded-2xl border border-base-200 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Smartphone className="size-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Works Everywhere</h3>
            <p className="text-base-content/70">
              Access your notes on desktop, tablet, or phone. PWA with offline support.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group p-8 bg-base-100 rounded-2xl border border-base-200 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Lock className="size-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Secure & Private</h3>
            <p className="text-base-content/70">
              Your notes are encrypted and stored securely. Your privacy matters.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group p-8 bg-base-100 rounded-2xl border border-base-200 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Zap className="size-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
            <p className="text-base-content/70">
              Built with modern tech for blazing-fast performance and smooth experience.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="group p-8 bg-base-100 rounded-2xl border border-base-200 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Clock className="size-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Organize with Folders</h3>
            <p className="text-base-content/70">
              Create folders and pin notes to keep everything organized just how you like it.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="group p-8 bg-base-100 rounded-2xl border border-base-200 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Share2 className="size-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Rich Formatting</h3>
            <p className="text-base-content/70">
              Format text, add lists, include links, and more. Beautiful editing experience.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Loved by Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-base-100 rounded-xl border border-base-200">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-warning text-lg">★</span>
              ))}
            </div>
            <p className="text-base-content/80 mb-4">
              "Finally a notes app that just works. Clean, fast, and exactly what I needed."
            </p>
            <p className="font-semibold text-sm">Alex, Student</p>
          </div>
          <div className="p-8 bg-base-100 rounded-xl border border-base-200">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-warning text-lg">★</span>
              ))}
            </div>
            <p className="text-base-content/80 mb-4">
              "The offline support is incredible. I can work anywhere without worrying."
            </p>
            <p className="font-semibold text-sm">Jordan, Developer</p>
          </div>
          <div className="p-8 bg-base-100 rounded-xl border border-base-200">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-warning text-lg">★</span>
              ))}
            </div>
            <p className="text-base-content/80 mb-4">
              "Best note-taking experience I've had. Beautiful design and powerful features."
            </p>
            <p className="font-semibold text-sm">Sam, Professional</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-16">Questions?</h2>
        <div className="space-y-4">
          <div className="collapse collapse-arrow bg-base-100 border border-base-200">
            <input type="checkbox" />
            <div className="collapse-title font-semibold text-lg">
              Is GenNotes free?
            </div>
            <div className="collapse-content text-base-content/80">
              <p>Yes! GenNotes is completely free to use. We believe everyone should have access to a great note-taking app.</p>
            </div>
          </div>

          <div className="collapse collapse-arrow bg-base-100 border border-base-200">
            <input type="checkbox" />
            <div className="collapse-title font-semibold text-lg">
              How is my data secured?
            </div>
            <div className="collapse-content text-base-content/80">
              <p>We use industry-standard encryption and secure authentication. Your GenNotes are only accessible to you.</p>
            </div>
          </div>

          <div className="collapse collapse-arrow bg-base-100 border border-base-200">
            <input type="checkbox" />
            <div className="collapse-title font-semibold text-lg">
              Can I use it offline?
            </div>
            <div className="collapse-content text-base-content/80">
              <p>Absolutely! GenNotes is a PWA with full offline support. Continue working and sync when you're back online.</p>
            </div>
          </div>

          <div className="collapse collapse-arrow bg-base-100 border border-base-200">
            <input type="checkbox" />
            <div className="collapse-title font-semibold text-lg">
              What devices can I use?
            </div>
            <div className="collapse-content text-base-content/80">
              <p>GenNotes works on any device with a web browser - desktop, tablet, or smartphone. It even works as an installed app!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Start Taking Beautiful Notes
          </h2>
          <p className="text-lg text-base-content/70 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust GenNotes for their daily note-taking. It's free, fast, and beautiful.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/sign-up" className="btn btn-primary btn-lg gap-2 w-full sm:w-auto">
              Create Free Account
            </Link>
            <Link to="/log-in" className="btn btn-outline btn-lg w-full sm:w-auto">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-base-300/30 mt-20 py-12 text-center text-base-content/60 text-sm">
        <p>© 2024 GenNotes. Built with ❤️ for note-taking enthusiasts.</p>
      </footer>
    </div>
  );
};

export default Home;
