import React, { useEffect, useState } from 'react';
import { formatBytes } from '../services/npmApi';

export function VersionDiffView({
  packageName,
  v1,
  v2,
  onSelectPackage,
  isSidebar = false
}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ meta1: null, meta2: null });

  useEffect(() => {
    let isCancelled = false;

    async function fetchVersions() {
      setLoading(true);
      try {
        const fullRes = await fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`);
        if (!fullRes.ok) throw new Error('Package not found');
        const full = await fullRes.json();

        // Resolve matching versions (e.g. "4" -> latest 4.x.x)
        const versions = Object.keys(full.versions || {});
        
        const findBestMatch = (vQuery) => {
          if (full.versions[vQuery]) return full.versions[vQuery];
          const matches = versions.filter(v => v.startsWith(vQuery));
          if (matches.length > 0) return full.versions[matches[matches.length - 1]];
          return null;
        };

        const meta1 = findBestMatch(v1);
        const meta2 = findBestMatch(v2);

        if (!isCancelled) {
          setData({ meta1, meta2, full });
        }
      } catch (err) {
        console.error('Error fetching version diff:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchVersions();
    return () => { isCancelled = true; };
  }, [packageName, v1, v2]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <span>Comparing versions of {packageName}...</span>
      </div>
    );
  }

  const { meta1, meta2 } = data;

  if (!meta1 && !meta2) {
    return (
      <div className="empty-state">
        Could not resolve versions {v1} or {v2} for package "{packageName}".
      </div>
    );
  }

  return (
    <div className={`version-diff-container ${isSidebar ? 'is-sidebar' : 'is-mainline'}`}>
      <div className="diff-header">
        <h2 className="section-heading">{packageName} Major Version Diff</h2>
        <p className="section-subheading">
          Comparing <strong>v{meta1?.version || v1}</strong> with <strong>v{meta2?.version || v2}</strong>
        </p>
      </div>

      <div className="table-responsive">
        <table className="compare-table">
          <thead>
            <tr>
              <th>Feature / Metric</th>
              <th>v{meta1?.version || v1}</th>
              <th>v{meta2?.version || v2}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="td-label">Node Engine</td>
              <td className="td-value text-mono">{meta1?.engines?.node || 'Any'}</td>
              <td className="td-value text-mono">{meta2?.engines?.node || 'Any'}</td>
            </tr>
            <tr>
              <td className="td-label">Dependencies</td>
              <td className="td-value">{Object.keys(meta1?.dependencies || {}).length}</td>
              <td className="td-value">{Object.keys(meta2?.dependencies || {}).length}</td>
            </tr>
            <tr>
              <td className="td-label">Module Type</td>
              <td className="td-value">{meta1?.type === 'module' ? 'ESM' : 'CommonJS'}</td>
              <td className="td-value">{meta2?.type === 'module' ? 'ESM' : 'CommonJS'}</td>
            </tr>
            <tr>
              <td className="td-label">Unpacked Size</td>
              <td className="td-value">{formatBytes(meta1?.dist?.unpackedSize)}</td>
              <td className="td-value">{formatBytes(meta2?.dist?.unpackedSize)}</td>
            </tr>
            <tr>
              <td className="td-label">Status</td>
              <td className="td-value">
                {meta1?.deprecated ? <span className="badge-pill badge-warning">Deprecated</span> : 'Active'}
              </td>
              <td className="td-value">
                {meta2?.deprecated ? <span className="badge-pill badge-warning">Deprecated</span> : 'Active'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="diff-actions">
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => onSelectPackage && onSelectPackage(packageName)}
        >
          ← Back to current {packageName} details
        </button>
      </div>
    </div>
  );
}
