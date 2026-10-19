/**
 * CIVIC PULSE
 * AI-Based Road Safety & Infrastructure Analytics System
 * Primary Dataset: MoRTH Table A2 (RA2019_A2.csv)
 */

import React, { useState, useMemo } from 'react';
import { Navbar, ActivePage } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { NationalDashboardView } from './components/NationalDashboardView';
import { StateAnalyzerView } from './components/StateAnalyzerView';
import { StateComparisonView } from './components/StateComparisonView';
import { PredictionInsightsView } from './components/PredictionInsightsView';
import { PriorityScoreView } from './components/PriorityScoreView';
import { EngineeringRecommendationsView } from './components/EngineeringRecommendationsView';
import { DataMethodologyView } from './components/DataMethodologyView';
import { StateReportModal } from './components/StateReportModal';
import { loadAndPreprocessAccidentData } from './utils/analytics';
import { RAW_CSV_DATA } from './data/rawCsv';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [selectedStateName, setSelectedStateName] = useState<string>('Tamil Nadu');
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Load and preprocess dataset once
  const { states, nationalTotal, nationalAverages } = useMemo(() => {
    return loadAndPreprocessAccidentData();
  }, []);

  const selectedStateRecord = useMemo(() => {
    return (
      states.find((s) => s.state.toLowerCase() === selectedStateName.toLowerCase()) ||
      states[0]
    );
  }, [states, selectedStateName]);

  // CSV download handler
  const handleDownloadCsv = () => {
    const blob = new Blob([RAW_CSV_DATA], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'RA2019_A2.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-600 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        onDownloadCsv={handleDownloadCsv}
        states={states}
        onSelectState={setSelectedStateName}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {activePage === 'home' && (
          <HomeView
            states={states}
            nationalTotal={nationalTotal}
            nationalAverages={nationalAverages}
            setActivePage={setActivePage}
            onSelectState={setSelectedStateName}
          />
        )}

        {activePage === 'dashboard' && (
          <NationalDashboardView
            states={states}
            nationalTotal={nationalTotal}
            nationalAverages={nationalAverages}
            onSelectState={setSelectedStateName}
            setActivePage={setActivePage}
            selectedStateName={selectedStateName}
          />
        )}

        {activePage === 'analyzer' && (
          <StateAnalyzerView
            states={states}
            selectedStateName={selectedStateName}
            onSelectState={setSelectedStateName}
            nationalAverages={nationalAverages}
            setActivePage={setActivePage}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}

        {activePage === 'comparison' && (
          <StateComparisonView
            states={states}
            nationalAverages={nationalAverages}
          />
        )}

        {activePage === 'prediction' && (
          <PredictionInsightsView
            states={states}
            selectedStateName={selectedStateName}
            onSelectState={setSelectedStateName}
          />
        )}

        {activePage === 'priority' && (
          <PriorityScoreView
            states={states}
            onSelectState={setSelectedStateName}
            setActivePage={setActivePage}
            selectedStateName={selectedStateName}
          />
        )}

        {activePage === 'recommendations' && (
          <EngineeringRecommendationsView
            states={states}
            selectedStateName={selectedStateName}
            onSelectState={setSelectedStateName}
            setActivePage={setActivePage}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}

        {activePage === 'methodology' && (
          <DataMethodologyView
            states={states}
            nationalTotal={nationalTotal}
            onDownloadCsv={handleDownloadCsv}
          />
        )}
      </main>

      {/* Professional PDF Technical Report Modal */}
      {isReportModalOpen && selectedStateRecord && (
        <StateReportModal
          state={selectedStateRecord}
          nationalAverages={nationalAverages}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {/* Footer */}
      <Footer setActivePage={setActivePage} />
    </div>
  );
}
