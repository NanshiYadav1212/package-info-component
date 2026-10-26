// @ts-nocheck
/**
 * Intent Parser Utility
 * Categorizes user search queries into single package, comparison, alternatives, version diff, or use-case.
 */
/**
 * Natural Language Query & Intent Parser
 * Derives user intention and target packages from hyperDart's searchData prop.
 */


// export const INTENT_TYPES = {
//   SINGLE_DETAILS: 'SINGLE_DETAILS',
//   LATEST_VERSION: 'LATEST_VERSION',
//   COMPARE: 'COMPARE',
//   ALTERNATIVES: 'ALTERNATIVES',
//   VERSION_DIFF: 'VERSION_DIFF',
//   USE_CASE: 'USE_CASE',
// };

// /**
//  * Normalizes searchData prop which may arrive as an object or array
//  */
// export function normalizeSearchData(searchData) {
//   if (!searchData) return { query: '', entities: [], suggestedPlace: 'mainline' };
//   if (Array.isArray(searchData)) {
//     return searchData[0] || { query: '', entities: [], suggestedPlace: 'mainline' };
//   }
//   return searchData;
// }

// /**
//  * Parses user query string and extracted entities into structured intent
//  */
// export function parseQueryIntent(rawQuery = '', entities = []) {
//   const query = (rawQuery || '').trim();
//   const lowerQuery = query.toLowerCase();

//   // Extract candidate package names from hyperDart entity collection
//   const entityPackages = (entities || [])
//     .map(e => e?.sourceID || e?.word)
//     .filter(Boolean);

//   // 1. Version Comparison: e.g. "express 4 vs 5", "react 17 vs 18"
//   const versionDiffRegex = /([a-z0-9@/._-]+)\s+v?(\d+(?:\.\d+)*)\s+(?:vs|versus)\s+v?(\d+(?:\.\d+)*)/i;
//   const versionMatch = query.match(versionDiffRegex);
//   if (versionMatch) {
//     return {
//       type: INTENT_TYPES.VERSION_DIFF,
//       package: versionMatch[1],
//       v1: versionMatch[2],
//       v2: versionMatch[3],
//       originalQuery: query,
//     };
//   }

//   // 2. Latest/Current Version Query: e.g. "latest version of react"
//   const latestRegex = /(?:latest|current)\s+version\s+of\s+([a-z0-9@/._-]+)/i;
//   const latestMatch = query.match(latestRegex);
//   if (latestMatch || lowerQuery.includes('latest version')) {
//     const pkg = latestMatch ? latestMatch[1] : (entityPackages[0] || query.replace(/.*(?:version of)\s*/i, '').trim());
//     return {
//       type: INTENT_TYPES.LATEST_VERSION,
//       package: pkg,
//       originalQuery: query,
//     };
//   }

//   // 3. Alternatives Query: e.g. "npm alternatives to moment", "packages like lodash"
//   const altsRegex = /(?:npm\s+)?(?:alternatives?(?:\s+to|\s+for)?|packages?(?:\s+like|\s+similar\s+to))\s+([a-z0-9@/._-]+)?/i;
//   const altsMatch = query.match(altsRegex);
//   if (altsMatch || lowerQuery.includes('alternatives') || lowerQuery.includes('similar to')) {
//     const targetPkg = entityPackages[0] || (altsMatch && altsMatch[1]) || query.replace(/.*(?:to|for|like|similar to)\s+/i, '').replace(/\s*npm$/i, '').trim();
//     return {
//       type: INTENT_TYPES.ALTERNATIVES,
//       package: targetPkg,
//       originalQuery: query,
//     };
//   }

