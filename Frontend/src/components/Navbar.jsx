import { Link, useNavigate } from 'react-router-dom';
import { Plus, LogIn, UserPlus, LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="bg-base-300 border-b border-base-content/10 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="text-2xl md:text-3xl font-bold text-primary font-mono tracking-tighter">
          Gen-Notes
        </Link>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-3">

          {token ? (
            <>
              <Link to="/create" className="btn btn-primary btn-sm flex items-center gap-2">
                <Plus className="size-4" />
                <span>New Note</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-outline btn-sm flex items-center gap-2">
                <LogOut className="size-4" />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/log-in" className="btn btn-outline btn-sm flex items-center gap-2">
                <LogIn className="size-4" />
                <span>Log In</span>
              </Link>
              <Link to="/sign-up" className="btn btn-primary btn-sm flex items-center gap-2">
                <UserPlus className="size-4" />
                <span>Sign Up</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
