import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, MapPin, TrendingUp, FileCheck2, Compass } from 'lucide-react';
import { StateRecord } from '../../types/accident';
import { ActivePage } from '../Navbar';

interface GlobalSearchBarProps {
  states: StateRecord[];
  onSelectState: (stateName: string) => void;
  setActivePage: (page: ActivePage) => void;
  placeholder?: string;
  variant?: 'navbar' | 'prominent';
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  states,
  onSelectState,
  setActivePage,
  placeholder = 'Search any State or UT... (Press / to focus)',
  variant = 'navbar',
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter matching states/UTs
  const results = query.trim()
    ? states.filter((s) => s.state.toLowerCase().includes(query.trim().toLowerCase()))
    : [];

  // Global hotkey: press '/' or 'Cmd+K' / 'Ctrl+K' to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'SELECT'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle outside click to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation within results
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = results[highlightedIndex];
      if (target) {
        handleJump(target.state, 'analyzer');
      }
    }
  };

  const handleJump = (stateName: string, targetPage: ActivePage = 'analyzer') => {
    onSelectState(stateName);
    setActivePage(targetPage);
    setQuery('');
    setIsOpen(false);
  };

  const isProminent = variant === 'prominent';

  return (
    <div ref={containerRef} className={`relative ${isProminent ? 'w-full' : 'w-64 lg:w-72'}`}>
      <div
        className={`relative flex items-center transition-all ${
          isProminent
            ? 'bg-white border-2 border-slate-300 focus-within:border-teal-600 rounded-xl shadow-sm'
            : 'bg-slate-100 hover:bg-slate-200/70 focus-within:bg-white border border-slate-200 focus-within:border-teal-600 rounded-lg'
        }`}
      >
        <Search
          className={`text-slate-400 shrink-0 ${
            isProminent ? 'w-5 h-5 ml-4' : 'w-4 h-4 ml-3'
          }`}
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          className={`w-full bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400 font-sans ${
            isProminent ? 'py-3.5 px-3 text-sm' : 'py-1.5 px-2.5 text-xs'
          }`}
        />

        {query ? (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-1 mr-2 text-slate-400 hover:text-slate-600 rounded"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd
            className={`mr-2.5 pointer-events-none select-none rounded bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-400 border border-slate-200 shadow-2xs hidden sm:inline-block`}
          >
            /
          </kbd>
        )}
      </div>

      {/* Instant Dropdown Results */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl shadow-xl border border-slate-200 max-h-96 overflow-y-auto divide-y divide-slate-100">
          {query.trim() === '' ? (
            <div className="p-4 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Suggested Jurisdictions (Click to Jump)
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {['Tamil Nadu', 'Kerala', 'Uttar Pradesh', 'Madhya Pradesh', 'Delhi', 'Goa'].map(
                  (name) => {
                    const st = states.find((s) => s.state === name);
                    if (!st) return null;
                    return (
                      <button
                        key={name}
                        onClick={() => handleJump(name, 'analyzer')}
                        className="text-left px-2.5 py-2 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-between text-slate-800 group"
                      >
                        <span className="font-medium group-hover:text-teal-900 truncate">
                          {name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                          #{st.rank2019 ?? 'NA'}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                <span>Type any State or UT name to filter</span>
                <span>Press Esc to close</span>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2 space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center justify-between">
                <span>
                  Matches ({results.length} of {states.length})
                </span>
                <span className="text-[10px] lowercase text-slate-400">
                  Use ↑ ↓ to navigate · Enter to jump
                </span>
              </div>

              {results.map((st, idx) => {
                const isHighlighted = idx === highlightedIndex;
                const isHigh = st.priority.tier === 'HIGH PRIORITY';
                const isMed = st.priority.tier === 'MEDIUM PRIORITY';

                return (
                  <div
                    key={st.state}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`p-2.5 rounded-lg transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer ${
                      isHighlighted ? 'bg-teal-50 border border-teal-200' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => handleJump(st.state, 'analyzer')}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-teal-700 shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {st.state}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {st.isUT ? 'UT' : 'State'}
                          </span>
                          <span
                            className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded ${
                              isHigh
                                ? 'bg-rose-100 text-rose-800'
                                : isMed
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {st.priority.tier === 'HIGH PRIORITY'
                              ? 'High'
                              : st.priority.tier === 'MEDIUM PRIORITY'
                              ? 'Med'
                              : 'Low'}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 truncate">
                          2019: <strong className="text-slate-800">{st.accidents2019.toLocaleString()}</strong> crashes · Rank #{st.rank2019 ?? 'NA'} · {st.ratePerLakhPop2019 !== null ? `${st.ratePerLakhPop2019.toFixed(1)}/lakh` : 'Pop NA'}
                        </div>
                      </div>
                    </div>

                    {/* Quick Jump Action Pills */}
                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJump(st.state, 'analyzer');
                        }}
                        className="px-2 py-1 text-[11px] font-medium text-teal-800 bg-white hover:bg-teal-100 border border-slate-200 rounded transition-colors"
                        title="Open State Analyzer"
                      >
                        Analyze
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJump(st.state, 'recommendations');
                        }}
                        className="px-2 py-1 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded transition-colors"
                        title="View Engineering Interventions"
                      >
                        Interventions
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJump(st.state, 'prediction');
                        }}
                        className="px-2 py-1 text-[11px] font-medium text-indigo-700 bg-white hover:bg-indigo-50 border border-slate-200 rounded transition-colors"
                        title="View AI Trend Forecast"
                      >
                        Trend
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 font-mono space-y-1">
              <div>No State or Union Territory found matching "{query}"</div>
              <div className="text-[11px] text-slate-400">
                Check spelling or search by partial name (e.g., "Kash", "Nicobar", "Bengal")
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