//   // 4. Comparison Query (2 or 3 packages)
//   // Triggered if 2+ entities exist OR query explicitly contains compare/vs
//   const isCompareWord = /compare| versus |\bvs\b/i.test(query);
//   if (entityPackages.length >= 2 || isCompareWord) {
//     let pkgs = [...entityPackages];
//     if (pkgs.length < 2) {
//       // Fallback: tokenize words separated by comma, 'and', 'vs'
//       const cleanParts = query
//         .replace(/^(compare|packages?|npm)\s*/gi, '')
//         .split(/,|\s+vs\s+|\s+versus\s+|\s+and\s+/i)
//         .map(s => s.trim())
//         .filter(s => s.length > 0 && !['npm', 'package', 'packages'].includes(s));
//       pkgs = cleanParts;
//     }

//     if (pkgs.length >= 2) {
//       return {
//         type: INTENT_TYPES.COMPARE,
//         packages: pkgs.slice(0, 3), // Supports up to 3 packages as per challenge
//         originalQuery: query,
//       };
//     }
//   }

//   // 5. Use-case queries without explicit package: e.g. "best npm package for date formatting", "library for parsing csv"
//   const useCaseRegex = /(?:best|top)?\s*(?:npm\s+)?(?:package|library)\s+for\s+([a-zA-Z0-9 -]+)/i;
//   const useCaseMatch = query.match(useCaseRegex);
//   if (useCaseMatch && entityPackages.length === 0) {
//     return {
//       type: INTENT_TYPES.USE_CASE,
//       topic: useCaseMatch[1].trim(),
//       originalQuery: query,
//     };
//   }

//   // 6. Default to Single Package Details (e.g. "npm express", "package info react")
//   let singlePkg = entityPackages[0];
//   if (!singlePkg) {
//     singlePkg = query
//       .replace(/^npm\s+/i, '')
//       .replace(/^package\s+info\s+/i, '')
//       .replace(/\s+npm$/i, '')
//       .trim();
//   }

//   return {
//     type: INTENT_TYPES.SINGLE_DETAILS,
//     package: singlePkg || 'react',
//     originalQuery: query,
//   };
// }



// // export type QueryIntent = 
// //   | { type: 'COMPARE'; packages: string[] }
// //   | { type: 'VERSION_DIFF'; package: string; v1: string; v2: string }
// //   | { type: 'ALTERNATIVES'; package: string }
// //   | { type: 'USE_CASE'; topic: string }
// //   | { type: 'SINGLE_DETAILS'; package: string };

// // export function parseQueryIntent(query: string, entities: any[] = []): QueryIntent {
// //   const clean = query.trim().toLowerCase();
// //   const pkgNames = entities?.map(e => e.sourceID || e.word) || [];

// //   // 1. Version diff: e.g. "express 4 vs 5" or "react 17 vs 18"
// //   const versionMatch = clean.match(/([a-z0-9@/._-]+)\s+v?(\d+[\w.-]*)\s+(?:vs|versus)\s+v?(\d+[\w.-]*)/i);
// //   if (versionMatch) {
// //     return {
// //       type: 'VERSION_DIFF',
// //       package: versionMatch[1],
// //       v1: versionMatch[2],
// //       v2: versionMatch[3]
// //     };
// //   }

// //   // 2. Alternatives
// //   if (/alternatives?( to| for)|(packages?|libraries) (like|similar to)/i.test(clean)) {
// //     const target = pkgNames[0] || clean.replace(/.*(to|for|like|similar to)\s+/i, '').trim();
// //     return { type: 'ALTERNATIVES', package: target };
// //   }

// //   // 3. Comparison (explicit or multiple entities)
// //   if (pkgNames.length >= 2 || /compare| versus |\bvs\b/i.test(clean)) {
// //     if (pkgNames.length >= 2) {
// //       return { type: 'COMPARE', packages: pkgNames.slice(0, 3) };
// //     }
// //     // Extract words around vs/compare if entities missed them
// //     const vsParts = clean.replace(/compare|packages?/g, '').split(/,|\bvs\b|\bversus\b|\band\b/).map(s => s.trim()).filter(Boolean);
// //     if (vsParts.length >= 2) {
// //       return { type: 'COMPARE', packages: vsParts.slice(0, 3) };
// //     }
// //   }

