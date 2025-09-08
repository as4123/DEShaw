import React, { useState } from 'react';
import { API_SOURCES, isDynamicDiscoveryAvailable } from '../services/dynamicFundDiscovery';

const AnalysisSettings = ({ settings, onSettingsChange, disabled = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const discoveryStatus = isDynamicDiscoveryAvailable();

  const handleSettingChange = (key, value) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="analysis-settings">
      <div 
        className="settings-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3>Analysis Settings</h3>
        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </div>
      
      {isExpanded && (
        <div className="settings-content">
          <div className="setting-group">
            <h4>Fund Discovery</h4>
            
            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={settings.enableDynamicDiscovery}
                  onChange={(e) => handleSettingChange('enableDynamicDiscovery', e.target.checked)}
                  disabled={disabled || !discoveryStatus.hasAnySource}
                />
                <span>Enable Dynamic Fund Discovery</span>
              </label>
              <p className="setting-description">
                Find additional PE funds beyond our curated database using AI and external sources
              </p>
              {!discoveryStatus.hasAnySource && (
                <p className="setting-warning">
                  Dynamic discovery requires an OpenAI API key to be configured
                </p>
              )}
            </div>

            {settings.enableDynamicDiscovery && (
              <div className="sub-settings">
                <div className="setting-item">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={settings.enableAIDiscovery}
                      onChange={(e) => handleSettingChange('enableAIDiscovery', e.target.checked)}
                      disabled={disabled || !discoveryStatus.aiEnabled}
                    />
                    <span>AI-Generated Fund Suggestions</span>
                  </label>
                  <p className="setting-description">
                    Use OpenAI to generate additional fund suggestions based on company profile
                  </p>
                  {!discoveryStatus.aiEnabled && (
                    <p className="setting-warning">
                      Requires OpenAI API key configuration
                    </p>
                  )}
                </div>

                <div className="setting-item">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={settings.enableExternalAPIs}
                      onChange={(e) => handleSettingChange('enableExternalAPIs', e.target.checked)}
                      disabled={disabled || !discoveryStatus.externalEnabled}
                    />
                    <span>External API Sources</span>
                  </label>
                  <p className="setting-description">
                    Fetch funds from PitchBook, Crunchbase, and other external sources
                  </p>
                  <p className="setting-warning">
                    External APIs not yet implemented - coming soon!
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="setting-group">
            <h4>Results</h4>
            
            <div className="setting-item">
              <label className="setting-label">
                <span>Maximum Results</span>
                <select
                  value={settings.maxResults}
                  onChange={(e) => handleSettingChange('maxResults', parseInt(e.target.value))}
                  disabled={disabled}
                  className="setting-select"
                >
                  <option value={6}>6 funds</option>
                  <option value={10}>10 funds</option>
                  <option value={15}>15 funds</option>
                  <option value={20}>20 funds</option>
                </select>
              </label>
              <p className="setting-description">
                Maximum number of PE funds to display in results
              </p>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <span>Minimum Match Score</span>
                <select
                  value={settings.minMatchScore}
                  onChange={(e) => handleSettingChange('minMatchScore', parseInt(e.target.value))}
                  disabled={disabled}
                  className="setting-select"
                >
                  <option value={20}>20% (Show all)</option>
                  <option value={30}>30% (Default)</option>
                  <option value={40}>40% (Good matches)</option>
                  <option value={50}>50% (Strong matches)</option>
                </select>
              </label>
              <p className="setting-description">
                Only show funds with match scores above this threshold
              </p>
            </div>
          </div>

          <div className="setting-group">
            <h4>Source Status</h4>
            <div className="source-status">
              {Object.entries(API_SOURCES).map(([key, source]) => (
                <div key={key} className="source-item">
                  <span className={`source-indicator ${source.enabled ? 'enabled' : 'disabled'}`}>
                    {source.enabled ? '●' : '○'}
                  </span>
                  <span className="source-name">{source.name}</span>
                  <span className="source-description">{source.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisSettings;