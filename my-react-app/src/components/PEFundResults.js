import React from 'react';

const PEFundResults = ({ funds }) => {
  if (!funds || funds.length === 0) {
    return (
      <div className="pe-fund-results">
        <h2>Private Equity Fund Matches</h2>
        <p className="no-matches">No suitable PE funds found based on the company analysis.</p>
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

  return (
    <div className="pe-fund-results">
      <h2>Matching Private Equity Funds</h2>
      <p className="results-summary">
        Found {funds.length} potential PE funds that could be interested in this company:
      </p>
      
      <div className="funds-grid">
        {funds.map((fund) => (
          <div key={fund.id} className="fund-card">
            <div className="fund-header">
              <h3 className="fund-name">{fund.name}</h3>
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