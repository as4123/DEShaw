import React from 'react';

const PEFundResults = ({ funds, metadata }) => {
  if (!funds || funds.length === 0) {
    return (
      <div className="pe-fund-results">
        <h2>Private Equity Fund Matches</h2>
        <p className="no-matches">No suitable PE funds found based on the company analysis.</p>
        {metadata?.errors && metadata.errors.length > 0 && (
          <div className="discovery-errors">
            <h4>Discovery Issues:</h4>
            {metadata.errors.map((error, index) => (
              <p key={index} className="error-item">
                {error.source}: {error.error}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }

  const getMatchScoreColor = (score) => {
    if (score >= 70) return '#4CAF50'; // Green
    if (score >= 50) return '#FF9800'; // Orange
    return '#f44336'; // Red
  };

  const getMatchScoreLabel = (score) => {
    if (score >= 70) return 'Excellent Match';
    if (score >= 50) return 'Good Match';
    return 'Potential Match';
  };

  const getSourceBadge = (source) => {
    const badges = {
      'static': { label: 'Curated', color: '#2196F3' },
      'ai-generated': { label: 'AI', color: '#FF9800' },
      'pitchbook': { label: 'PitchBook', color: '#9C27B0' },
      'crunchbase': { label: 'Crunchbase', color: '#4CAF50' },
      'external': { label: 'API', color: '#607D8B' }
    };
    
    const badge = badges[source] || badges['external'];
    return (
      <span 
        className="source-badge" 
        style={{ backgroundColor: badge.color }}
        title={`Source: ${source}`}
      >
        {badge.label}
      </span>
    );
  };

  return (
    <div className="pe-fund-results">
      <div className="results-header">
        <h2>Matching Private Equity Funds</h2>
        
        {metadata && (
          <div className="results-metadata">
            <div className="metadata-summary">
              <span>Found {funds.length} potential PE funds</span>
              {metadata.sources && (
                <div className="source-breakdown">
                  {metadata.sources.static > 0 && (
                    <span className="source-count">
                      {metadata.sources.static} curated
                    </span>
                  )}
                  {metadata.sources.aiGenerated > 0 && (
                    <span className="source-count">
                      {metadata.sources.aiGenerated} AI-discovered
                    </span>
                  )}
                  {metadata.sources.external > 0 && (
                    <span className="source-count">
                      {metadata.sources.external} from APIs
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {metadata.errors && metadata.errors.length > 0 && (
              <div className="discovery-warnings">
                <span className="warning-icon">⚠️</span>
                <span>{metadata.errors.length} discovery issue(s)</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="funds-grid">
        {funds.map((fund) => (
          <div key={fund.id} className="fund-card">
            <div className="fund-header">
              <div className="fund-title-section">
                <h3 className="fund-name">{fund.name}</h3>
                {fund.source && getSourceBadge(fund.source)}
              </div>
              <div 
                className="match-score"
                style={{ backgroundColor: getMatchScoreColor(fund.matchScore) }}
              >
                {fund.matchScore}%
              </div>
            </div>
            
            <div className="fund-details">
              <div className="fund-item">
                <strong>Investment Range:</strong> {fund.investmentRange}
              </div>
              <div className="fund-item">
                <strong>Focus Industries:</strong> {fund.focusIndustries.join(', ')}
              </div>
              <div className="fund-item">
                <strong>Preferred Size:</strong> {fund.preferredSize.join(', ')}
              </div>
              <div className="fund-item">
                <strong>Investment Stage:</strong> {fund.stage.join(', ')}
              </div>
              <div className="fund-item">
                <strong>Geographic Focus:</strong> {fund.location.join(', ')}
              </div>
            </div>

            <div className="fund-description">
              <p>{fund.description}</p>
            </div>

            <div className="match-reasons">
              <h4>Why this fund matches:</h4>
              <ul>
                {fund.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>

            <div className="match-label" style={{ color: getMatchScoreColor(fund.matchScore) }}>
              {getMatchScoreLabel(fund.matchScore)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PEFundResults;