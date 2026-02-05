import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  ChevronRight,
  Moon,
  Sun,
  Bell,
  Lock,
  User,
  LogOut,
  ArrowLeft,
  Database,
  HelpCircle,
  Info,
  Mail,
  Shield,
  Smartphone,
  Fingerprint,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import BiometricSetup from '../components/BiometricSetup';
import DashboardSidebar from '../components/dashboard/Sidebar';
import DashboardBottomNav from '../components/dashboard/BottomNav';

const Settings = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [updatingTheme, setUpdatingTheme] = useState(false);
  const [updatingNotifications, setUpdatingNotifications] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);

  // Fetch user data and preferences from database
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/api/v1/users/me');
        
        let userData = null;
        if (response.data?.data) {
          userData = response.data.data;
        } else if (response.data?.user) {
          userData = response.data.user;
        } else {
          userData = response.data;
        }
        
        if (userData && userData.email) {
          setUser(userData);
          
          // Load preferences from database
          if (userData.preferences?.theme) {
            const isDarkTheme = userData.preferences.theme === 'dark';
            setIsDark(isDarkTheme);
          }
          if (userData.preferences?.notificationsEnabled !== undefined) {
            setNotificationsEnabled(userData.preferences.notificationsEnabled);
          }
          
          // Update localStorage with fresh data for fallback
          localStorage.setItem('userEmail', userData.email);
          localStorage.setItem('userName', userData.name || 'User');
        }
      } catch (error) {
        console.error('Error fetching user from API:', error);
        // Fallback to localStorage
        const storedEmail = localStorage.getItem('userEmail');
        const storedName = localStorage.getItem('userName');
        
        if (storedEmail || storedName) {
          setUser({
            email: storedEmail || 'user@example.com',
            name: storedName || 'User',
          });
        } else {
          setUser({
            email: 'user@example.com',
            name: 'User',
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Fetch notes and folders for sidebar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notesRes, foldersRes] = await Promise.all([
          api.get('/api/v1/notes').catch(() => ({ data: [] })),
          api.get('/api/v1/folders').catch(() => ({ data: [] })),
        ]);
        setNotes(notesRes.data || []);
        setFolders(foldersRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    const token = localStorage.getItem('token');
    if (token) {
      fetchData();
    }
  }, []);

  // Update theme in database AND localStorage
  const handleThemeChange = async (newDarkMode) => {
    setUpdatingTheme(true);
    try {
      const themeValue = newDarkMode ? 'dark' : 'light';
      
      // Update database
      const response = await api.put('/api/v1/users/preferences', {
        theme: themeValue
      });
      
      console.log('Theme update response:', response);
      
      // Update state and UI
      setIsDark(newDarkMode);
      localStorage.setItem('theme', themeValue);
      document.documentElement.classList.toggle('dark', newDarkMode);
      
      // Update user data to reflect new preference
      if (response.data?.data) {
        setUser(response.data.data);
      }
      
      toast.success('Theme updated successfully');
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error message:', error.message);
      
      // Still update locally as fallback
      setIsDark(newDarkMode);
      localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', newDarkMode);
      
      // Show specific error message from server if available
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update theme';
      toast.error(errorMsg);
    } finally {
      setUpdatingTheme(false);
    }
  };

  // Update notifications in database AND localStorage
  const handleNotificationsChange = async (enabled) => {
    setUpdatingNotifications(true);
    try {
      // Update database
      const response = await api.put('/api/v1/users/preferences', {
        notificationsEnabled: enabled
      });
      
      console.log('Notifications update response:', response);
      
      // Update state
      setNotificationsEnabled(enabled);
      localStorage.setItem('notificationsEnabled', enabled.toString());
      
      // Update user data to reflect new preference
      if (response.data?.data) {
        setUser(response.data.data);
      }
      
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error message:', error.message);
      
      // Still update locally as fallback
      setNotificationsEnabled(enabled);
      localStorage.setItem('notificationsEnabled', enabled.toString());
      
      // Show specific error message from server if available
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update notifications';
      toast.error(errorMsg);
    } finally {
      setUpdatingNotifications(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/api/v1/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
      localStorage.removeItem('theme');
      localStorage.removeItem('notificationsEnabled');
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear storage anyway
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
      localStorage.removeItem('theme');
      localStorage.removeItem('notificationsEnabled');
      navigate('/');
    }
  };

  const SettingItem = ({ icon: Icon, label, value, onClick, toggle, toggleValue, isLoading }) => (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        'w-full flex items-center justify-between p-4 rounded-lg transition-colors border',
        isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer',
        isDark
          ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800'
          : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        <Icon size={20} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
        <div className="text-left">
          <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>{label}</p>
          {value && <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-600')}>{value}</p>}
        </div>
      </div>
      {toggle ? (
        <div className={cn(
          'w-12 h-6 rounded-full transition-colors flex items-center',
          toggleValue ? 'bg-blue-600' : isDark ? 'bg-slate-700' : 'bg-slate-300'
        )}>
          <div className={cn(
            'w-5 h-5 rounded-full bg-white transition-transform',
            toggleValue ? 'translate-x-6' : 'translate-x-0.5'
          )} />
        </div>
      ) : (
        <ChevronRight size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
      )}
    </button>
  );

  const SectionHeader = ({ title }) => (
    <h3 className={cn('text-xs font-semibold uppercase tracking-wider px-4 mb-3', isDark ? 'text-slate-400' : 'text-slate-600')}>
      {title}
    </h3>
  );

  if (loading) {
    return (
      <div className={cn('min-h-screen flex items-center justify-center', isDark ? 'bg-slate-900' : 'bg-white')}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex h-screen transition-colors duration-300",
      isDark 
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900" 
        : "bg-white"
    )}>
      {/* Sidebar - Desktop only */}
      <DashboardSidebar 
        totalNotes={notes.length}
        folders={folders}
        onFolderSelect={(folderId) => navigate(`/all-notes/${folderId}`)}
        onFolderCreated={(newFolder) => {
          setFolders([...folders, newFolder]);
        }}
        isDark={isDark}
        notes={notes}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Settings Content */}
        <div className={cn('min-h-screen pb-24 overflow-y-auto', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
          {/* Header */}
          <div className={cn(
            'sticky top-0 z-40 border-b',
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          )}>
            <div className="flex items-center gap-3 p-4">
              <button
                onClick={() => navigate('/all-notes')}
                className={cn('p-2 rounded-lg transition-colors', isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-200')}
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className={cn('text-xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>Settings</h1>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="p-4 space-y-4">
            <div className={cn(
              'rounded-xl p-6 border',
              isDark ? 'bg-gradient-to-br from-slate-800 to-slate-800/50 border-slate-700/50' : 'bg-gradient-to-br from-blue-50 to-slate-100 border-slate-200'
            )}>
              <div className="flex items-center gap-4 mb-4">
                <div className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center',
                  isDark ? 'bg-blue-600' : 'bg-blue-500'
                )}>
                  <User size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className={cn('text-sm text-slate-500 mb-1')}>Account</p>
                  <p className={cn('font-semibold text-lg', isDark ? 'text-white' : 'text-slate-900')}>
                    {user?.name || 'User'}
                  </p>
                  <p className={cn('text-sm flex items-center gap-1', isDark ? 'text-slate-400' : 'text-slate-600')}>
                    <Mail size={14} />
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
            </div>

            {/* Display Section */}
            <div>
              <SectionHeader title="Display" />
              <div className="space-y-2">
                <SettingItem
                  icon={isDark ? Moon : Sun}
                  label={isDark ? 'Dark Mode' : 'Light Mode'}
                  value={isDark ? 'On' : 'Off'}
                  toggle={true}
                  toggleValue={isDark}
                  isLoading={updatingTheme}
                  onClick={() => !updatingTheme && handleThemeChange(!isDark)}
                />
              </div>
            </div>

            {/* Notifications Section */}
            <div>
              <SectionHeader title="Notifications" />
              <div className="space-y-2">
                <SettingItem
                  icon={Bell}
                  label="Enable Notifications"
                  value={notificationsEnabled ? 'Enabled' : 'Disabled'}
                  toggle={true}
                  toggleValue={notificationsEnabled}
                  isLoading={updatingNotifications}
                  onClick={() => !updatingNotifications && handleNotificationsChange(!notificationsEnabled)}
                />
              </div>
            </div>

            {/* Privacy & Security Section */}
            <div>
              <SectionHeader title="Privacy & Security" />
              <div className="space-y-2">
                <SettingItem
                  icon={Fingerprint}
                  label="Biometric Unlock"
                  value="Fingerprint or Face ID"
                  onClick={() => {}} // Handled by BiometricSetup component
                />
              </div>
            </div>

            {/* Biometric Setup */}
            <div>
              <SectionHeader title="Biometric Authentication" />
              <BiometricSetup token={localStorage.getItem('token')} isDark={isDark} />
            </div>

            {/* Additional Security */}
            <div>
              <SectionHeader title="Additional Security" />
              <div className="space-y-2">
                <SettingItem
                  icon={Lock}
                  label="Change Password"
                  value="Secure your account"
                  onClick={() => toast.info('Password change coming soon')}
                />
                <SettingItem
                  icon={Shield}
                  label="Two-Factor Authentication"
                  value="Not enabled"
                  onClick={() => toast.info('2FA coming soon')}
                />
              </div>
            </div>

            {/* Data Section */}
            <div>
              <SectionHeader title="Data" />
              <div className="space-y-2">
                <SettingItem
                  icon={Database}
                  label="Storage"
                  value="Unlimited storage"
                  onClick={() => toast.info('View your storage details')}
                />
                <SettingItem
                  icon={Smartphone}
                  label="Backup & Sync"
                  value="Auto-sync enabled"
                  onClick={() => toast.info('Manage backup settings')}
                />
              </div>
            </div>

            {/* Support Section */}
            <div>
              <SectionHeader title="Support & About" />
              <div className="space-y-2">
                <SettingItem
                  icon={HelpCircle}
                  label="Help & Support"
                  value="Contact our team"
                  onClick={() => toast.info('Support coming soon')}
                />
                <SettingItem
                  icon={Info}
                  label="About GenNotes"
                  value="Version 1.0.0"
                  onClick={() => toast.info('© 2026 GenNotes. All rights reserved.')}
                />
              </div>
            </div>

            {/* Danger Zone */}
            <div>
              <SectionHeader title="Account" />
              <div className="space-y-2">
                <button
                  onClick={handleLogout}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 rounded-lg transition-colors border font-medium',
                    isDark
                      ? 'bg-red-900/20 border-red-700/50 hover:bg-red-900/30 text-red-400'
                      : 'bg-red-50 border-red-200 hover:bg-red-100 text-red-600'
                  )}
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className={cn('text-center py-4 text-xs', isDark ? 'text-slate-500' : 'text-slate-600')}>
              <p>GenNotes © 2026</p>
              <p>Made with ❤️ for note takers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Mobile only */}
      <DashboardBottomNav isDark={isDark} />
    </div>
  );
};

export default Settings;


