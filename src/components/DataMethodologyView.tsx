import React, { useState } from 'react';
import {
  Database,
  ArrowDown,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  BookOpen,
  Search,
} from 'lucide-react';
import { StateRecord } from '../types/accident';
import { RAW_CSV_DATA } from '../data/rawCsv';

interface DataMethodologyViewProps {
  states: StateRecord[];
  nationalTotal: StateRecord;
  onDownloadCsv: () => void;
}

export const DataMethodologyView: React.FC<DataMethodologyViewProps> = ({
  states,
  nationalTotal,
  onDownloadCsv,
}) => {
  const [csvSearch, setCsvSearch] = useState('');

  const csvRows = RAW_CSV_DATA.trim().split('\n');
  const headers = csvRows[0].split(',');

  const filteredCsvRows = csvRows.slice(1).filter((row) =>
    row.toLowerCase().includes(csvSearch.toLowerCase())
  );

  const pipelineSteps = [
    {
      title: '01. Official Government Dataset Acquisition',
      desc: 'Table A2 from the Ministry of Road Transport & Highways (MoRTH) Road Accidents in India 2019 publication containing 2016–2019 State/UT accident counts, population rates, vehicle fleet rates, and road network densities.',
    },
    {
      title: '02. Data Cleaning & Header Standardization',
      desc: 'Sanitization of CSV line terminators, stripping surrounding quotes, handling varying column name conventions, and maintaining exact typographical state identifiers.',
    },
    {
      title: '03. Data Validation & Type Verification',
      desc: 'Strict parsing of numerical strings, range bounds checking (>0), and explicit conversion of "NA" characters to typed nulls rather than coercive zero-filling.',
    },
    {
      title: '04. Feature Engineering',
      desc: 'Derivation of 2016–2019 multi-year percentage changes, annual crash deltas, and regional classification flags (States vs Union Territories, Hilly topographies).',
    },
    {
      title: '05. Exposure Normalization',
      desc: 'Linear Min-Max transformation of raw indicators to [0, 1] range to eliminate dimensional bias across states of drastically differing geographic and demographic scales.',
    },
    {
      title: '06. Statistical Analysis',
      desc: 'Computation of national baselines, arithmetic means, parametric extrema, and cross-state distribution percentiles without synthetic bias.',
    },
    {
      title: '07. Historical Trend Modeling',
      desc: 'Ordinary Least Squares (OLS) regression across 2016–2019 annual observations yielding slope (crashes/year), intercept, coefficient of determination (R²), and short-horizon trajectory estimates.',
    },
    {
      title: '08. Multi-Criteria Priority Scoring',
      desc: 'Synthesizing normalized population exposure (30%), vehicle fleet exposure (30%), road network density (25%), and historical growth momentum (15%) into a transparent 0–100 index.',
    },
    {
      title: '09. Interactive Visualization',
      desc: 'Rendering custom SVG comparative charts, trend trajectories with R² lines, and sortable multidimensional data grids with strict tabular-numeral alignment.',
    },
    {
      title: '10. Codified Civil Engineering Recommendations',
      desc: 'Mapping quantitative hazard flags to codified Indian Road Congress (IRC) standards (IRC:SP:88, IRC:103, IRC:99, IRC:52) with explicit data-grounded justifications.',
    },
  ];

  return (
    <div className="space-y-12 py-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Data Governance & Engineering Methodology
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              End-to-end data processing architecture, validation protocols, missing data handling,
              and academic provenance.
            </p>
          </div>

          <button
            onClick={onDownloadCsv}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 self-start md:self-auto shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download RA2019_A2.csv</span>
          </button>
        </div>
      </div>

      {/* Dataset Source Official Citation */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800 font-mono">
          <Database className="w-4 h-4 text-teal-700" />
          <span>Dataset Source & Attribution</span>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-sm text-slate-800 font-mono">
          <div>
            <strong>Source:</strong> Government of India Open Government Data Platform
          </div>
          <div>
            <strong>Ministry:</strong> Ministry of Road Transport & Highways (MoRTH)
          </div>
          <div>
            <strong>Dataset:</strong> Road Accidents in India 2019 (Table A2)
          </div>
          <div className="text-xs text-slate-500 font-sans pt-1">
            Primary record table covering State/UT-wise road accident counts for 2016, 2017, 2018, and
            2019, accident ranks, national percentage shares, demographic crash rates per lakh
            population, vehicle fleet crash rates per 10,000 registered motor vehicles, and road
            length crash densities per 10,000 km of roads.
          </div>
        </div>
      </div>

      {/* Data Quality & Integrity Report */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
          <CheckCircle2 className="w-4 h-4 text-teal-700" />
          <span>Data Quality & Integrity Protocols</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 font-sans">
              Missing Value Handling (No Zero-Coercion)
            </span>
            <p className="text-slate-600 leading-relaxed font-sans">
              The dataset contains specific missing values in official records: Telangana population
              rates are recorded as <code>NA</code> across all years; Daman & Diu vehicle fleet rates
              for 2018 and 2019 are recorded as <code>NA</code>. These entries are preserved strictly as{' '}
              <code>null</code> and never coerced to 0, preventing false statistical skew in averages
              or priority scoring.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 font-sans">
              Dynamic Weight Rescaling
            </span>
            <p className="text-slate-600 leading-relaxed font-sans">
              When computing composite priority scores for jurisdictions with missing attributes, the
              scoring engine dynamically re-normalizes the sum of valid weights (Σ w_valid),
              ensuring that the jurisdiction is evaluated solely across its verified government metrics.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 font-sans">
              Preservation of Government Values
            </span>
            <p className="text-slate-600 leading-relaxed font-sans">
              All 36 State and Union Territory names, accident counts, and normalized rates from the
              MoRTH registry are displayed verbatim. No smoothing, artificial synthetic imputation, or
              data alteration is performed on the historical baseline.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 font-sans">
              Calculated Field Transparency
            </span>
            <p className="text-slate-600 leading-relaxed font-sans">
              Every derived field—including 4-year percentage changes, OLS slopes, and Priority
              Scores—is explicitly marked as a calculated analytical construct, distinguishing it from
              primary source data.
            </p>
          </div>
        </div>
      </div>

      {/* Complete Methodological Flow Pipeline */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Civil Engineering Analytical Flow Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Step-by-step pipeline from raw government tabular records to prioritized safety interventions.
          </p>
        </div>

        <div className="relative border-l-2 border-teal-600 ml-4 pl-6 space-y-8">
          {pipelineSteps.map((step, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-1 font-sans">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Verbatim CSV Dataset Inspector */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Raw Dataset Inspector (MoRTH Table A2)
            </h3>
            <p className="text-xs text-slate-500">
              Live inspection of the verbatim CSV parsed by the analytical engine.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search raw lines..."
              value={csvSearch}
              onChange={(e) => setCsvSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
            />
          </div>
        </div>

        <div className="p-3 bg-slate-900 text-slate-200 rounded-lg overflow-x-auto font-mono text-[11px] max-h-96">
          <div className="text-teal-400 pb-2 border-b border-slate-800 font-bold whitespace-nowrap">
            {csvRows[0]}
          </div>
          <div className="divide-y divide-slate-800 pt-1">
            {filteredCsvRows.map((line, idx) => (
              <div key={idx} className="py-1.5 whitespace-nowrap hover:bg-slate-800/60 px-1">
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mandatory Final Academic Disclaimer */}
      <div className="p-6 bg-slate-100 rounded-xl border border-slate-300 space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
          Final Academic Declaration
        </div>
        <p className="text-xs leading-relaxed text-slate-800 font-medium font-sans">
          Disclaimer: This application is an academic decision-support prototype based on historical
          government data. Results are analytical estimates and should not replace professional
          road-safety studies or official planning decisions.
        </p>
      </div>
    </div>
  );
};
