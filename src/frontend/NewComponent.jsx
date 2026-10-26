// // import React, { useEffect } from "react";
// // import { Typography } from '@mui/material';


// // function NewComponent(props) {
  
// //   useEffect(() => {
// //     /**
// //      * This callback notifies the WebSearch platform that this component
// //      * has fully loaded and is ready to render.
// //      *
// //      * This should be triggered only once, ideally from the
// //      * top-level parent component.
// //      *
// //      * Important: Invoke this only when the UI is fully ready
// //      * (e.g., after required API data has been loaded and the
// //      * primary content has rendered), not necessarily on
// //      * component mount.
// //      */

// //     props?.messageHandlers?.componentLoaded();
// //   }, []);
// //   return (
// //     <div>
// //       <Typography variant="caption">hyperDart New Component</Typography>
// //     </div>
// //   );
// // };
// // export default NewComponent;




// import React, { useEffect, useState, useId } from 'react';
// import { Typography } from '@mui/material';

// // --- 1. UTILS & API SERVICES ---

// export function formatNumber(num) {
//   if (num === undefined || num === null) return '0';
//   if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
//   if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
//   return num.toString();
// }

// export function formatBytes(bytes) {
//   if (!bytes) return 'Unknown size';
//   const kb = bytes / 1024;
//   if (kb < 1024) return kb.toFixed(1) + ' kB';
//   return (kb / 1024).toFixed(1) + ' MB';
// }

// export async function fetchPackageData(packageName) {
//   try {
//     const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}/latest`);
//     if (!res.ok) throw new Error('Package not found');
//     const data = await res.json();

//     const dlRes = await fetch(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(packageName)}`);
//     const dlData = dlRes.ok ? await dlRes.json() : { downloads: 0 };

//     const rangeRes = await fetch(`https://api.npmjs.org/downloads/range/last-month/${encodeURIComponent(packageName)}`);
//     const rangeData = rangeRes.ok ? await rangeRes.json() : { downloads: [] };
//     const dailyDownloads = rangeData.downloads ? rangeData.downloads.map(d => d.downloads) : [];

//     const publishDate = data.time?.[data.version] || data.published || new Date().toISOString();
//     const releaseDateObj = new Date(publishDate);
//     const daysSinceRelease = Math.floor((new Date() - releaseDateObj) / (1000 * 60 * 60 * 24));

//     return {
//       name: data.name,
//       version: data.version,
//       description: data.description || '',
//       license: data.license || 'MIT',
//       weeklyDownloads: dlData.downloads || 0,
//       dailyDownloads,
//       unpackedSize: data.dist?.unpackedSize || 0,
//       formattedSize: formatBytes(data.dist?.unpackedSize),
//       dependenciesCount: Object.keys(data.dependencies || {}).length,
//       hasBuiltInTypes: !!(data.types || data.typings || data.main?.includes('.d.ts')),
//       moduleType: data.type === 'module' ? 'ESM' : 'CommonJS',
//       nodeEngine: data.engines?.node || '>=14.0.0',
//       releaseDate: releaseDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
//       daysSinceRelease,
//       deprecated: !!data.deprecated,
//       deprecationMessage: data.deprecated,
//       repositoryUrl: data.repository?.url ? data.repository.url.replace(/^git\+/, '').replace(/\.git$/, '') : null
//     };
//   } catch (err) {
//     console.error('API fetch error:', err);
//     return null;
//   }
// }

// export async function searchNpmPackages(query, size = 5) {
//   try {
//     const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=${size}`);
//     if (!res.ok) return [];
//     const data = await res.json();
//     return (data.objects || []).map(obj => ({
//       name: obj.package.name,
//       version: obj.package.version,
//       description: obj.package.description,
//       weeklyDownloads: obj.downloads?.weekly || 0,
//       keywords: obj.package.keywords || [],
//       hasBuiltInTypes: !!(obj.package.types || obj.package.typings),
//       license: obj.package.license || 'MIT'
//     }));
//   } catch (err) {
//     console.error('Search error:', err);
//     return [];
//   }
// }


// // --- 2. SUB-COMPONENTS (Sparkline & Views) ---

// export function Sparkline({ points = [], width = 160, height = 42, strokeColor = '#3b82f6' }) {
//   const gradientId = useId();
//   if (!points || points.length < 2) return <div className="sparkline-empty" style={{ width, height }}><span>No trend</span></div>;
//   const min = Math.min(...points);
//   const max = Math.max(...points);
//   const range = max - min || 1;
//   const padding = 3;
//   const effectiveHeight = height - padding * 2;
//   const effectiveWidth = width - padding * 2;
//   const stepX = effectiveWidth / (points.length - 1);
//   const coords = points.map((val, idx) => ({
//     x: padding + idx * stepX,
//     y: padding + effectiveHeight - ((val - min) / range) * effectiveHeight
//   }));
//   const pathD = coords.reduce((acc, curr, idx) => idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`, '');
//   const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;

//   return (
//     <div className="sparkline-container" title="30-day download trend">
//       <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
//         <defs>
//           <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
//             <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
//             <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
//           </linearGradient>
//         </defs>
//         <path d={areaD} fill={`url(#${gradientId})`} />
//         <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//       </svg>
//     </div>
//   );
// }

// export function SinglePackageView({ pkg, isLatestVersionQuery = false, onCompareWith, onViewAlternatives, isSidebar = false }) {
//   const [copied, setCopied] = useState(false);
//   const [packageToCompare, setPackageToCompare] = useState('');
//   const [showCompareInput, setShowCompareInput] = useState(false);
//   const installCmd = `npm i ${pkg.name}`;

//   return (
//     <div className={`package-card ${isSidebar ? 'is-sidebar' : 'is-mainline'}`}>
//       {pkg.deprecated && (
//         <div className="deprecated-banner">
//           <div className="banner-content">
//             <div className="banner-title">Package Deprecated</div>
//             <p className="banner-message">{pkg.deprecationMessage || 'No longer maintained.'}</p>
//           </div>
//           {onViewAlternatives && <button onClick={() => onViewAlternatives(pkg.name)} className="btn btn-warning-action">Find Replacements</button>}
//         </div>
//       )}
//       {isLatestVersionQuery && (
//         <div className="latest-version-highlight">
//           <span className="highlight-label">Latest Stable Release</span>
//           <div className="highlight-version">v{pkg.version}</div>
//           <div className="highlight-date">Released on {pkg.releaseDate} ({pkg.daysSinceRelease ?? 0} days ago)</div>
//         </div>
//       )}
//       <div className="package-header">
//         <div className="header-title-row">
//           <h2 className="package-name">{pkg.name}</h2>
//           <span className="version-pill">v{pkg.version}</span>
//           <span className="license-pill">{pkg.license}</span>
//         </div>
//         <p className="package-description">{pkg.description}</p>
//       </div>
//       <div className="metrics-grid">
//         <div className="metric-box">
//           <span className="metric-label">Weekly Downloads</span>
//           <div className="metric-value-row">
//             <span className="metric-value">{formatNumber(pkg.weeklyDownloads)}</span>
//             <Sparkline points={pkg.dailyDownloads} width={isSidebar ? 100 : 130} height={32} />
//           </div>
//         </div>
//         <div className="metric-box">
//           <span className="metric-label">Unpacked Size</span>
//           <span className="metric-value">{pkg.formattedSize}</span>
//         </div>
//         <div className="metric-box">
//           <span className="metric-label">Dependencies</span>
//           <span className="metric-value">{pkg.dependenciesCount === 0 ? '0 (Zero deps)' : `${pkg.dependenciesCount} deps`}</span>
//         </div>
//         <div className="metric-box">
//           <span className="metric-label">Last Published</span>
//           <span className="metric-value">{pkg.releaseDate}</span>
//         </div>
//       </div>
//       <div className="quick-actions-bar">
//         <button className="action-pill-btn" onClick={() => onViewAlternatives && onViewAlternatives(pkg.name)}>See Alternatives</button>
//         {!showCompareInput ? (
//           <button className="action-pill-btn" onClick={() => setShowCompareInput(true)}>Compare with...</button>
//         ) : (
//           <form onSubmit={(e) => { e.preventDefault(); if (packageToCompare.trim()) onCompareWith(packageToCompare.trim()); }} className="inline-compare-form">
//             <input type="text" placeholder="e.g. fastify" value={packageToCompare} onChange={(e) => setPackageToCompare(e.target.value)} className="compare-input" autoFocus />
//             <button type="submit" className="btn btn-sm btn-primary">Go</button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }


// // --- 3. MAIN COMPONENT EXPORT ---

// export default function NewComponent({ searchData }) {
//   const [activePkg, setActivePkg] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function init() {
//       setLoading(true);
//       const pkgName = searchData?.entities?.[0]?.sourceID || 'express';
//       const data = await fetchPackageData(pkgName);
//       setActivePkg(data);
//       setLoading(false);
//     }
//     init();
//   }, [searchData]);

//   if (loading || !activePkg) {
//     return <div className="loading-state"><div className="spinner"></div><span>Loading package intelligence...</span></div>;
//   }

//   return (
//     <div className="package-info-container">
//       <SinglePackageView pkg={activePkg} />
//     </div>
//   );
// }

import React, { useEffect, useState, useId } from 'react';

// --- 1. UTILS & API SERVICES ---

export function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

export function formatBytes(bytes) {
  if (!bytes) return 'Unknown size';
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(1) + ' kB';
  return (kb / 1024).toFixed(1) + ' MB';
}

export async function fetchPackageData(packageName) {
  try {
    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}/latest`);
    if (!res.ok) throw new Error('Package not found');
    const data = await res.json();

    const dlRes = await fetch(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(packageName)}`);
    const dlData = dlRes.ok ? await dlRes.json() : { downloads: 0 };

    const rangeRes = await fetch(`https://api.npmjs.org/downloads/range/last-month/${encodeURIComponent(packageName)}`);
    const rangeData = rangeRes.ok ? await rangeRes.json() : { downloads: [] };
    const dailyDownloads = rangeData.downloads ? rangeData.downloads.map(d => d.downloads) : [];

    const publishDate = data.time?.[data.version] || data.published || new Date().toISOString();
    const releaseDateObj = new Date(publishDate);
    const daysSinceRelease = Math.floor((new Date() - releaseDateObj) / (1000 * 60 * 60 * 24));

    return {
      name: data.name,
      version: data.version,
      description: data.description || '',
      license: data.license || 'MIT',
      weeklyDownloads: dlData.downloads || 0,
      dailyDownloads,
      unpackedSize: data.dist?.unpackedSize || 0,
      formattedSize: formatBytes(data.dist?.unpackedSize),
      dependenciesCount: Object.keys(data.dependencies || {}).length,
      hasBuiltInTypes: !!(data.types || data.typings || data.main?.includes('.d.ts')),
      moduleType: data.type === 'module' ? 'ESM' : 'CommonJS',
      nodeEngine: data.engines?.node || '>=14.0.0',
      releaseDate: releaseDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      daysSinceRelease,
      deprecated: !!data.deprecated,
      deprecationMessage: data.deprecated,
      repositoryUrl: data.repository?.url ? data.repository.url.replace(/^git\+/, '').replace(/\.git$/, '') : null
    };
  } catch (err) {
    console.error('API fetch error:', err);
    return null;
  }
}

export async function searchNpmPackages(query, size = 5) {
  try {
    const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=${size}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.objects || []).map(obj => ({
      name: obj.package.name,
      version: obj.package.version,
      description: obj.package.description,
      weeklyDownloads: obj.downloads?.weekly || 0,
      keywords: obj.package.keywords || [],
      hasBuiltInTypes: !!(obj.package.types || obj.package.typings),
      license: obj.package.license || 'MIT'
    }));
  } catch (err) {
    console.error('Search error:', err);
    return [];
  }
}


// --- 2. SPARKLINE COMPONENT ---

export function Sparkline({ points = [], width = 140, height = 36, strokeColor = '#3b82f6' }) {
  const gradientId = useId();
  if (!points || points.length < 2) return <div className="sparkline-empty" style={{ width, height }}><span>No trend</span></div>;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const padding = 3;
  const effectiveHeight = height - padding * 2;
  const effectiveWidth = width - padding * 2;
  const stepX = effectiveWidth / (points.length - 1);
  const coords = points.map((val, idx) => ({
    x: padding + idx * stepX,
    y: padding + effectiveHeight - ((val - min) / range) * effectiveHeight
  }));
  const pathD = coords.reduce((acc, curr, idx) => idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`, '');
  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;

  return (
    <div className="sparkline-container" title="30-day download trend">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#${gradientId})`} />
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}


// --- 3. MAIN HYPERDART COMPONENT EXPORT ---

export default function NewComponent({ searchData }) {
  const [loading, setLoading] = useState(true);
  const [packageData, setPackageData] = useState(null);

  // Ingest searchData passed down from hyperDart runtime
  const query = searchData?.query || '';
  const entities = searchData?.entities || [];

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // Fallback to express if no entities found
      const targetPkg = entities[0]?.sourceID || 'express';
      const data = await fetchPackageData(targetPkg);
      setPackageData(data);
      setLoading(false);
    }
    loadData();
  }, [searchData, entities]);

  if (loading || !packageData) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <span>Analyzing npm intelligence for query: "{query}"...</span>
      </div>
    );
  }

  return (
    <div className="package-info-container">
      <div className="package-card">
        <div className="package-header">
          <div className="header-title-row">
            <h2 className="package-name">{packageData.name}</h2>
            <span className="version-pill">v{packageData.version}</span>
            <span className="license-pill">{packageData.license}</span>
          </div>
          <p className="package-description">{packageData.description}</p>
        </div>

        <div className="metrics-grid">
          <div className="metric-box">
            <span className="metric-label">Weekly Downloads</span>
            <div className="metric-value-row">
              <span className="metric-value">{formatNumber(packageData.weeklyDownloads)}</span>
              <Sparkline points={packageData.dailyDownloads} width={120} height={32} />
            </div>
          </div>
          <div className="metric-box">
            <span className="metric-label">Unpacked Size</span>
            <span className="metric-value">{packageData.formattedSize}</span>
          </div>
          <div className="metric-box">
            <span className="metric-label">Dependencies</span>
            <span className="metric-value">
              {packageData.dependenciesCount === 0 ? '0 (Zero deps)' : `${packageData.dependenciesCount} deps`}
            </span>
          </div>
          <div className="metric-box">
            <span className="metric-label">Last Published</span>
            <span className="metric-value">{packageData.releaseDate}</span>
          </div>
        </div>

        <div className="compatibility-section">
          <div className="section-label">Compatibility & Architecture:</div>
          <div className="badges-list">
            <span className={`tech-badge ${packageData.hasBuiltInTypes ? 'badge-success' : 'badge-neutral'}`}>
              {packageData.hasBuiltInTypes ? 'Built-in Types' : 'External / None'}
            </span>
            <span className={`tech-badge ${packageData.moduleType.includes('ESM') ? 'badge-success' : 'badge-neutral'}`}>
              {packageData.moduleType}
            </span>
            <span className="tech-badge badge-neutral">
              Node: {packageData.nodeEngine}
            </span>
          </div>
        </div>

        <div className="action-command-bar">
          <div className="command-box">
            <code>npm i {packageData.name}</code>
          </div>
          <div className="external-links">
            {packageData.repositoryUrl && (
              <a href={packageData.repositoryUrl} target="_blank" rel="noreferrer" className="ext-link">
                GitHub
              </a>
            )}
            <a href={`https://www.npmjs.com/package/${packageData.name}`} target="_blank" rel="noreferrer" className="ext-link">
              npm
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}