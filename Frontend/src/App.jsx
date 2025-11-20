import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import reminderService from './services/reminderService';

export default function App() {
  const location = useLocation();
  
  // Show navbar on all pages except auth pages
  const authPages = ['/log-in', '/sign-up', '/forgot-password', '/verify-otp'];
  const isAuthPage = authPages.some(page => location.pathname.startsWith(page));

  // Initialize reminders and notifications
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Request notification permission
      reminderService.constructor.requestNotificationPermission();
      
      // Start checking for upcoming reminders every minute
      reminderService.startReminderCheck(1);
    }

    return () => {
      reminderService.stopReminderCheck();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-100 to-base-200">
      {!isAuthPage && <Navbar />}
      <main className="transition-all duration-300">
        <Outlet /> {/* This is where nested routes will render */}
      </main>
    </div>
  );
}
