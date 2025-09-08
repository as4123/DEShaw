import React, { useState } from 'react';
import WebsiteInput from './WebsiteInput';
import CompanyProfile from './CompanyProfile';
import PEFundResults from './PEFundResults';
import LoadingSpinner from './LoadingSpinner';
import AnalysisSettings from './AnalysisSettings';
import { analyzeWebsite } from '../services/analysisService';

const CompanyAnalyzer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [companyData, setCompanyData] = useState(null);
  const [peFunds, setPEFunds] = useState([]);
  const [analysisMetadata, setAnalysisMetadata] = useState(null);
  const [error, setError] = useState(null);
  
  // Analysis settings
  const [settings, setSettings] = useState({
    enableDynamicDiscovery: true,
    enableAIDiscovery: true,
    enableExternalAPIs: false,
    maxResults: 12,
    minMatchScore: 30
  });

  const handleWebsiteSubmit = async (url) => {
    setIsLoading(true);
    setError(null);
    setCompanyData(null);
    setPEFunds([]);
    setAnalysisMetadata(null);

    try {
      const result = await analyzeWebsite(url, {
        enableDynamicDiscovery: settings.enableDynamicDiscovery,
        maxResults: settings.maxResults,
        minMatchScore: settings.minMatchScore
      });
      
      setCompanyData(result.companyProfile);
      setPEFunds(result.matchingFunds);
      setAnalysisMetadata(result.metadata);
    } catch (err) {
      setError(err.message || 'An error occurred while analyzing the website');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="company-analyzer">
      <WebsiteInput onSubmit={handleWebsiteSubmit} disabled={isLoading} />
      
      <AnalysisSettings 
        settings={settings}
        onSettingsChange={setSettings}
        disabled={isLoading}
      />
      
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}

      {isLoading && <LoadingSpinner />}

      {companyData && (
        <div className="results">
          <CompanyProfile data={companyData} />
          <PEFundResults 
            funds={peFunds} 
            metadata={analysisMetadata}
          />
        </div>
      )}
    </div>
  );
};

export default CompanyAnalyzer;