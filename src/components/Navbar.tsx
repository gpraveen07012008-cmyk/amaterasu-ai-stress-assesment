import React, { useState } from 'react';
import { Sparkles, PhoneCall, ShieldAlert, Award, User, LogOut, MessageSquare, HeartPulse, History, ChevronDown, Menu, X, Sun } from 'lucide-react';
import { UserProfile, SupportRegion } from '../types';
import { EmergencyModal } from './EmergencyModal';

interface NavbarProps {
  user: UserProfile | null;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  onSelectDemoMode: (region: SupportRegion) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentPath,
  onNavigate,
  onLogout,
  onSelectDemoMode
}) => {
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: 'dashboard', icon: Sparkles },
    { label: 'Assessment', path: 'assessment', icon: HeartPulse },
    { label: 'Support & Care', path: 'personalized-support', icon: Sun },
    { label: 'Communication', path: 'communication', icon: MessageSquare },
    { label: 'Call History', path: 'call-history', icon: History },
    { label: 'Credits', path: 'credits', icon: Award },
    { label: 'Professionals', path: 'professional-support', icon: PhoneCall },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#080D1A]/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#0B1120] rounded-[10px] flex items-center justify-center">
                  <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-indigo-200 to-white">
                  AMATERASU
                </span>
                <span className="text-[9px] uppercase tracking-widest text-indigo-400 font-semibold -mt-1">
                  AI Stress Screening
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            {user && (
              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => onNavigate(item.path)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            )}

            {/* Right actions: Demo switcher, Credits, Emergency SOS, Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Quick Demo Mode Dropdown (Crucial for evaluators & judges) */}
              <div className="relative">
                <button
                  onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-500/40 hover:border-indigo-400 text-indigo-300 rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  <span className="hidden sm:inline">DEMO MODES</span>
                  <span className="sm:hidden">DEMO</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {demoDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Faculty / Judge Quick Demo
                    </div>
                    <button
                      onClick={() => {
                        onSelectDemoMode('GREEN');
                        setDemoDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs rounded-xl hover:bg-emerald-500/10 text-emerald-300 transition-colors"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <div>
                        <div className="font-bold">DEMO GREEN (SVI: 18)</div>
                        <div className="text-[10px] text-slate-400">Low distress, gentle routine</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        onSelectDemoMode('ORANGE');
                        setDemoDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs rounded-xl hover:bg-amber-500/10 text-amber-300 transition-colors"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div>
                        <div className="font-bold">DEMO ORANGE (SVI: 56)</div>
                        <div className="text-[10px] text-slate-400">Moderate distress, peer match</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        onSelectDemoMode('RED');
                        setDemoDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs rounded-xl hover:bg-rose-500/10 text-rose-300 transition-colors"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <div>
                        <div className="font-bold">DEMO RED (SVI: 84)</div>
                        <div className="text-[10px] text-slate-400">High distress, pro referral</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Emergency Hotline Trigger */}
              <button
                onClick={() => setShowEmergencyModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25 text-rose-300 rounded-xl text-xs font-bold transition-all"
                title="Immediate 24/7 Crisis Helplines"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span className="hidden sm:inline">CRISIS HELP</span>
              </button>

              {user && (
                <>
                  {/* Credits Badge */}
                  <button
                    onClick={() => onNavigate('credits')}
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold shadow-inner hover:border-amber-400 transition-all"
                    title="Current Support Credits"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>{user.credits} / 100</span>
                  </button>

                  {/* Profile / Logout */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onNavigate('profile')}
                      className={`p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors ${
                        currentPath === 'profile' ? 'bg-slate-800 text-indigo-400' : ''
                      }`}
                      title="User Profile & Privacy"
                    >
                      <User className="w-4 h-4" />
                    </button>
                    <button
                      onClick={onLogout}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Log Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}

              {/* Mobile hamburger menu */}
              {user && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-slate-200" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && user && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 px-4 pt-2 pb-4 space-y-1">
            <div className="flex items-center justify-between py-2 px-3 border-b border-slate-800 text-xs text-slate-300 mb-2">
              <span>Signed in as <b className="text-white">{user.name}</b></span>
              <span className="text-amber-400 font-bold">{user.credits} / 100 Credits</span>
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    onNavigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    currentPath === item.path
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Emergency Helpline Modal */}
      <EmergencyModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
      />
    </>
  );
};
