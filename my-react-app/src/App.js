import React, { useState } from 'react';
import './App.css';
import CompanyAnalyzer from './components/CompanyAnalyzer';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>PE Fund Matcher</h1>
        <p>Analyze SMB websites and find matching private equity funds</p>
      </header>
      <main className="App-main">
        <CompanyAnalyzer />
      </main>
    </div>
  );
}

export default App;
