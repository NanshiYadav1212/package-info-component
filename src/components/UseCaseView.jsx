import React, { useEffect, useState } from 'react';
import { searchNpmPackages, formatNumber, fetchPackageData } from '../services/npmApi';

export function UseCaseView({
  topic,
  onSelectPackage,
  onComparePackages,
  isSidebar = false
}) {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);

  useEffect(() => {
    let isCancelled = false;

    async function findRecommendations() {
      setLoading(true);
      try {
        const rawResults = await searchNpmPackages(topic, 5);

        // Fetch detailed weekly downloads for top results
        const enriched = await Promise.all(
          rawResults.map(async (item) => {
            const extra = await fetchPackageData(item.name);
            return {
              ...item,
              version: extra?.version || item.version,
              weeklyDownloads: extra?.weeklyDownloads || item.weeklyDownloads,
              hasBuiltInTypes: extra?.hasBuiltInTypes || false,
              moduleType: extra?.moduleType || 'CommonJS',
              license: extra?.license || 'MIT'
            };
          })
        );

        if (!isCancelled) {
          // Sort by weekly downloads descending
          enriched.sort((a, b) => b.weeklyDownloads - a.weeklyDownloads);
          setResults(enriched);
        }
      } catch (err) {
        console.error('Error finding use case packages:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    findRecommendations();
    return () => { isCancelled = true; };
  }, [topic]);

  return (
    <div className={`usecase-container ${isSidebar ? 'is-sidebar' : 'is-mainline'}`}>
      <div className="usecase-header">
        <h2 className="section-heading">Recommended Packages for "{topic}"</h2>
        <p className="section-subheading">
          Ranked by ecosystem adoption and relevance
        </p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <span>Finding best packages for {topic}...</span>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          No packages found matching "{topic}". Try checking your query phrasing.
        </div>
      ) : (
        <>
          <div className="recommendations-list">
            {results.map((pkg, idx) => (
              <div key={pkg.name} className="rec-card">
                <div className="rec-badge">#{idx + 1}</div>
                <div className="rec-main">
                  <div className="rec-title-row">
                    <span
                      className="rec-name"
                      onClick={() => onSelectPackage && onSelectPackage(pkg.name)}
                      title="Inspect package"
                    >
                      {pkg.name}
                    </span>
                    <span className="rec-version">v{pkg.version}</span>
                    <span className="rec-downloads">
                      ⚡ {formatNumber(pkg.weeklyDownloads)}/wk
                    </span>
                  </div>
                  <p className="rec-desc">{pkg.description}</p>
                  <div className="rec-tags">
                    <span className={`tech-badge ${pkg.hasBuiltInTypes ? 'badge-success' : 'badge-neutral'}`}>
                      {pkg.hasBuiltInTypes ? 'TS Built-in' : 'Untyped'}
                    </span>
                    <span className="tech-badge badge-neutral">{pkg.license}</span>
                  </div>
                </div>
                <div className="rec-actions">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => onSelectPackage && onSelectPackage(pkg.name)}
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {results.length >= 2 && onComparePackages && (
            <div className="usecase-footer-action">
              <button
                className="btn btn-primary"
                onClick={() => onComparePackages([results[0].name, results[1].name])}
              >
                 Compare Top 2: {results[0].name} vs {results[1].name}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
