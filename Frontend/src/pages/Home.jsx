import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StickyNote, Rocket, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/all-notes");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <Navbar />
      
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Gen-Notes</h1>
        <p className="text-lg md:text-xl mb-8">Your modern, secure, and lightning-fast note-taking companion.</p>
        <div className="flex justify-center gap-4">
          <Link to="/sign-up" className="btn btn-primary">Get Started</Link>
          <Link to="/log-in" className="btn btn-outline">Log In</Link>
        </div>
      </section>

      {/* Why Use Gen-Notes */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-semibold mb-6 text-center">Why Choose Gen-Notes?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-base-200 rounded-xl text-center shadow">
            <StickyNote className="mx-auto size-10 text-primary mb-4" />
            <h3 className="font-bold mb-2">Organize Effortlessly</h3>
            <p>Quickly create, edit, and manage your notes with an intuitive interface.</p>
          </div>
          <div className="p-6 bg-base-200 rounded-xl text-center shadow">
            <Rocket className="mx-auto size-10 text-primary mb-4" />
            <h3 className="font-bold mb-2">Blazing Fast</h3>
            <p>Enjoy a snappy experience powered by modern tech and optimized performance.</p>
          </div>
          <div className="p-6 bg-base-200 rounded-xl text-center shadow">
            <CheckCircle className="mx-auto size-10 text-primary mb-4" />
            <h3 className="font-bold mb-2">Secure & Private</h3>
            <p>Your notes stay safe with secure authentication and data handling.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-semibold mb-6 text-center">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-base-200 rounded-xl shadow">
            <p className="italic mb-2">"Gen-Notes has simplified my daily workflow. It's fast, minimal, and reliable."</p>
            <h4 className="font-medium">— Priya S., Student</h4>
          </div>
          <div className="p-6 bg-base-200 rounded-xl shadow">
            <p className="italic mb-2">"Finally a note app that's both simple and powerful. Love the clean design!"</p>
            <h4 className="font-medium">— Arjun M., Developer</h4>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="collapse collapse-arrow bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title font-medium">
              Is Gen-Notes free to use?
            </div>
            <div className="collapse-content">
              <p>Yes! Gen-Notes is completely free to use. You can upgrade later for additional features.</p>
            </div>
          </div>
          <div className="collapse collapse-arrow bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title font-medium">
              Can I access my notes from any device?
            </div>
            <div className="collapse-content">
              <p>Absolutely! Gen-Notes is accessible from any device with an internet connection.</p>
            </div>
          </div>
          <div className="collapse collapse-arrow bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title font-medium">
              Are my notes private?
            </div>
            <div className="collapse-content">
              <p>Yes, we use secure authentication and storage to keep your notes private and protected.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Ready to get organized?</h2>
        <Link to="/sign-up" className="btn btn-primary">Create Your Free Account</Link>
      </section>
    </div>
  );
};

export default Home;
