import React, { useState } from 'react';
import WebsiteInput from './WebsiteInput';
import CompanyProfile from './CompanyProfile';
import PEFundResults from './PEFundResults';
import LoadingSpinner from './LoadingSpinner';
import { analyzeWebsite } from '../services/analysisService';

const CompanyAnalyzer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [companyData, setCompanyData] = useState(null);
  const [peFunds, setPEFunds] = useState([]);
  const [error, setError] = useState(null);

  const handleWebsiteSubmit = async (url) => {
    setIsLoading(true);
    setError(null);
    setCompanyData(null);
    setPEFunds([]);

    try {
      const result = await analyzeWebsite(url);
      setCompanyData(result.companyProfile);
      setPEFunds(result.matchingFunds);
    } catch (err) {
      setError(err.message || 'An error occurred while analyzing the website');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="company-analyzer">
      <WebsiteInput onSubmit={handleWebsiteSubmit} disabled={isLoading} />
      
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}

      {isLoading && <LoadingSpinner />}

      {companyData && (
        <div className="results">
          <CompanyProfile data={companyData} />
          <PEFundResults funds={peFunds} />
        </div>
      )}
    </div>
  );
};

export default CompanyAnalyzer;