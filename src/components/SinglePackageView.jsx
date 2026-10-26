import React, { useState } from 'react';
import { formatNumber } from '../services/npmApi';
import { Sparkline } from './Sparkline';

export function SinglePackageView({
  pkg,
  isLatestVersionQuery = false,
  onCompareWith,
  onViewAlternatives,
  isSidebar = false
}) {
  const [copied, setCopied] = useState(false);
  const [packageToCompare, setPackageToCompare] = useState('');
  const [showCompareInput, setShowCompareInput] = useState(false);

  const installCmd = `npm i ${pkg.name}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCompareSubmit = (e) => {
    e.preventDefault();
    if (packageToCompare.trim() && onCompareWith) {
      onCompareWith(packageToCompare.trim());
    }
  };

  return (
    <div className={`package-card ${isSidebar ? 'is-sidebar' : 'is-mainline'}`}>
      {/* Deprecation Warning Banner */}
      {pkg.deprecated && (
        <div className="deprecated-banner" role="alert">
          <div className="banner-icon"></div>
          <div className="banner-content">
            <div className="banner-title">Package Deprecated</div>
            <p className="banner-message">
              {typeof pkg.deprecationMessage === 'string'
                ? pkg.deprecationMessage
                : 'This package has been deprecated by the author and is no longer maintained.'}
            </p>
          </div>
          {onViewAlternatives && (
            <button
              onClick={() => onViewAlternatives(pkg.name)}
              className="btn btn-warning-action"
            >
              Find Replacements
            </button>
          )}
        </div>
      )}

      {/* Special Hero for "latest version of <pkg>" Query */}
      {isLatestVersionQuery && (
        <div className="latest-version-highlight">
          <span className="highlight-label">Latest Stable Release</span>
          <div className="highlight-version">v{pkg.version}</div>
          <div className="highlight-date">Released on {pkg.releaseDate} ({pkg.daysSinceRelease ?? 0} days ago)</div>
        </div>
      )}

      {/* Main Header */}
      <div className="package-header">
        <div className="header-title-row">
          <h2 className="package-name">{pkg.name}</h2>
          <span className="version-pill">v{pkg.version}</span>
          <span className="license-pill">{pkg.license}</span>
        </div>
        <p className="package-description">{pkg.description}</p>
      </div>

      {/* Metric Cards Row */}
      <div className="metrics-grid">
        <div className="metric-box">
          <span className="metric-label">Weekly Downloads</span>
          <div className="metric-value-row">
            <span className="metric-value">{formatNumber(pkg.weeklyDownloads)}</span>
            <Sparkline points={pkg.dailyDownloads} width={isSidebar ? 100 : 130} height={32} />
          </div>
        </div>

        <div className="metric-box">
          <span className="metric-label">Unpacked Size</span>
          <span className="metric-value">{pkg.formattedSize}</span>
        </div>

        <div className="metric-box">
          <span className="metric-label">Dependencies</span>
          <span className="metric-value">
            {pkg.dependenciesCount === 0 ? '0 (Zero deps)' : `${pkg.dependenciesCount} deps`}
          </span>
        </div>

        <div className="metric-box">
          <span className="metric-label">Last Published</span>
          <span className="metric-value">{pkg.releaseDate}</span>
        </div>
      </div>

      {/* Compatibility & Architecture Badges */}
      <div className="compatibility-section">
        <div className="section-label">Compatibility & Architecture:</div>
        <div className="badges-list">
          <span className={`tech-badge ${pkg.hasBuiltInTypes ? 'badge-success' : 'badge-neutral'}`}>
            {pkg.hasBuiltInTypes ? 'Built-in Types' : 'Untyped / @types'}
          </span>
          <span className={`tech-badge ${pkg.moduleType.includes('ESM') ? 'badge-success' : 'badge-neutral'}`}>
            {pkg.moduleType}
          </span>
          <span className="tech-badge badge-neutral">
            Node: {pkg.nodeEngine}
          </span>
        </div>
      </div>

      {/* Copy Command & Links Bar */}
      <div className="action-command-bar">
        <div className="command-box" onClick={handleCopy} title="Click to copy">
          <code>{installCmd}</code>
          <button className="copy-btn">{copied ? 'Copied' : 'Copy'}</button>
        </div>

        <div className="external-links">
          {pkg.repositoryUrl && (
            <a
              href={pkg.repositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="ext-link"
            >
              GitHub
            </a>
          )}
          <a
            href={`https://www.npmjs.com/package/${pkg.name}`}
            target="_blank"
            rel="noreferrer"
            className="ext-link"
          >
            npm
          </a>
        </div>
      </div>

      {/* Quick Interactive Follow-Up Actions */}
      <div className="quick-actions-bar">
        <button
          className="action-pill-btn"
          onClick={() => onViewAlternatives && onViewAlternatives(pkg.name)}
        >
           See Alternatives
        </button>

        {!showCompareInput ? (
          <button
            className="action-pill-btn"
            onClick={() => setShowCompareInput(true)}
          >
             Compare with...
          </button>
        ) : (
          <form onSubmit={handleCompareSubmit} className="inline-compare-form">
            <input
              type="text"
              placeholder="e.g. fastify, vue"
              value={packageToCompare}
              onChange={(e) => setPackageToCompare(e.target.value)}
              className="compare-input"
              autoFocus
            />
            <button type="submit" className="btn btn-sm btn-primary">Go</button>
            <button type="button" onClick={() => setShowCompareInput(false)} className="btn btn-sm btn-ghost">✕</button>
          </form>
        )}
      </div>
    </div>
  );
}
