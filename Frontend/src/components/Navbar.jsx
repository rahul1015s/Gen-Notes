import { Link, useNavigate } from 'react-router-dom';
import { Plus, LogIn, UserPlus, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import ThemeSwitcher from '../theme/ThemeSwitcher';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.href = "/";
  };

  return (
    <header className="bg-base-300 border-b border-base-content/10 shadow-sm sticky top-0 z-50">
      <div className="navbar max-w-6xl mx-auto px-4 py-2">
        {/* Left: Brand */}
        <div className="flex-1">
          <Link to="/" className="text-2xl font-bold font-mono text-primary tracking-tight">
            Gen-Notes
          </Link>
        </div>

        {/* Right: Desktop Menu */}
        <div className="flex-none items-center gap-3 hidden sm:flex">
          <ThemeSwitcher />

          {token ? (
            <>
              <Link to="/create" className="btn btn-primary btn-sm">
                <Plus className="size-4" />
                <span className="hidden md:inline">New Note</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                <LogOut className="size-4" />
                <span className="hidden md:inline">Log Out</span>
              </button>
            </>
          ) : (
            // Show login only on large screens
            <div className="hidden lg:flex gap-3">
              <Link to="/log-in" className="btn btn-outline btn-sm">
                <LogIn className="size-4" />
                <span className="hidden md:inline">Log In</span>
              </Link>
              <Link to="/sign-up" className="btn btn-primary btn-sm">
                <UserPlus className="size-4" />
                <span className="hidden md:inline">Sign Up</span>
              </Link>
            </div>
          )}
        </div>

        {/* Right: Mobile Menu */}
        <div className="sm:hidden flex items-center gap-2">
          <ThemeSwitcher />
          <button
            className="btn btn-ghost btn-square"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu (only if logged in) */}
      {isMobileMenuOpen && token && (
        <div className="sm:hidden bg-base-200 px-4 py-3 space-y-2 border-t border-base-content/10">
          {/* <Link to="/create" className="btn btn-primary btn-sm w-full">
            <Plus className="size-4" />
            <span>New Note</span>
          </Link> */}
          <button onClick={handleLogout} className="btn btn-outline btn-sm w-full">
            <LogOut className="size-4" />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
