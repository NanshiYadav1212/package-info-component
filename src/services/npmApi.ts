// @ts-nocheck
/**
 * npm Registry & Download Counts API Service
 * Handles data aggregation, in-memory caching, rate limiting resilience, and fallbacks.
 */
// // /**
// //  * npm Registry & Download Counts API Service
// //  * Handles data aggregation, in-memory caching, rate limiting resilience, and fallbacks.
// //  */

// // const cache = new Map();
// // const CACHE_TTL = 1000 * 60 * 5; // 5 minutes cache

// // /**
// //  * Format raw bytes into human readable KB / MB
// //  * @param {number} bytes 
// //  */
// // export function formatBytes(bytes) {
// //   if (!bytes || isNaN(bytes)) return 'N/A';
// //   if (bytes < 1024) return `${bytes} B`;
// //   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
// //   return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
// // }

// // /**
// //  * Format numbers with compact notation (e.g., 24.5M, 1.2K)
// //  * @param {number} num 
// //  */
// // export function formatNumber(num) {
// //   if (num === null || num === undefined || isNaN(num)) return '0';
// //   if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
// //   if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
// //   return num.toString();
// // }

// // /**
// //  * Fetch package data from npm registry and download stats
// //  * @param {string} pkgName 
// //  */
// // export async function fetchPackageData(pkgName) {
// //   if (!pkgName) return null;
// //   const cleanName = pkgName.trim().toLowerCase();

// //   // Check in-memory cache
// //   const cached = cache.get(cleanName);
// //   if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
// //     return cached.data;
// //   }

// //   try {
// //     const encodedName = encodeURIComponent(cleanName);

// //     // Call public npm APIs in parallel
// //     const [latestRes, fullRes, weeklyRes, rangeRes] = await Promise.allSettled([
// //       fetch(`https://registry.npmjs.org/${encodedName}/latest`).then(r => r.ok ? r.json() : null),
// //       fetch(`https://registry.npmjs.org/${encodedName}`).then(r => r.ok ? r.json() : null),
// //       fetch(`https://api.npmjs.org/downloads/point/last-week/${encodedName}`).then(r => r.ok ? r.json() : null),
// //       fetch(`https://api.npmjs.org/downloads/range/last-month/${encodedName}`).then(r => r.ok ? r.json() : null),
// //     ]);

// //     const latest = latestRes.status === 'fulfilled' ? latestRes.value : null;
// //     const full = fullRes.status === 'fulfilled' ? fullRes.value : null;
// //     const weekly = weeklyRes.status === 'fulfilled' ? weeklyRes.value : null;
// //     const range = rangeRes.status === 'fulfilled' ? rangeRes.value : null;

// //     if (!latest && !full) {
// //       return null;
// //     }

// //     const manifest = latest || (full?.versions ? full.versions[full['dist-tags']?.latest] : null);
// //     if (!manifest) return null;

// //     // TypeScript detection
// //     const hasBuiltInTypes = Boolean(
// //       manifest.types ||
// //       manifest.typings ||
// //       (manifest.exports && typeof manifest.exports === 'object' && JSON.stringify(manifest.exports).includes('.d.ts'))
// //     );

// //     // Module / ESM detection
// //     const isPureESM = manifest.type === 'module';
// //     const hasExportsField = Boolean(manifest.exports);
// //     const moduleType = isPureESM ? 'Pure ESM' : (hasExportsField ? 'Dual (CJS/ESM)' : 'CommonJS');

// //     // Release date extraction
// //     const currentVersion = manifest.version;
// //     const releaseTime = full?.time?.[currentVersion] || full?.time?.modified || null;

// //     // Days since last release
// //     let daysSinceRelease = null;
// //     if (releaseTime) {
// //       const releaseDate = new Date(releaseTime);
// //       daysSinceRelease = Math.max(0, Math.floor((Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24)));
// //     }

// //     // Deprecation check
// //     const isDeprecated = Boolean(manifest.deprecated);
// //     const deprecationMessage = manifest.deprecated || (full?.versions?.[currentVersion]?.deprecated) || null;

// //     // Unpacked size & dependencies
// //     const unpackedSize = manifest.dist?.unpackedSize || null;
// //     const dependencyCount = Object.keys(manifest.dependencies || {}).length;

// //     /** @type {number[]} */
// //     const dailyPoints = Array.isArray(range?.downloads)
// //       ? range.downloads.map(/** @param {{ downloads: number }} d */ d => d.downloads)
// //       : [];

