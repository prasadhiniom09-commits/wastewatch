import React from 'react';
import { Download, Compass } from 'lucide-react';
import { StateRecord } from '../types/accident';
import { GlobalSearchBar } from './shared/GlobalSearchBar';

export type ActivePage =
  | 'home'
  | 'dashboard'
  | 'analyzer'
  | 'comparison'
  | 'prediction'
  | 'priority'
  | 'recommendations'
  | 'methodology';

interface NavbarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  onDownloadCsv: () => void;
  states: StateRecord[];
  onSelectState: (stateName: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  onDownloadCsv,
  states,
  onSelectState,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Universal Top Bar Contract: Zone 1 (Brand) — Zone 2 (Primary Nav) — Zone 3 (Search & Action) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => setActivePage('home')}
          className="flex items-center gap-2.5 text-left group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-sm">
            <Compass className="w-5 h-5 text-teal-100" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap group-hover:text-teal-800 transition-colors">
            CIVIC PULSE
          </span>
        </button>

        {/* Zone 2: Primary Navigation Links */}
        <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActivePage('home')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activePage === 'home'
                ? 'text-teal-700 font-semibold border-b-2 border-teal-700 pb-0.5'
                : 'hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActivePage('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activePage === 'dashboard'
                ? 'text-teal-700 font-semibold border-b-2 border-teal-700 pb-0.5'
                : 'hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActivePage('analyzer')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activePage === 'analyzer'
                ? 'text-teal-700 font-semibold border-b-2 border-teal-700 pb-0.5'
                : 'hover:text-slate-900'
            }`}
          >
            State Analyzer
          </button>
          <button
            onClick={() => setActivePage('comparison')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activePage === 'comparison'
                ? 'text-teal-700 font-semibold border-b-2 border-teal-700 pb-0.5'
                : 'hover:text-slate-900'
            }`}
          >
            Comparison
          </button>
          <button
            onClick={() => setActivePage('prediction')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activePage === 'prediction'
                ? 'text-teal-700 font-semibold border-b-2 border-teal-700 pb-0.5'
                : 'hover:text-slate-900'
            }`}
          >
            AI Trends
          </button>
          <button
            onClick={() => setActivePage('priority')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activePage === 'priority'
                ? 'text-teal-700 font-semibold border-b-2 border-teal-700 pb-0.5'
                : 'hover:text-slate-900'
            }`}
          >
            Priority
          </button>
          <button
            onClick={() => setActivePage('recommendations')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activePage === 'recommendations'
                ? 'text-teal-700 font-semibold border-b-2 border-teal-700 pb-0.5'
                : 'hover:text-slate-900'
            }`}
          >
            Interventions
          </button>
          <button
            onClick={() => setActivePage('methodology')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activePage === 'methodology'
                ? 'text-teal-700 font-semibold border-b-2 border-teal-700 pb-0.5'
                : 'hover:text-slate-900'
            }`}
          >
            Methodology
          </button>
        </nav>

        {/* Zone 3: Global Search Bar & Primary CSV Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:block">
            <GlobalSearchBar
              states={states}
              onSelectState={onSelectState}
              setActivePage={setActivePage}
              placeholder="Search State / UT... (/)"
              variant="navbar"
            />
          </div>

          <button
            onClick={onDownloadCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-sm"
            title="Download the official MoRTH RA2019_A2.csv dataset"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Dataset CSV</span>
            <span className="md:hidden">CSV</span>
          </button>
        </div>
      </div>

      {/* Mobile Global Search Bar & Page Tab Strip */}
      <div className="xl:hidden border-t border-slate-200 px-4 py-2 bg-slate-50 space-y-2">
        <div className="sm:hidden w-full">
          <GlobalSearchBar
            states={states}
            onSelectState={onSelectState}
            setActivePage={setActivePage}
            placeholder="Search State or UT..."
            variant="navbar"
          />
        </div>

        <div className="flex items-center gap-2 text-xs overflow-x-auto pb-0.5">
          {[
            { id: 'home', label: 'Home' },
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'analyzer', label: 'State Analyzer' },
            { id: 'comparison', label: 'Comparison' },
            { id: 'prediction', label: 'AI Trend' },
            { id: 'priority', label: 'Priority Score' },
            { id: 'recommendations', label: 'Interventions' },
            { id: 'methodology', label: 'Methodology' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as ActivePage)}
              className={`px-3 py-1.5 rounded font-medium whitespace-nowrap transition-colors ${
                activePage === item.id
                  ? 'bg-teal-700 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
