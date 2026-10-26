import React, { useState } from 'react';
import { formatNumber } from '../services/npmApi';
import { Sparkline } from './Sparkline';

/**
 * Generate objective, strictly factual takeaway lines without inventing winners.
 */
function generateFactualTakeaways(packages = []) {
  if (packages.length < 2) return [];
  const takeaways = [];

  // 1. Download comparison
  const sortedByDownloads = [...packages].sort((a, b) => b.weeklyDownloads - a.weeklyDownloads);
  const highestDl = sortedByDownloads[0];
  const lowestDl = sortedByDownloads[sortedByDownloads.length - 1];
  if (lowestDl.weeklyDownloads > 0) {
    const ratio = (highestDl.weeklyDownloads / lowestDl.weeklyDownloads).toFixed(1);
    if (ratio > 1.2) {
      takeaways.push(`${highestDl.name} has ${ratio}x more weekly downloads than ${lowestDl.name} (${formatNumber(highestDl.weeklyDownloads)} vs ${formatNumber(lowestDl.weeklyDownloads)}).`);
    }
  }

  // 2. Dependency tree comparison
  const sortedByDeps = [...packages].sort((a, b) => a.dependenciesCount - b.dependenciesCount);
  if (sortedByDeps[0].dependenciesCount !== sortedByDeps[sortedByDeps.length - 1].dependenciesCount) {
    takeaways.push(` ${sortedByDeps[0].name} has the leanest dependency tree (${sortedByDeps[0].dependenciesCount} direct dependencies vs ${sortedByDeps[sortedByDeps.length - 1].name}'s ${sortedByDeps[sortedByDeps.length - 1].dependenciesCount}).`);
  }

  // 3. TypeScript support
  const withTypes = packages.filter(p => p.hasBuiltInTypes);
  const withoutTypes = packages.filter(p => !p.hasBuiltInTypes);
  if (withTypes.length > 0 && withoutTypes.length > 0) {
    takeaways.push(`🟦 ${withTypes.map(p => p.name).join(', ')} provide(s) built-in TypeScript definitions, while ${withoutTypes.map(p => p.name).join(', ')} require external types or are untyped.`);
  }

  // 4. Module format (ESM)
  const esmPackages = packages.filter(p => p.moduleType.includes('ESM'));
  if (esmPackages.length > 0 && esmPackages.length < packages.length) {
    takeaways.push(` ${esmPackages.map(p => p.name).join(', ')} support modern ESM exports.`);
  }

  // 5. Size comparison if available
  const withSize = packages.filter(p => p.unpackedSize);
  if (withSize.length >= 2) {
    const sortedBySize = [...withSize].sort((a, b) => a.unpackedSize - b.unpackedSize);
    takeaways.push(` ${sortedBySize[0].name} has the smallest unpacked footprint (${sortedBySize[0].formattedSize}).`);
  }

  return takeaways;
}

export function CompareView({
  packages = [],
  onAddPackage,
  onRemovePackage,
  onSelectPackage,
  isSidebar = false
}) {
  const [newPkgInput, setNewPkgInput] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const takeaways = generateFactualTakeaways(packages);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (newPkgInput.trim() && onAddPackage) {
      onAddPackage(newPkgInput.trim());
      setNewPkgInput('');
      setShowAddForm(false);
    }
  };

  const chartColors = ['#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className={`compare-container ${isSidebar ? 'is-sidebar' : 'is-mainline'}`}>
      <div className="compare-header">
        <div className="header-title-row">
          <h2 className="section-heading">Package Comparison</h2>
          <span className="badge-count">{packages.length} Packages</span>
        </div>
        <p className="section-subheading">
          Comparing {packages.map(p => p.name).join(', ')}
        </p>
      </div>

      {/* Factual Takeaway Lines (Hackathon Requirement!) */}
      {takeaways.length > 0 && (
        <div className="takeaways-box">
          <div className="takeaways-title"> Factual Takeaways</div>
          <ul className="takeaways-list">
            {takeaways.map((item, idx) => (
              <li key={idx} className="takeaway-item">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Side-by-Side Comparison Matrix */}
      <div className="table-responsive">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="th-metric">Metric / Feature</th>
              {packages.map((pkg, idx) => (
                <th key={pkg.name} className="th-package">
                  <div className="pkg-th-content">
                    <span
                      className="pkg-link"
                      onClick={() => onSelectPackage && onSelectPackage(pkg.name)}
                      title="View single details"
                    >
                      {pkg.name}
                    </span>
                    <span className="th-version">v{pkg.version}</span>
                    {packages.length > 2 && onRemovePackage && (
                      <button
                        onClick={() => onRemovePackage(pkg.name)}
                        className="btn-remove"
                        title="Remove package"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="td-label">Weekly Downloads</td>
              {packages.map((pkg, idx) => (
                <td key={pkg.name} className="td-value">
                  <div className="downloads-cell">
                    <span className="num-bold">{formatNumber(pkg.weeklyDownloads)}</span>
                    <Sparkline
                      points={pkg.dailyDownloads}
                      strokeColor={chartColors[idx % chartColors.length]}
                      width={isSidebar ? 80 : 110}
                      height={26}
                    />
                  </div>
                </td>
              ))}
            </tr>

            <tr>
              <td className="td-label">Unpacked Size</td>
              {packages.map(pkg => (
                <td key={pkg.name} className="td-value">
                  {pkg.formattedSize}
                </td>
              ))}
            </tr>

            <tr>
              <td className="td-label">Dependencies</td>
              {packages.map(pkg => (
                <td key={pkg.name} className="td-value">
                  {pkg.dependenciesCount === 0 ? (
                    <span className="badge-pill badge-success">0 (Zero deps)</span>
                  ) : (
                    <span>{pkg.dependenciesCount}</span>
                  )}
                </td>
              ))}
            </tr>

            <tr>
              <td className="td-label">TypeScript</td>
              {packages.map(pkg => (
                <td key={pkg.name} className="td-value">
                  <span className={`badge-pill ${pkg.hasBuiltInTypes ? 'badge-success' : 'badge-neutral'}`}>
                    {pkg.hasBuiltInTypes ? ' Built-in' : 'External / None'}
                  </span>
                </td>
              ))}
            </tr>

            <tr>
              <td className="td-label">Module Format</td>
              {packages.map(pkg => (
                <td key={pkg.name} className="td-value">
                  {pkg.moduleType}
                </td>
              ))}
            </tr>

            <tr>
              <td className="td-label">Node Requirement</td>
              {packages.map(pkg => (
                <td key={pkg.name} className="td-value text-mono">
                  {pkg.nodeEngine}
                </td>
              ))}
            </tr>

            <tr>
              <td className="td-label">License</td>
              {packages.map(pkg => (
                <td key={pkg.name} className="td-value">
                  {pkg.license}
                </td>
              ))}
            </tr>

            <tr>
              <td className="td-label">Last Release</td>
              {packages.map(pkg => (
                <td key={pkg.name} className="td-value">
                  {pkg.releaseDate}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Add 3rd Package CTA */}
      {packages.length < 3 && onAddPackage && (
        <div className="compare-add-section">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-outline-primary"
            >
              + Add a {packages.length === 2 ? '3rd' : '2nd'} package to compare
            </button>
          ) : (
            <form onSubmit={handleAddSubmit} className="add-pkg-form">
              <input
                type="text"
                placeholder="Enter package name (e.g. koa, svelte)"
                value={newPkgInput}
                onChange={(e) => setNewPkgInput(e.target.value)}
                className="compare-input"
                autoFocus
              />
              <button type="submit" className="btn btn-primary">Add</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-ghost">Cancel</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