// //     const packageRecord = {
// //       name: manifest.name || cleanName,
// //       version: currentVersion || '0.0.0',
// //       description: manifest.description || 'No description provided.',
// //       license: manifest.license || 'Custom / None',
// //       homepage: manifest.homepage || null,
// //       repositoryUrl: typeof manifest.repository === 'string'
// //         ? manifest.repository
// //         : manifest.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, '') || null,
// //       weeklyDownloads: weekly?.downloads || 0,
// //       dailyDownloads: dailyPoints,
// //       deprecated: isDeprecated,
// //       deprecationMessage: deprecationMessage,
// //       hasBuiltInTypes,
// //       moduleType,
// //       nodeEngine: manifest.engines?.node || 'Not specified',
// //       dependenciesCount: dependencyCount,
// //       unpackedSize: unpackedSize,
// //       formattedSize: formatBytes(unpackedSize),
// //       releaseDate: releaseTime ? new Date(releaseTime).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown',
// //       daysSinceRelease,
// //       keywords: Array.isArray(manifest.keywords) ? manifest.keywords.slice(0, 8) : [],
// //       allVersions: full?.versions ? Object.keys(full.versions) : [currentVersion]
// //     };

// //     cache.set(cleanName, { timestamp: Date.now(), data: packageRecord });
// //     return packageRecord;
// //   } catch (error) {
// //     console.error(`Error fetching npm package ${cleanName}:`, error);
// //     return null;
// //   }
// // }

// // /**
// //  * Fetch comparison details for up to 3 packages concurrently
// //  * @param {string[]} packageNames 
// //  */
// // export async function fetchMultiplePackages(packageNames = []) {
// //   const promises = packageNames.map(name => fetchPackageData(name));
// //   const results = await Promise.all(promises);
// //   return results.filter(Boolean);
// // }

// // /**
// //  * Search packages by keyword or semantic use-case query
// //  * @param {string} text 
// //  * @param {number} [size=6] 
// //  */
// // export async function searchNpmPackages(text, size = 6) {
// //   if (!text) return [];
// //   try {
// //     const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(text)}&size=${size}`);
// //     if (!res.ok) return [];
// //     const data = await res.json();
// //     return (data.objects || []).map(/** @param {any} obj */ obj => ({
// //       name: obj.package.name,
// //       version: obj.package.version,
// //       description: obj.package.description,
// //       keywords: obj.package.keywords || [],
// //       weeklyDownloads: obj.score?.detail?.popularity ? Math.round(obj.score.detail.popularity * 1_000_000) : 0,
// //       links: obj.package.links
// //     }));
// //   } catch (err) {
// //     console.error(`Error searching npm for ${text}:`, err);
// //     return [];
// //   }
// // }
// // /**
// //  * npm Registry & Download Counts API Service
// //  * Handles data aggregation, in-memory caching, rate limiting resilience, and fallbacks.
// //  */

// // const cache = new Map();
// // const CACHE_TTL = 1000 * 60 * 5; // 5 minutes cache

// // /**
// //  * Format raw bytes into human readable KB / MB
// //  */
// // export function formatBytes(bytes) {
// //   if (!bytes || isNaN(bytes)) return 'N/A';
// //   if (bytes < 1024) return `${bytes} B`;
// //   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
// //   return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
// // }

// // /**
// //  * Format numbers with compact notation (e.g., 24.5M, 1.2K)
// //  */
// // export function formatNumber(num) {
// //   if (num === null || num === undefined || isNaN(num)) return '0';
// //   if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
// //   if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
// //   return num.toString();
// // }

// // /**
// //  * Fetch package data from npm registry and download stats
// //  */
// // export async function fetchPackageData(pkgName) {
// //   if (!pkgName) return null;
// //   const cleanName = pkgName.trim().toLowerCase();

// //   // Check in-memory cache
// //   const cached = cache.get(cleanName);
// //   if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
// //     return cached.data;
// //   }

// //   try {
// //     const encodedName = encodeURIComponent(cleanName);

// //     // Call public npm APIs in parallel
// //     const [latestRes, fullRes, weeklyRes, rangeRes] = await Promise.allSettled([
// //       fetch(`https://registry.npmjs.org/${encodedName}/latest`).then(r => r.ok ? r.json() : null),
// //       fetch(`https://registry.npmjs.org/${encodedName}`).then(r => r.ok ? r.json() : null),
// //       fetch(`https://api.npmjs.org/downloads/point/last-week/${encodedName}`).then(r => r.ok ? r.json() : null),
// //       fetch(`https://api.npmjs.org/downloads/range/last-month/${encodedName}`).then(r => r.ok ? r.json() : null),
// //     ]);

