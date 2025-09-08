import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <div className="loading-text">
        <h3>Analyzing Website...</h3>
        <p>Extracting company information and finding matching PE funds</p>
        <div className="loading-steps">
          <div className="step">📊 Scraping website content</div>
          <div className="step">🤖 AI-powered company analysis</div>
          <div className="step">🎯 Matching with PE fund database</div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;