// //   // 4. Use-case queries without named package
// //   const useCaseMatch = clean.match(/(?:best|top)?\s*(?:npm )?(?:package|library) for\s+([a-z0-9 -]+)/i);
// //   if (useCaseMatch && pkgNames.length === 0) {
// //     return { type: 'USE_CASE', topic: useCaseMatch[1].trim() };
// //   }

// //   // 5. Default to single package details
// //   return {
// //     type: 'SINGLE_DETAILS',
// //     package: pkgNames[0] || clean.replace(/^npm\s+|^package\s+info\s+/i, '').trim()
// //   };
// // }
export const INTENT_TYPES = {
  SINGLE_DETAILS: 'SINGLE_DETAILS',
  LATEST_VERSION: 'LATEST_VERSION',
  COMPARE: 'COMPARE',
  ALTERNATIVES: 'ALTERNATIVES',
  VERSION_DIFF: 'VERSION_DIFF',
  USE_CASE: 'USE_CASE'
};

export function normalizeSearchData(searchData) {
  if (!searchData) return { query: 'express', entities: [], suggestedPlace: 'mainline' };
  if (Array.isArray(searchData)) {
    return searchData[0] || { query: 'express', entities: [], suggestedPlace: 'mainline' };
  }
  return searchData;
}

export function parseQueryIntent(query = '', entities = []) {
  const q = query.toLowerCase().trim();

  // 1. Version Diff (e.g., "express 4 vs 5" or "react 17 vs 18")
  const versionDiffMatch = q.match(/([a-zA-Z0-9-_]+)\s+(\d+(?:\.\d+)?)\s+(?:vs|versus)\s+(\d+(?:\.\d+)?)/i);
  if (versionDiffMatch) {
    return {
      type: INTENT_TYPES.VERSION_DIFF,
      package: versionDiffMatch[1],
      v1: versionDiffMatch[2],
      v2: versionDiffMatch[3]
    };
  }

  // 2. Comparison (e.g., "compare express, fastify", "express vs fastify")
  if (q.includes('compare') || q.includes(' versus ') || (q.includes(' vs ') && !versionDiffMatch)) {
    let rawPkgs = [];
    if (q.includes('compare')) {
      rawPkgs = q.replace('compare packages', '').replace('compare', '').split(/[,&/]|and/);
    } else {
      rawPkgs = q.split(/\s+vs\s+|\s+versus\s+/);
    }
    const packages = rawPkgs.map(p => p.trim()).filter(p => p.length > 0 && p !== 'npm' && p !== 'packages');
    if (packages.length >= 2) {
      return { type: INTENT_TYPES.COMPARE, packages: packages.slice(0, 3) };
    }
  }

  // 3. Alternatives (e.g., "alternatives to moment", "packages like axios")
  if (q.includes('alternatives') || q.includes('packages like') || q.includes('similar to')|| q.includes('alternative of')) {
    const target = entities[0]?.word || q.replace(/alternatives?( to)?/i, '').replace(/packages?( like)?/i, '').replace(/similar to/i, '').trim() || 'react';
    return { type: INTENT_TYPES.ALTERNATIVES, package: target };
  }

  // 4. Use Case (e.g., "best npm package for date formatting")
  if (q.includes('best') || q.includes('package for') || q.includes('library for')) {
    return { type: INTENT_TYPES.USE_CASE, topic: q };
  }

  // 5. Latest Version
  if (q.includes('latest version') || q.includes('current version')) {
    const pkg = entities[0]?.word || q.replace(/latest version of/i, '').replace(/current version of/i, '').trim() || 'react';
    return { type: INTENT_TYPES.LATEST_VERSION, package: pkg };
  }

  // 6. Default / Single Package View (e.g., "npm express", "lodash")
  const fallbackPkg = entities[0]?.word || q.replace(/^npm\s+/i, '').trim().split(/\s+/)[0] || 'express';
  return { type: INTENT_TYPES.SINGLE_DETAILS, package: fallbackPkg };
}