// //     const latest = latestRes.status === 'fulfilled' ? latestRes.value : null;
// //     const full = fullRes.status === 'fulfilled' ? fullRes.value : null;
// //     const weekly = weeklyRes.status === 'fulfilled' ? weeklyRes.value : null;
// //     const range = rangeRes.status === 'fulfilled' ? rangeRes.value : null;

// //     if (!latest && !full) {
// //       return null;
// //     }

// //     const manifest = latest || (full?.versions ? full.versions[full['dist-tags']?.latest] : null);
// //     if (!manifest) return null;

// //     // TypeScript detection
// //     const hasBuiltInTypes = Boolean(
// //       manifest.types ||
// //       manifest.typings ||
// //       (manifest.exports && typeof manifest.exports === 'object' && JSON.stringify(manifest.exports).includes('.d.ts'))
// //     );

// //     // Module / ESM detection
// //     const isPureESM = manifest.type === 'module';
// //     const hasExportsField = Boolean(manifest.exports);
// //     const moduleType = isPureESM ? 'Pure ESM' : (hasExportsField ? 'Dual (CJS/ESM)' : 'CommonJS');

// //     // Release date extraction
// //     const currentVersion = manifest.version;
// //     const releaseTime = full?.time?.[currentVersion] || full?.time?.modified || null;

// //     // Days since last release
// //     let daysSinceRelease = null;
// //     if (releaseTime) {
// //       const releaseDate = new Date(releaseTime);
// //       daysSinceRelease = Math.max(0, Math.floor((Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24)));
// //     }

// //     // Deprecation check
// //     const isDeprecated = Boolean(manifest.deprecated);
// //     const deprecationMessage = manifest.deprecated || (full?.versions?.[currentVersion]?.deprecated) || null;

// //     // Unpacked size & dependencies
// //     const unpackedSize = manifest.dist?.unpackedSize || null;
// //     const dependencyCount = Object.keys(manifest.dependencies || {}).length;

// //     // Daily downloads array for sparkline (last 30 days)
// //     const dailyPoints = Array.isArray(range?.downloads)
// //       ? range.downloads.map(d => d.downloads)
// //       : [];

// //     const packageRecord = {
// //       name: manifest.name || cleanName,
// //       version: currentVersion || '0.0.0',
// //       description: manifest.description || 'No description provided.',
// //       license: manifest.license || 'Custom / None',
// //       homepage: manifest.homepage || null,
// //       repositoryUrl: typeof manifest.repository === 'string'
// //         ? manifest.repository
// //         : manifest.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, '') || null,
// //       weeklyDownloads: weekly?.downloads || 0,
// //       dailyDownloads: dailyPoints,
// //       deprecated: isDeprecated,
// //       deprecationMessage: deprecationMessage,
// //       hasBuiltInTypes,
// //       moduleType,
// //       nodeEngine: manifest.engines?.node || 'Not specified',
// //       dependenciesCount: dependencyCount,
// //       unpackedSize: unpackedSize,
// //       formattedSize: formatBytes(unpackedSize),
// //       releaseDate: releaseTime ? new Date(releaseTime).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown',
// //       daysSinceRelease,
// //       keywords: Array.isArray(manifest.keywords) ? manifest.keywords.slice(0, 8) : [],
// //       allVersions: full?.versions ? Object.keys(full.versions) : [currentVersion]
// //     };

// //     cache.set(cleanName, { timestamp: Date.now(), data: packageRecord });
// //     return packageRecord;
// //   } catch (error) {
// //     console.error(`Error fetching npm package ${cleanName}:`, error);
// //     return null;
// //   }
// // }

// /**
//  * Fetch comparison details for up to 3 packages concurrently
//  */
// export async function fetchMultiplePackages(packageNames = []) {
//   const promises = packageNames.map(name => fetchPackageData(name));
//   const results = await Promise.all(promises);
//   return results.filter(Boolean);
// }

// /**
//  * Search packages by keyword or semantic use-case query
//  */
// export async function searchNpmPackages(text, size = 6) {
//   if (!text) return [];
//   try {
//     const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(text)}&size=${size}`);
//     if (!res.ok) return [];
//     const data = await res.json();
//     return (data.objects || []).map(obj => ({
//       name: obj.package.name,
//       version: obj.package.version,
//       description: obj.package.description,
//       keywords: obj.package.keywords || [],
//       weeklyDownloads: obj.score?.detail?.popularity ? Math.round(obj.score.detail.popularity * 1_000_000) : 0,
//       links: obj.package.links
//     }));
//   } catch (err) {
//     console.error(`Error searching npm for ${text}:`, err);
//     return [];
//   }
// }

