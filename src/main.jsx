import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Preset test queries covering all requirements from the hackathon problem statement
const PRESET_QUERIES = [
  {
    label: "1. Single package info: 'npm express'",
    data: {
      component: "package-info-component",
      query: "npm express",
      entities: [
        { word: "express", sourceID: "express", collectionName: "NPM_PACKAGES" }
      ],
      suggestedPlace: "mainline"
    }
  },
  {
    label: "2. Latest version query: 'latest version of react'",
    data: {
      component: "package-info-component",
      query: "latest version of react",
      entities: [
        { word: "react", sourceID: "react", collectionName: "NPM_PACKAGES" }
      ],
      suggestedPlace: "mainline"
    }
  },
  {
    label: "3. Compare 2 packages: 'compare packages express, fastify'",
    data: {
      component: "package-info-component",
      query: "compare packages express, fastify",
      entities: [
        { word: "express", sourceID: "express", collectionName: "NPM_PACKAGES" },
        { word: "fastify", sourceID: "fastify", collectionName: "NPM_PACKAGES" }
      ],
      suggestedPlace: "mainline"
    }
  },
  {
    label: "4. Compare 3 packages: 'compare express, fastify, koa'",
    data: {
      component: "package-info-component",
      query: "compare express, fastify, koa",
      entities: [
        { word: "express", sourceID: "express", collectionName: "NPM_PACKAGES" },
        { word: "fastify", sourceID: "fastify", collectionName: "NPM_PACKAGES" },
        { word: "koa", sourceID: "koa", collectionName: "NPM_PACKAGES" }
      ],
      suggestedPlace: "mainline"
    }
  },
  {
    label: "5. Alternatives query: 'npm alternatives to moment'",
    data: {
      component: "package-info-component",
      query: "npm alternatives to moment",
      entities: [
        { word: "moment", sourceID: "moment", collectionName: "NPM_PACKAGES" }
      ],
      suggestedPlace: "mainline"
    }
  },
  {
    label: "6. Deprecated package: 'npm request'",
    data: {
      component: "package-info-component",
      query: "npm request",
      entities: [
        { word: "request", sourceID: "request", collectionName: "NPM_PACKAGES" }
      ],
      suggestedPlace: "mainline"
    }
  },
  {
    label: "7. Version diff query: 'express 4 vs 5'",
    data: {
      component: "package-info-component",
      query: "express 4 vs 5",
      entities: [
        { word: "express", sourceID: "express", collectionName: "NPM_PACKAGES" }
      ],
      suggestedPlace: "mainline"
    }
  },
  {
    label: "8. Use-case query: 'best npm package for date formatting'",
    data: {
      component: "package-info-component",
      query: "best npm package for date formatting",
      entities: [],
      suggestedPlace: "mainline"
    }
  }
];

