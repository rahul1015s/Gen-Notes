import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import reminderService from './services/reminderService';
import AppShell from './components/AppShell';

export default function App() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  
  // Show new dashboard layout on all pages except auth pages
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
    <AppShell isDark={isDark}>
      <div className="min-h-screen">
        <main className="transition-all duration-300">
          <Outlet /> {/* This is where nested routes will render */}
        </main>
      </div>
    </AppShell>
  );
}
