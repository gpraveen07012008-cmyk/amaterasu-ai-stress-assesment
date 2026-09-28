import React from 'react';
import { AlertTriangle, Phone, ShieldCheck, X, HeartHandshake, ExternalLink } from 'lucide-react';
import { CRISIS_RESOURCES } from '../config/supportResources';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose, reason }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl shadow-rose-950/50 max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-rose-400 mb-3">
          <div className="p-3 bg-rose-500/20 rounded-2xl border border-rose-500/30">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Immediate Support & Crisis Helplines</h2>
            <p className="text-xs text-rose-300 font-medium">Free • 24/7 • Confidential Listening Services</p>
          </div>
        </div>

        {reason ? (
          <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-3.5 mb-6 text-xs text-rose-200">
            {reason}
          </div>
        ) : (
          <p className="text-sm text-slate-300 mb-6">
            If you or someone you know is going through an intense emotional crisis, having thoughts of self-harm, or feeling overwhelmed beyond coping, please reach out to trained support right now. You are not alone.
          </p>
        )}

        <div className="space-y-3 mb-6">
          {CRISIS_RESOURCES.map((resource, idx) => (
            <div
              key={idx}
              className="bg-slate-800/60 border border-slate-700/60 hover:border-rose-500/30 rounded-2xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{resource.name}</span>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                    {resource.countryRegion}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{resource.description}</p>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                  <span>⏱ {resource.hours}</span>
                  <span>•</span>
                  <span>{resource.type}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <a
                  href={resource.contact.startsWith('http') ? resource.contact : `tel:${resource.contact.replace(/[^\d+]/g, '')}`}
                  target={resource.contact.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-rose-600/30"
                >
                  {resource.contact.startsWith('http') ? (
                    <>
                      <span>Open Website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <Phone className="w-3.5 h-3.5" />
                      <span>{resource.contact}</span>
                    </>
                  )}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Actionable compassionate advice */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-200">
            <HeartHandshake className="w-4 h-4 text-indigo-400" />
            <span>Additional Immediate Steps:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
            <li>Call or sit with a family member, trusted friend, or roommate right now.</li>
            <li>If you are in imminent physical danger, please visit the emergency department of your nearest hospital.</li>
            <li>Take slow, steady breaths and step away from stressful triggers or isolated spaces.</li>
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            Return to Amaterasu
          </button>
        </div>
      </div>
    </div>
  );
};