function DevelopmentHarness() {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [placement, setPlacement] = useState('mainline'); // 'mainline' or 'sidebar'
  const [customQuery, setCustomQuery] = useState('');
  const [activeSearchData, setActiveSearchData] = useState(PRESET_QUERIES[0].data);

  const handleSelectPreset = (index) => {
    setSelectedPresetIndex(index);
    const preset = PRESET_QUERIES[index];
    setActiveSearchData({
      ...preset.data,
      suggestedPlace: placement
    });
    setCustomQuery(preset.data.query);
  };

//   const handleCustomSubmit = (e) => {
//     e.preventDefault();
//     if (!customQuery.trim()) return;
//     setActiveSearchData({
//       component: "package-info-component",
//       query: customQuery.trim(),
//       entities: [],
//       suggestedPlace: placement
//     });
//   };
//   const handleCustomSubmit = (e) => {
//     e.preventDefault();
//     const q = customQuery.trim();
//     if (!q) return;

//     // Auto-detect package entity for custom queries if it's a simple package search
//     let entities = [];
//     const lower = q.toLowerCase();
//     if (!lower.includes("compare") && !lower.includes("alternatives") && !lower.includes("best") && !lower.includes("vs")) {
//       const pkgName = q.replace(/^npm\s+/i, '').replace(/^(latest version of)\s+/i, '').trim();
//       if (pkgName) {
//         entities = [{ word: pkgName, sourceID: pkgName, collectionName: "NPM_PACKAGES" }];
//       }
//     }

//     setActiveSearchData({
//       component: "package-info-component",
//       query: q,
//       entities: entities,
//       suggestedPlace: placement
//     });
//   };

const handleCustomSubmit = (e) => {
    e.preventDefault();
    const queryText = customQuery.trim();
    if (!queryText) return;

    // Extract package entity for simple custom searches
    let entities = [];
    const lower = queryText.toLowerCase();
    if (!lower.includes("compare") && !lower.includes("vs") && !lower.includes("alternatives") && !lower.includes("best")) {
      const cleanName = queryText.replace(/^npm\s+/i, '').replace(/^(latest version of)\s+/i, '').trim();
      if (cleanName) {
        entities = [{ word: cleanName, sourceID: cleanName, collectionName: "NPM_PACKAGES" }];
      }
    }

    setActiveSearchData({
      component: "package-info-component",
      query: queryText,
      entities: entities,
      suggestedPlace: placement
    });
  };

  const togglePlacement = (newPlacement) => {
    setPlacement(newPlacement);
    setActiveSearchData(prev => ({
      ...prev,
      suggestedPlace: newPlacement
    }));
  };

  return (
    <div className={`harness-root ${isDarkMode ? 'dark' : 'light'}`} data-theme={isDarkMode ? 'dark' : 'light'}>
      {/* Dev Navigation & Testing Controls */}
      <header className="harness-header">
        <div className="harness-brand">
          <span className="brand-badge">hyper dart</span>
          <h1>Package Info Component Testbed</h1>
        </div>

        <div className="harness-controls">
          {/* Preset Selector */}
          <select
            value={selectedPresetIndex}
            onChange={(e) => handleSelectPreset(Number(e.target.value))}
            className="harness-select"
          >
            {PRESET_QUERIES.map((preset, idx) => (
              <option key={idx} value={idx}>{preset.label}</option>
            ))}
          </select>

          {/* Placement Switcher (Sidebar vs Mainline) */}
          <div className="toggle-group">
            <button
              onClick={() => togglePlacement('mainline')}
              className={`harness-btn ${placement === 'mainline' ? 'active' : ''}`}
              title="600px+ Wide Mainline View"
            >
              Mainline View
            </button>
            <button
              onClick={() => togglePlacement('sidebar')}
              className={`harness-btn ${placement === 'sidebar' ? 'active' : ''}`}
              title="340px Narrow Sidebar View"
            >
              Sidebar View (340px)
            </button>
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="harness-btn"
            title="Toggle Theme"
          >
            {isDarkMode ? 'Light' : 'Dark'}
          </button>
        </div>

        {/* Live Query Input Bar */}
        <form onSubmit={handleCustomSubmit} className="harness-search-bar">
          <input
            type="text"
            placeholder="type your query"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            className="harness-input"
          />
          <button type="submit" className="harness-search-btn">Run Query</button>
        </form>
      </header>

      {/* Main Preview Container */}
      <main className="harness-main">
        <div
          className="component-viewport"
          style={{
            maxWidth: placement === 'sidebar' ? '360px' : '780px',
            margin: '0 auto',
            transition: 'max-width 0.3s ease'
          }}
        >
          <div className="viewport-label">
            Preview Mode: <strong>{placement.toUpperCase()}</strong> ({placement === 'sidebar' ? '360px' : '780px'})
          </div>
          <App searchData={activeSearchData} />
        </div>
      </main>

      <style>{`
        .harness-root {
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          transition: background-color 0.2s, color 0.2s;
        }
        .harness-root.dark {
          background-color: #030712;
          color: #f3f4f6;
        }
        .harness-root.light {
          background-color: #f8fafc;
          color: #0f172a;
        }
        .harness-header {
          padding: 16px 24px;
          border-bottom: 1px solid rgba(150, 150, 150, 0.2);
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: rgba(0,0,0,0.03);
        }
        .harness-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .harness-brand h1 {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
        }
        .brand-badge {
          background: #2563eb;
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .harness-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        .harness-select {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid rgba(150,150,150,0.3);
          background: #0f172a; 
          color: #ffffff;      
          font-size: 13px;
          flex: 1;
          min-width: 260px;
        }
        .harness-btn {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid rgba(150,150,150,0.3);
          background: transparent;
          color: inherit;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .harness-btn.active {
          background: #2563eb;
          color: #ffffff;
          border-color: #2563eb;
        }
        .toggle-group {
          display: flex;
          gap: 4px;
        }
        .harness-search-bar {
          display: flex;
          gap: 8px;
        }
        .harness-input {
          flex: 1;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid rgba(150,150,150,0.3);
          background: transparent;
          color: inherit;
          font-size: 13px;
        }
        .harness-search-btn {
          background: #2563eb;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .harness-main {
          padding: 24px;
        }
        .viewport-label {
          font-size: 11px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #94a3b8;
          margin-bottom: 8px;
          text-align: right;
        }
      `}</style>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DevelopmentHarness />
  </React.StrictMode>
);
