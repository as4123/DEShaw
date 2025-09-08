import React from 'react';

const CompanyProfile = ({ data }) => {
  if (!data) return null;

  return (
    <div className="company-profile">
      <h2>Company Analysis</h2>
      <div className="profile-grid">
        <div className="profile-section">
          <h3>Basic Information</h3>
          <div className="profile-item">
            <strong>Company:</strong> {data.companyName || 'Not available'}
          </div>
          <div className="profile-item">
            <strong>Industry:</strong> {data.industry || 'Not available'}
          </div>
          <div className="profile-item">
            <strong>Location:</strong> {data.location || 'Not available'}
          </div>
          <div className="profile-item">
            <strong>Company Size:</strong> {data.companySize || 'Not available'}
          </div>
          <div className="profile-item">
            <strong>Growth Stage:</strong> {data.growthStage || 'Not available'}
          </div>
        </div>

        <div className="profile-section">
          <h3>Business Details</h3>
          <div className="profile-item">
            <strong>Business Model:</strong> {data.businessModel || 'Not available'}
          </div>
          <div className="profile-item">
            <strong>Year Established:</strong> {data.yearEstablished || 'Not available'}
          </div>
          <div className="profile-item">
            <strong>Estimated Revenue:</strong> {data.revenue || 'Not available'}
          </div>
          <div className="profile-item">
            <strong>Target Market:</strong> {data.targetMarket || 'Not available'}
          </div>
          <div className="profile-item">
            <strong>Digital Presence:</strong> {data.digitalPresence || 'Not available'}
          </div>
        </div>

        {data.products && data.products.length > 0 && (
          <div className="profile-section">
            <h3>Products & Services</h3>
            <ul className="products-list">
              {data.products.map((product, index) => (
                <li key={index}>{product}</li>
              ))}
            </ul>
          </div>
        )}

        {data.keyStrengths && data.keyStrengths.length > 0 && (
          <div className="profile-section">
            <h3>Key Strengths</h3>
            <ul className="strengths-list">
              {data.keyStrengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyProfile;