import React, { useState } from 'react';
import { 
  PhoneCall, 
  MapPin, 
  Clock, 
  Mail, 
  ShieldAlert, 
  CheckCircle2, 
  Search, 
  Filter, 
  ExternalLink, 
  Star, 
  Award,
  Calendar
} from 'lucide-react';
import { DEMO_PROFESSIONALS } from '../data/professionals';
import { ProfessionalProvider } from '../types';
import { EmergencyModal } from '../components/EmergencyModal';

export const ProfessionalSupport: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedMode, setSelectedMode] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmergency, setShowEmergency] = useState(false);
  const [bookingSuccessProvider, setBookingSuccessProvider] = useState<string | null>(null);

  const roles = ['All', 'Psychologist', 'Psychiatrist', 'Counsellor', 'Government support service'];
  const modes = ['All', 'Online', 'Offline', 'Both'];

  const filteredProviders = DEMO_PROFESSIONALS.filter((p) => {
    if (selectedRole !== 'All' && p.role !== selectedRole) return false;
    if (selectedMode !== 'All' && p.mode !== selectedMode && p.mode !== 'Both') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.specialization.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleBookDemoConsultation = (name: string) => {
    setBookingSuccessProvider(name);
    setTimeout(() => setBookingSuccessProvider(null), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              HIGH SUPPORT PRIORITY PATHWAY (RED)
            </span>
            <span className="text-xs text-slate-400">• Certified Care Linkages</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Professional Support & Clinical Referrals
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Licensed psychologists, psychiatrists, mental health counselors, and 24/7 government tele-counseling hotlines.
          </p>
        </div>

        <button
          onClick={() => setShowEmergency(!showEmergency)}
          className="flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-rose-600/30 transition-all self-start md:self-center"
        >
          <ShieldAlert className="w-4 h-4 animate-pulse" />
          <span>24/7 Immediate Crisis Helplines</span>
        </button>
      </div>

      {/* Mandatory Demo Data Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
        <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded-md text-[10px] uppercase shrink-0">
          DEMO DATA
        </span>
        <p className="leading-relaxed">
          The providers listed below are synthetic/prototype profiles for system demonstration. Do NOT treat these as active medical endorsements. In real deployments, verified hospital and clinic registries are plugged into this directory.
        </p>
      </div>

      {bookingSuccessProvider && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>
            Demo consultation request logged for <b>{bookingSuccessProvider}</b>. A prototype intake confirmation has been simulated.
          </span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, specialization, or location..."
              className="w-full bg-slate-950/80 border border-slate-700 focus:border-indigo-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold mr-1">Role:</span>
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedRole === r
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold mr-1">Mode:</span>
            {modes.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMode(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedMode === m
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProviders.map((provider) => (
          <div
            key={provider.id}
            className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 rounded-3xl p-6 backdrop-blur-sm transition-all hover:shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden"
          >
            {/* Demo Watermark Badge */}
            <div className="absolute top-4 right-4">
              <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 rounded-md text-[9px] font-mono uppercase tracking-wider font-bold">
                DEMO DATA
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-indigo-400">{provider.role}</span>
                <span className="text-slate-600">•</span>
                <span className="text-[11px] text-amber-400 flex items-center gap-1 font-mono">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {provider.rating.toFixed(1)}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white">{provider.name}</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{provider.qualification}</p>

              <div className="mt-3 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
                <span className="text-slate-400 font-semibold block mb-0.5">Specialization:</span>
                <span className="text-slate-200">{provider.specialization}</span>
              </div>

              <p className="text-xs text-slate-300 mt-3 leading-relaxed">{provider.bio}</p>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Availability: <b className="text-slate-300">{provider.availability}</b></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Location: <b className="text-slate-300">{provider.location}</b></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Contact: <b className="text-slate-300">{provider.contact}</b></span>
              </div>

              <div className="pt-3 flex items-center gap-2">
                <button
                  onClick={() => handleBookDemoConsultation(provider.name)}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 text-center"
                >
                  Schedule Demo Consultation
                </button>
                <a
                  href={`tel:${provider.contact.replace(/[^\d+]/g, '')}`}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
                  title="Call Contact"
                >
                  <PhoneCall className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <EmergencyModal isOpen={showEmergency} onClose={() => setShowEmergency(false)} />
    </div>
  );
};
