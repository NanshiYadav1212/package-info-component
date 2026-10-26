import React, { useEffect, useState, useMemo } from 'react';
import { normalizeSearchData, parseQueryIntent, INTENT_TYPES } from './utils/intentParser';
import { fetchPackageData, fetchMultiplePackages } from './services/npmApi';
import { SinglePackageView } from './components/SinglePackageView';
import { CompareView } from './components/CompareView';
import { AlternativesView } from './components/AlternativesView';
import { VersionDiffView } from './components/VersionDiffView';
import { UseCaseView } from './components/UseCaseView';
import './styles.css';

/**
 * Main hyperDart Package Info Component
 * Standalone, reactive, multi-view npm intelligence widget.
 */
export default function App({ searchData, uiOptions }) {
  // Signal to the hyperDart frame that the component has loaded successfully
  useEffect(() => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'componentLoaded' }, '*');
    }
  }, []);

  // Normalize searchData from prop (handles both object and array)
  const normalized = useMemo(() => normalizeSearchData(searchData), [searchData]);
  const isSidebar = (normalized.suggestedPlace === 'sidebar') || (uiOptions?.suggestedPlace === 'sidebar');

  // Derive initial intent
  const initialIntent = useMemo(() => {
    return parseQueryIntent(normalized.query, normalized.entities);
  }, [normalized.query, normalized.entities]);

  // Active view state (allows interactive follow-up navigation without a new search)
  const [activeView, setActiveView] = useState(initialIntent.type);
  const [targetPackage, setTargetPackage] = useState(
    initialIntent.package || (initialIntent.packages ? initialIntent.packages[0] : 'react')
  );
  const [compareList, setCompareList] = useState(initialIntent.packages || []);
  const [versionDiff, setVersionDiff] = useState({
    pkg: initialIntent.package,
    v1: initialIntent.v1,
    v2: initialIntent.v2
  });
  const [useCaseTopic, setUseCaseTopic] = useState(initialIntent.topic || '');

  // Data fetching states
  const [singleData, setSingleData] = useState(null);
  const [compareData, setCompareData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state whenever query or searchData changes externally
  useEffect(() => {
    const nextIntent = parseQueryIntent(normalized.query, normalized.entities);
    setActiveView(nextIntent.type);

    if (nextIntent.type === INTENT_TYPES.COMPARE) {
      setCompareList(nextIntent.packages || []);
    } else if (nextIntent.type === INTENT_TYPES.VERSION_DIFF) {
      setVersionDiff({ pkg: nextIntent.package, v1: nextIntent.v1, v2: nextIntent.v2 });
    } else if (nextIntent.type === INTENT_TYPES.USE_CASE) {
      setUseCaseTopic(nextIntent.topic || '');
    } else {
      setTargetPackage(nextIntent.package || 'react');
    }
  }, [normalized.query, normalized.entities]);

  // Fetch data whenever targetPackage changes for Single Details
  useEffect(() => {
    if (activeView === INTENT_TYPES.SINGLE_DETAILS || activeView === INTENT_TYPES.LATEST_VERSION) {
      let isCancelled = false;
      setLoading(true);
      setError(null);

      fetchPackageData(targetPackage)
        .then(data => {
          if (!isCancelled) {
            if (data) {
              setSingleData(data);
            } else {
              setError(`Could not find package "${targetPackage}" on the npm registry.`);
            }
          }
        })
        .catch(err => {
          if (!isCancelled) setError(err.message || 'Failed to load package metadata.');
        })
        .finally(() => {
          if (!isCancelled) setLoading(false);
        });

      return () => { isCancelled = true; };
    }
  }, [targetPackage, activeView]);

  // Fetch data whenever compareList changes
  useEffect(() => {
    if (activeView === INTENT_TYPES.COMPARE && compareList.length > 0) {
      let isCancelled = false;
      setLoading(true);
      setError(null);

      fetchMultiplePackages(compareList)
        .then(results => {
          if (!isCancelled) {
            if (results.length > 0) {
              setCompareData(results);
            } else {
              setError('Unable to load comparison packages.');
            }
          }
        })
        .catch(err => {
          if (!isCancelled) setError(err.message || 'Failed to load comparison data.');
        })
        .finally(() => {
          if (!isCancelled) setLoading(false);
        });

      return () => { isCancelled = true; };
    }
  }, [compareList, activeView]);

  // --- Interactive Navigation Handlers (No New Search Needed) ---

  const handleInspectPackage = (pkgName) => {
    setTargetPackage(pkgName);
    setActiveView(INTENT_TYPES.SINGLE_DETAILS);
  };

  const handleStartCompare = (otherPkg) => {
    const list = Array.from(new Set([targetPackage, otherPkg])).slice(0, 3);
    setCompareList(list);
    setActiveView(INTENT_TYPES.COMPARE);
  };

  const handleAddComparePackage = (extraPkg) => {
    if (compareList.length < 3 && !compareList.includes(extraPkg)) {
      setCompareList([...compareList, extraPkg]);
    }
  };

  const handleRemoveComparePackage = (pkgToRemove) => {
    if (compareList.length > 2) {
      setCompareList(compareList.filter(p => p !== pkgToRemove));
    }
  };

  const handleViewAlternatives = (pkgName) => {
    setTargetPackage(pkgName);
    setActiveView(INTENT_TYPES.ALTERNATIVES);
  };

  const handleCompareMultiple = (pkgs) => {
    setCompareList(pkgs.slice(0, 3));
    setActiveView(INTENT_TYPES.COMPARE);
  };

  return (
    <div className={`hyperdart-root ${isSidebar ? 'is-sidebar-layout' : 'is-mainline-layout'}`}>
      {/* Loading state for main views */}
      {loading && (activeView === INTENT_TYPES.SINGLE_DETAILS || activeView === INTENT_TYPES.COMPARE) ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <span>Fetching live npm data...</span>
        </div>
      ) : error ? (
        <div className="empty-state">
          <p> {error}</p>
        </div>
      ) : (
        <>
          {/* 1. Single Package View (or Latest Version Query) */}
          {(activeView === INTENT_TYPES.SINGLE_DETAILS || activeView === INTENT_TYPES.LATEST_VERSION) && singleData && (
            <SinglePackageView
              pkg={singleData}
              isLatestVersionQuery={activeView === INTENT_TYPES.LATEST_VERSION}
              onCompareWith={handleStartCompare}
              onViewAlternatives={handleViewAlternatives}
              isSidebar={isSidebar}
            />
          )}

          {/* 2. Side-by-Side Comparison View (2 or 3 packages) */}
          {activeView === INTENT_TYPES.COMPARE && compareData.length >= 2 && (
            <CompareView
              packages={compareData}
              onAddPackage={handleAddComparePackage}
              onRemovePackage={handleRemoveComparePackage}
              onSelectPackage={handleInspectPackage}
              isSidebar={isSidebar}
            />
          )}

          {/* 3. Ranked Alternatives View */}
          {activeView === INTENT_TYPES.ALTERNATIVES && (
            <AlternativesView
              targetPackage={targetPackage}
              onCompareWith={handleStartCompare}
              onSelectPackage={handleInspectPackage}
              isSidebar={isSidebar}
            />
          )}

          {/* 4. Version Diff View (e.g. express 4 vs 5) */}
          {activeView === INTENT_TYPES.VERSION_DIFF && (
            <VersionDiffView
              packageName={versionDiff.pkg}
              v1={versionDiff.v1}
              v2={versionDiff.v2}
              onSelectPackage={handleInspectPackage}
              isSidebar={isSidebar}
            />
          )}

          {/* 5. Semantic Use-Case View (e.g. best npm package for date formatting) */}
          {activeView === INTENT_TYPES.USE_CASE && (
            <UseCaseView
              topic={useCaseTopic}
              onSelectPackage={handleInspectPackage}
              onComparePackages={handleCompareMultiple}
              isSidebar={isSidebar}
            />
          )}
        </>
      )}
    </div>
  );
}