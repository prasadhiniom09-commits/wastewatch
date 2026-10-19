import React from 'react';
import { ShieldCheck, BookOpen, ExternalLink } from 'lucide-react';
import { ActivePage } from './Navbar';

interface FooterProps {
  setActivePage: (page: ActivePage) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActivePage }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-sm">
          {/* Col 1 */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">CIVIC PULSE</span>
              <span className="text-xs text-teal-400 font-mono">Civil Engineering Decision Support</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
              AI-Based Road Safety & Infrastructure Analytics System designed to transform official
              Ministry of Road Transport & Highways (MoRTH) data into empirical engineering insights,
              exposure-adjusted risk scoring, and evidence-based highway safety interventions.
            </p>
            <div className="text-xs text-slate-400 flex items-center gap-2 pt-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Data Source: MoRTH Government of India (RA2019_A2)</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase font-mono">
              Analytical Modules
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => setActivePage('dashboard')}
                  className="hover:text-white transition-colors"
                >
                  National Dashboard & KPIs
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('analyzer')}
                  className="hover:text-white transition-colors"
                >
                  State-Level Exposure Analyzer
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('comparison')}
                  className="hover:text-white transition-colors"
                >
                  Multi-State Indicator Matrix
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('prediction')}
                  className="hover:text-white transition-colors"
                >
                  Historical Trend Regression
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('priority')}
                  className="hover:text-white transition-colors"
                >
                  Road Safety Priority Score
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase font-mono">
              Engineering Norms
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>IRC:SP:88 Road Safety Audits</li>
              <li>IRC:103 Pedestrian Facilities</li>
              <li>IRC:99 Traffic Calming Code</li>
              <li>IRC:52 Hill Road Geometry</li>
              <li>MoRTH Black Spot Protocol</li>
              <li>
                <button
                  onClick={() => setActivePage('methodology')}
                  className="text-teal-400 hover:text-teal-300 transition-colors inline-flex items-center gap-1"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Full Methodology & Pipeline</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Academic Prototype Mandatory Disclaimer */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-400 space-y-2 leading-relaxed">
          <p className="font-medium text-slate-300">
            Disclaimer: This application is an academic decision-support prototype based on historical
            government data. Results are analytical estimates and should not replace professional
            road-safety studies or official planning decisions.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-400 pt-2 font-mono">
            <span>Source: Government of India Open Government Data Platform · MoRTH · Road Accidents in India 2019</span>
            <span>Academic Mini-Project Prototype</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
