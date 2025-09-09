import React, { useState } from 'react';

const WebsiteInput = ({ onSubmit, disabled }) => {
  const [url, setUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(true);

  const validateUrl = (urlString) => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };
asd
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setIsValidUrl(false);
      return;
    }

    const urlToAnalyze = url.startsWith('http') ? url : `https://${url}`;
    
    if (!validateUrl(urlToAnalyze)) {
      setIsValidUrl(false);
      return;
    }

    setIsValidUrl(true);
    onSubmit(urlToAnalyze);
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    if (!isValidUrl) setIsValidUrl(true);
  };

  return (
    <div className="website-input">
      <h2>Enter Company Website</h2>
      <form onSubmit={handleSubmit} className="url-form">
        <div className="input-group">
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="Enter website URL (e.g., example.com)"
            className={`url-input ${!isValidUrl ? 'error' : ''}`}
            disabled={disabled}
          />
          <button 
            type="submit" 
            className="analyze-button"
            disabled={disabled || !url.trim()}
          >
            {disabled ? 'Analyzing...' : 'Analyze Company'}
          </button>
        </div>
        {!isValidUrl && (
          <p className="error-text">Please enter a valid website URL</p>
        )}
      </form>
    </div>
  );
};

export default WebsiteInput;