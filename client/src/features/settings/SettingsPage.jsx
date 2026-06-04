import { useState } from 'react';
import { User, Settings as SettingsIcon, Bell, Shield, Moon, LogOut, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import useToast from '../../store/useToast';
import api from '../../services/api';

const SettingsPage = () => {
  const { user, logout, updateProfile } = useAuth();
  const { addToast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ name, email });
      addToast('Profile updated successfully!', 'success');
    } catch (error) {
      addToast('Failed to update profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pb-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <SettingsIcon className="text-[var(--primary-color)]" size={32} />
          Settings
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">Manage your account and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-2">
          <button className="w-full text-left p-3 rounded-xl bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-medium flex items-center gap-3">
            <User size={18} /> Profile Details
          </button>
          <button className="w-full text-left p-3 rounded-xl hover:bg-[var(--bg-color)] text-[var(--text-secondary)] hover:text-white transition-colors flex items-center gap-3">
            <Bell size={18} /> Notifications
          </button>
          <button className="w-full text-left p-3 rounded-xl hover:bg-[var(--bg-color)] text-[var(--text-secondary)] hover:text-white transition-colors flex items-center gap-3">
            <Shield size={18} /> Security & Privacy
          </button>
          <button className="w-full text-left p-3 rounded-xl hover:bg-[var(--bg-color)] text-[var(--text-secondary)] hover:text-white transition-colors flex items-center gap-3">
            <Moon size={18} /> Appearance
          </button>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-6">Profile Details</h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Display Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-white focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-white focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                />
              </div>

              <div className="pt-4">
                <button type="submit" disabled={loading} className="bg-[var(--primary-color)] text-black font-bold py-2 px-6 rounded-xl hover:bg-[var(--primary-hover)] transition-all flex items-center gap-2">
                  {loading && <Loader size={16} className="animate-spin" />} Save Changes
                </button>
              </div>
            </form>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-red-500/20">
            <h2 className="text-xl font-bold mb-2 text-red-500">Danger Zone</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">These actions cannot be undone.</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={logout} className="flex-1 py-2 px-4 rounded-xl border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all font-medium flex items-center justify-center gap-2">
                <LogOut size={18} /> Sign Out Everywhere
              </button>
              <button className="flex-1 py-2 px-4 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all font-medium">
                Delete Account
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