// export interface PackageData {
//   name: string;
//   version: string;
//   description: string;
//   license: string;
//   homepage?: string;
//   repositoryUrl?: string;
//   weeklyDownloads: number;
//   downloadRange: { day: string; downloads: number }[];
//   deprecated?: string | false;
//   hasTypes: boolean;
//   isPureESM: boolean;
//   nodeEngine?: string;
//   dependenciesCount: number;
//   lastReleaseDate: string;
//   bundleSize?: { minified: number; gzipped: number };
// }

// const cache = new Map<string, { timestamp: number; data: PackageData }>();

// export async function fetchPackageData(packageName: string): Promise<PackageData | null> {
//   const cached = cache.get(packageName);
//   if (cached && Date.now() - cached.timestamp < 1000 * 60 * 5) {
//     return cached.data;
//   }

//   try {
//     const [latestRes, fullRes, weeklyRes, rangeRes] = await Promise.allSettled([
//       fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}/latest`).then(r => r.ok ? r.json() : null),
//       fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`).then(r => r.ok ? r.json() : null),
//       fetch(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(packageName)}`).then(r => r.ok ? r.json() : null),
//       fetch(`https://api.npmjs.org/downloads/range/last-month/${encodeURIComponent(packageName)}`).then(r => r.ok ? r.json() : null),
//     ]);

//     const latest = latestRes.status === 'fulfilled' ? latestRes.value : null;
//     const full = fullRes.status === 'fulfilled' ? fullRes.value : null;
//     const weekly = weeklyRes.status === 'fulfilled' ? weeklyRes.value : null;
//     const range = rangeRes.status === 'fulfilled' ? rangeRes.value : null;

//     if (!latest && !full) return null;

//     const manifest = latest || (full ? full.versions[full['dist-tags']?.latest] : null);
//     if (!manifest) return null;

//     // TypeScript detection
//     const hasBuiltInTypes = Boolean(manifest.types || manifest.typings);

//     // ESM detection
//     const isPureESM = manifest.type === 'module';

//     // Release date
//     const releaseDate = full?.time?.[manifest.version] || full?.time?.modified || 'Unknown';

//     const result: PackageData = {
//       name: manifest.name,
//       version: manifest.version,
//       description: manifest.description || '',
//       license: manifest.license || 'N/A',
//       homepage: manifest.homepage,
//       repositoryUrl: typeof manifest.repository === 'string' ? manifest.repository : manifest.repository?.url,
//       weeklyDownloads: weekly?.downloads || 0,
//       downloadRange: range?.downloads || [],
//       deprecated: manifest.deprecated || false,
//       hasTypes: hasBuiltInTypes,
//       isPureESM,
//       nodeEngine: manifest.engines?.node,
//       dependenciesCount: Object.keys(manifest.dependencies || {}).length,
//       lastReleaseDate: releaseDate
//     };

//     cache.set(packageName, { timestamp: Date.now(), data: result });
//     return result;
//   } catch (err) {
//     console.error(`Failed to fetch info for ${packageName}:`, err);
//     return null;
//   }
// }

// // Fetch alternative packages by keyword/text search
// export async function searchAlternatives(keyword: string): Promise<any[]> {
//   try {
//     const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(keyword)}&size=8`);
//     if (!res.ok) return [];
//     const data = await res.json();
//     return data.objects || [];
//   } catch {
//     return [];
//   }
// }


/**
 * npm Registry & Download Counts API Service
 * Handles data aggregation, in-memory caching, rate limiting resilience, and fallbacks.
 */

const cache = new Map();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes cache

/**
 * Format raw bytes into human readable KB / MB
 * @param {number} bytes 
 */
