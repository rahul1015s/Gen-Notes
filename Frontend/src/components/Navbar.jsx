import { Link, useNavigate } from 'react-router-dom';
import { Plus, LogIn, UserPlus, LogOut, Menu, X, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import ThemeSwitcher from '../theme/ThemeSwitcher';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.href = "/";
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-base-100/95 backdrop-blur-md shadow-md border-b border-base-300/50' 
        : 'bg-base-100 border-b border-base-300/30'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand */}
          <div className="flex items-center gap-2 flex-1">
            <Link to="/" className="flex items-center gap-2 hover:opacity-70 transition">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-xl font-semibold hidden sm:inline text-base-content">GenNotes</span>
            </Link>
          </div>

          {/* Center: Empty (reserved for search on desktop) */}
          <div className="hidden md:flex flex-1 justify-center"></div>

          {/* Right: Desktop Menu */}
          <div className="flex items-center gap-3">
            {token ? (
              <>
                <Link 
                  to="/all-notes" 
                  className="btn btn-ghost btn-sm gap-2 hidden sm:flex"
                >
                  <span>📝</span>
                  <span className="hidden md:inline">My Notes</span>
                </Link>
                <Link 
                  to="/create" 
                  className="btn btn-primary btn-sm gap-2"
                  title="Create new note"
                >
                  <Plus className="size-4" />
                  <span className="hidden md:inline">New</span>
                </Link>
                <ThemeSwitcher />
                <div className="divider divider-horizontal mx-1 h-6 hidden sm:block opacity-20"></div>
                <button 
                  onClick={handleLogout} 
                  className="btn btn-ghost btn-sm gap-2"
                  title="Log out"
                >
                  <LogOut className="size-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <ThemeSwitcher />
                <Link 
                  to="/log-in" 
                  className="btn btn-ghost btn-sm"
                  title="Log in"
                >
                  <LogIn className="size-4" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
                <Link 
                  to="/sign-up" 
                  className="btn btn-primary btn-sm gap-2"
                  title="Sign up"
                >
                  <UserPlus className="size-4" />
                  <span className="hidden sm:inline">Sign Up</span>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              className="btn btn-ghost btn-square btn-sm sm:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && token && (
          <div className="sm:hidden pb-4 space-y-2 border-t border-base-300/30 pt-4 animate-in fade-in slide-in-from-top-2">
            <Link 
              to="/all-notes" 
              className="btn btn-ghost w-full justify-start gap-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>📝</span>
              My Notes
            </Link>
            <button 
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }} 
              className="btn btn-ghost w-full justify-start gap-2 text-error"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
