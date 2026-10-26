import React, { useId } from 'react';

/**
 * Lightweight Zero-Dependency SVG Sparkline
 * Renders daily download trends smoothly for 30-day activity.
 */
export function Sparkline({
  points = [],
  width = 160,
  height = 42,
  strokeColor = '#3b82f6',
  fillColor = 'rgba(59, 130, 246, 0.15)',
  className = ''
}) {
  const gradientId = useId();

  if (!points || points.length < 2) {
    return (
      <div className="sparkline-empty" style={{ width, height }}>
        <span className="text-xs text-muted">No trend data</span>
      </div>
    );
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const padding = 3;
  const effectiveHeight = height - padding * 2;
  const effectiveWidth = width - padding * 2;

  // Calculate coordinates
  const stepX = effectiveWidth / (points.length - 1);
  const coords = points.map((val, idx) => {
    const x = padding + idx * stepX;
    const y = padding + effectiveHeight - ((val - min) / range) * effectiveHeight;
    return { x, y };
  });

  const pathD = coords.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;

  return (
    <div className={`sparkline-container ${className}`} title="30-day download trend">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="sparkline-svg">
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

// export function Sparkline({ points, color = "#3b82f6", height = 36, width = 140 }: { points: number[]; color?: string; height?: number; width?: number }) {
//   if (!points || points.length < 2) return null;
  
//   const min = Math.min(...points);
//   const max = Math.max(...points);
//   const range = max - min || 1;
  
//   const stepX = width / (points.length - 1);
//   const pathD = points.map((p, i) => {
//     const x = i * stepX;
//     const y = height - ((p - min) / range) * (height - 6) - 3;
//     return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
//   }).join(' ');

//   return (
//     <svg width={width} height={height} className="overflow-visible">
//       <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//     </svg>
//   );
// }
// export function Sparkline({ points, color = "#3b82f6", height = 36, width = 140 }: { points: number[]; color?: string; height?: number; width?: number }) {
//   if (!points || points.length < 2) return null;
  
//   const min = Math.min(...points);
//   const max = Math.max(...points);
//   const range = max - min || 1;
  
//   const stepX = width / (points.length - 1);
//   const pathD = points.map((p, i) => {
//     const x = i * stepX;
//     const y = height - ((p - min) / range) * (height - 6) - 3;
//     return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
//   }).join(' ');

//   return (
//     <svg width={width} height={height} className="overflow-visible">
//       <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//     </svg>
//   );
// }