export function formatBytes(bytes) {
  if (!bytes || isNaN(bytes)) return 'N/A';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Format numbers with compact notation (e.g., 24.5M, 1.2K)
 * @param {number} num 
 */
export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Fetch package data from npm registry and download stats
 * @param {string} pkgName 
 */
export async function fetchPackageData(pkgName) {
  if (!pkgName) return null;
  const cleanName = pkgName.trim().toLowerCase();

  // Check in-memory cache
  const cached = cache.get(cleanName);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const encodedName = encodeURIComponent(cleanName);

    // Call public npm APIs in parallel
    const [latestRes, fullRes, weeklyRes, rangeRes] = await Promise.allSettled([
      fetch(`https://registry.npmjs.org/${encodedName}/latest`).then(r => r.ok ? r.json() : null),
      fetch(`https://registry.npmjs.org/${encodedName}`).then(r => r.ok ? r.json() : null),
      fetch(`https://api.npmjs.org/downloads/point/last-week/${encodedName}`).then(r => r.ok ? r.json() : null),
      fetch(`https://api.npmjs.org/downloads/range/last-month/${encodedName}`).then(r => r.ok ? r.json() : null),
    ]);

    const latest = latestRes.status === 'fulfilled' ? latestRes.value : null;
    const full = fullRes.status === 'fulfilled' ? fullRes.value : null;
    const weekly = weeklyRes.status === 'fulfilled' ? weeklyRes.value : null;
    const range = rangeRes.status === 'fulfilled' ? rangeRes.value : null;

    if (!latest && !full) {
      return null;
    }

    const manifest = latest || (full?.versions ? full.versions[full['dist-tags']?.latest] : null);
    if (!manifest) return null;

    // TypeScript detection
    const hasBuiltInTypes = Boolean(
      manifest.types ||
      manifest.typings ||
      (manifest.exports && typeof manifest.exports === 'object' && JSON.stringify(manifest.exports).includes('.d.ts'))
    );

    // Module / ESM detection
    const isPureESM = manifest.type === 'module';
    const hasExportsField = Boolean(manifest.exports);
    const moduleType = isPureESM ? 'Pure ESM' : (hasExportsField ? 'Dual (CJS/ESM)' : 'CommonJS');

    // Release date extraction
    const currentVersion = manifest.version;
    const releaseTime = full?.time?.[currentVersion] || full?.time?.modified || null;

    // Days since last release
    let daysSinceRelease = null;
    if (releaseTime) {
      const releaseDate = new Date(releaseTime);
      daysSinceRelease = Math.max(0, Math.floor((Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24)));
    }

    // Deprecation check
    const isDeprecated = Boolean(manifest.deprecated);
    const deprecationMessage = manifest.deprecated || (full?.versions?.[currentVersion]?.deprecated) || null;

    // Unpacked size & dependencies
    const unpackedSize = manifest.dist?.unpackedSize || null;
    const dependencyCount = Object.keys(manifest.dependencies || {}).length;

    /** @type {number[]} */
    const dailyPoints = Array.isArray(range?.downloads)
      ? range.downloads.map(/** @param {{ downloads: number }} d */ d => d.downloads)
      : [];

    const packageRecord = {
      name: manifest.name || cleanName,
      version: currentVersion || '0.0.0',
      description: manifest.description || 'No description provided.',
      license: manifest.license || 'Custom / None',
      homepage: manifest.homepage || null,
      repositoryUrl: typeof manifest.repository === 'string'
        ? manifest.repository
        : manifest.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, '') || null,
      weeklyDownloads: weekly?.downloads || 0,
      dailyDownloads: dailyPoints,
      deprecated: isDeprecated,
      deprecationMessage: deprecationMessage,
      hasBuiltInTypes,
      moduleType,
      nodeEngine: manifest.engines?.node || 'Not specified',
      dependenciesCount: dependencyCount,
      unpackedSize: unpackedSize,
      formattedSize: formatBytes(unpackedSize),
      releaseDate: releaseTime ? new Date(releaseTime).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown',
      daysSinceRelease,
      keywords: Array.isArray(manifest.keywords) ? manifest.keywords.slice(0, 8) : [],
      allVersions: full?.versions ? Object.keys(full.versions) : [currentVersion]
    };

    cache.set(cleanName, { timestamp: Date.now(), data: packageRecord });
    return packageRecord;
  } catch (error) {
    console.error(`Error fetching npm package ${cleanName}:`, error);
    return null;
  }
}

/**
 * Fetch comparison details for up to 3 packages concurrently
 * @param {string[]} packageNames 
 */
export async function fetchMultiplePackages(packageNames = []) {
  const promises = packageNames.map(name => fetchPackageData(name));
  const results = await Promise.all(promises);
  return results.filter(Boolean);
}

/**
 * Search packages by keyword or semantic use-case query
 * @param {string} text 
 * @param {number} [size=6] 
 */
export async function searchNpmPackages(text, size = 6) {
  if (!text) return [];
  try {
    const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(text)}&size=${size}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.objects || []).map(/** @param {any} obj */ obj => ({
      name: obj.package.name,
      version: obj.package.version,
      description: obj.package.description,
      keywords: obj.package.keywords || [],
      weeklyDownloads: obj.score?.detail?.popularity ? Math.round(obj.score.detail.popularity * 1_000_000) : 0,
      links: obj.package.links
    }));
  } catch (err) {
    console.error(`Error searching npm for ${text}:`, err);
    return [];
  }
}