import React, { useEffect, useState } from 'react';
import { searchNpmPackages, formatNumber, fetchPackageData } from '../services/npmApi';

// Curated modern replacements for classic/deprecated packages
const KNOWN_ALTERNATIVES = {
  moment: [
    { name: 'date-fns', reason: 'Modular, tree-shakeable, immutable date utility library' },
    { name: 'dayjs', reason: '2kB drop-in replacement with identical Moment-compatible API' },
    { name: 'luxon', reason: 'Rich modern date-time library built by Moment maintainers' }
  ],
  request: [
    { name: 'axios', reason: 'Promise-based HTTP client with browser and Node support' },
    { name: 'got', reason: 'Human-friendly and powerful HTTP request library for Node.js' },
    { name: 'ky', reason: 'Tiny and elegant HTTP client based on Fetch API' }
  ],
  lodash: [
    { name: 'radash', reason: 'Functional, modern TypeScript utility library' },
    { name: 'remeda', reason: 'First library designed specifically for TypeScript and functional data processing' },
    { name: 'lodash-es', reason: 'Official ES modules export of lodash for tree-shaking' }
  ]
};

export function AlternativesView({
  targetPackage,
  onCompareWith,
  onSelectPackage,
  isSidebar = false
}) {
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetInfo, setTargetInfo] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        // Fetch original target info
        const target = await fetchPackageData(targetPackage);
        if (!isCancelled) setTargetInfo(target);

        // Check if there are known alternatives or search npm registry
        const known = KNOWN_ALTERNATIVES[targetPackage.toLowerCase()] || [];
        const searchResults = await searchNpmPackages(targetPackage, 8);

        // Filter out target package itself
        const filteredResults = searchResults.filter(
          item => item.name.toLowerCase() !== targetPackage.toLowerCase()
        );

        // Merge known + search results
        const combined = [];
        const seen = new Set();

        for (const item of known) {
          if (!seen.has(item.name)) {
            seen.add(item.name);
            const extra = await fetchPackageData(item.name);
            combined.push({
              name: item.name,
              version: extra?.version || 'latest',
              description: item.reason || extra?.description,
              weeklyDownloads: extra?.weeklyDownloads || 0,
              keywords: extra?.keywords || ['alternative']
            });
          }
        }

        for (const item of filteredResults) {
          if (!seen.has(item.name)) {
            seen.add(item.name);
            combined.push(item);
          }
        }

        if (!isCancelled) {
          setAlternatives(combined.slice(0, 6));
        }
      } catch (err) {
        console.error('Error loading alternatives:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadData();
    return () => { isCancelled = true; };
  }, [targetPackage]);

  return (
    <div className={`alternatives-container ${isSidebar ? 'is-sidebar' : 'is-mainline'}`}>
      <div className="alts-header">
        <h2 className="section-heading">Alternatives & Replacements</h2>
        <p className="section-subheading">
          Looking for modern alternatives to <strong>{targetPackage}</strong>
          {targetInfo?.deprecated && (
            <span className="badge-deprecated-inline">Deprecated Package</span>
          )}
        </p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <span>Discovering suitable alternatives...</span>
        </div>
      ) : alternatives.length === 0 ? (
        <div className="empty-state">
          No direct alternatives found for "{targetPackage}". Try searching a generic use-case keyword.
        </div>
      ) : (
        <div className="alts-list">
          {alternatives.map((alt, index) => (
            <div key={alt.name} className="alt-card">
              <div className="alt-rank">#{index + 1}</div>
              <div className="alt-content">
                <div className="alt-title-row">
                  <span
                    className="alt-name"
                    onClick={() => onSelectPackage && onSelectPackage(alt.name)}
                    title="View details"
                  >
                    {alt.name}
                  </span>
                  <span className="alt-version">v{alt.version}</span>
                  <span className="alt-downloads">
                     {formatNumber(alt.weeklyDownloads)}/wk
                  </span>
                </div>

                <p className="alt-description">{alt.description}</p>

                {alt.keywords && alt.keywords.length > 0 && (
                  <div className="alt-keywords">
                    {alt.keywords.slice(0, 4).map(kw => (
                      <span key={kw} className="kw-tag">#{kw}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="alt-actions">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => onCompareWith && onCompareWith(alt.name)}
                  title={`Compare ${targetPackage} with ${alt.name}`}
                >
                   Compare
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
