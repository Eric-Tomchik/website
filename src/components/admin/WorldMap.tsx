'use client';

import { useMemo } from 'react';

interface CountryData {
  country: string;
  activeUsers: number;
}

// Approximate center coordinates for common countries (lat, lon)
// Mapped to SVG viewBox: x = (lon + 180) * (800/360), y = (90 - lat) * (400/180)
const COUNTRY_COORDS: Record<string, [number, number]> = {
  'United States': [39.8, -98.5],
  'US': [39.8, -98.5],
  'Canada': [56.1, -106.3],
  'Mexico': [23.6, -102.5],
  'Brazil': [-14.2, -51.9],
  'Argentina': [-38.4, -63.6],
  'Colombia': [4.6, -74.3],
  'Chile': [-35.7, -71.5],
  'Peru': [-9.2, -75.0],
  'United Kingdom': [55.4, -3.4],
  'UK': [55.4, -3.4],
  'France': [46.2, 2.2],
  'Germany': [51.2, 10.4],
  'Spain': [40.5, -3.7],
  'Italy': [41.9, 12.6],
  'Portugal': [39.4, -8.2],
  'Netherlands': [52.1, 5.3],
  'Belgium': [50.5, 4.5],
  'Switzerland': [46.8, 8.2],
  'Austria': [47.5, 14.6],
  'Sweden': [60.1, 18.6],
  'Norway': [60.5, 8.5],
  'Denmark': [56.3, 9.5],
  'Finland': [61.9, 25.7],
  'Poland': [51.9, 19.1],
  'Ireland': [53.1, -7.7],
  'Romania': [45.9, 24.9],
  'Czech Republic': [49.8, 15.5],
  'Czechia': [49.8, 15.5],
  'Greece': [39.1, 21.8],
  'Hungary': [47.2, 19.5],
  'Ukraine': [48.4, 31.2],
  'Russia': [61.5, 105.3],
  'Turkey': [39.0, 35.2],
  'India': [20.6, 79.0],
  'China': [35.9, 104.2],
  'Japan': [36.2, 138.3],
  'South Korea': [35.9, 127.8],
  'Australia': [-25.3, 133.8],
  'Indonesia': [-0.8, 113.9],
  'Philippines': [12.9, 121.8],
  'Thailand': [15.9, 100.9],
  'Vietnam': [14.1, 108.3],
  'Malaysia': [4.2, 101.9],
  'Singapore': [1.4, 103.8],
  'Pakistan': [30.4, 69.3],
  'Bangladesh': [23.7, 90.4],
  'Sri Lanka': [7.9, 80.8],
  'Saudi Arabia': [23.9, 45.1],
  'United Arab Emirates': [23.4, 53.8],
  'Israel': [31.0, 34.9],
  'Egypt': [26.8, 30.8],
  'South Africa': [-30.6, 22.9],
  'Nigeria': [9.1, 8.7],
  'Kenya': [-0.0, 37.9],
  'Ghana': [7.9, -1.0],
  'Morocco': [31.8, -7.1],
  'Ethiopia': [9.1, 40.5],
  'Tanzania': [-6.4, 34.9],
  'New Zealand': [-40.9, 174.9],
  'Taiwan': [23.7, 121.0],
  'Hong Kong': [22.4, 114.1],
  'Costa Rica': [9.7, -83.8],
  'Puerto Rico': [18.2, -66.6],
  'Dominican Republic': [18.7, -70.2],
  'Jamaica': [18.1, -77.3],
  'Guatemala': [15.8, -90.2],
  'Honduras': [15.2, -86.2],
  'Panama': [8.5, -80.8],
  'Ecuador': [-1.8, -78.2],
  'Venezuela': [6.4, -66.6],
  'Bolivia': [-16.3, -63.6],
  'Uruguay': [-32.5, -55.8],
  'Paraguay': [-23.4, -58.4],
  'Cuba': [21.5, -77.8],
  'Trinidad and Tobago': [10.7, -61.2],
  'Algeria': [28.0, 1.7],
  'Tunisia': [33.9, 9.5],
  'Libya': [26.3, 17.2],
  'Sudan': [12.9, 30.2],
  'Iraq': [33.2, 43.7],
  'Iran': [32.4, 53.7],
  'Afghanistan': [33.9, 67.7],
  'Nepal': [28.4, 84.1],
  'Myanmar': [21.9, 95.9],
  'Cambodia': [12.6, 105.0],
  'Laos': [19.9, 102.5],
};

function latLonToSvg(lat: number, lon: number): [number, number] {
  // Robinson-ish projection simplified: SVG viewBox is 800x400
  const x = (lon + 180) * (800 / 360);
  const y = (90 - lat) * (400 / 180);
  return [x, y];
}

// Simplified world map outline paths (continents)
const CONTINENT_PATHS = [
  // North America (simplified)
  'M120,60 L170,55 L200,60 L220,75 L230,95 L215,105 L200,110 L190,120 L175,130 L168,128 L162,130 L155,145 L145,155 L140,160 L130,158 L125,150 L115,145 L100,130 L90,110 L95,95 L100,80 L110,70 Z',
  // Central America
  'M130,158 L140,160 L145,165 L152,170 L155,175 L148,180 L140,178 L135,172 L128,168 L130,162 Z',
  // South America
  'M170,185 L185,180 L200,185 L210,195 L215,210 L210,230 L205,250 L198,268 L190,280 L180,290 L170,288 L165,275 L160,260 L155,245 L150,225 L152,210 L158,195 Z',
  // Europe
  'M365,55 L380,52 L395,55 L410,58 L415,65 L420,75 L415,80 L410,85 L400,88 L390,92 L385,88 L375,82 L370,75 L365,68 Z',
  // Africa
  'M365,115 L385,110 L400,115 L415,125 L420,140 L418,160 L415,180 L410,200 L400,218 L390,225 L380,222 L370,210 L365,195 L360,175 L358,155 L360,135 Z',
  // Asia (simplified)
  'M420,45 L460,40 L510,42 L560,48 L600,55 L630,60 L640,70 L635,80 L630,90 L610,95 L590,100 L560,105 L530,108 L500,110 L480,108 L460,100 L440,90 L425,80 L418,70 L420,58 Z',
  // India
  'M500,115 L520,110 L530,115 L535,125 L530,140 L525,150 L515,155 L505,150 L500,140 L498,125 Z',
  // Southeast Asia
  'M560,120 L580,115 L590,120 L595,130 L590,140 L580,145 L570,140 L565,130 Z',
  // Australia
  'M580,230 L620,220 L650,225 L660,235 L655,250 L640,260 L620,265 L600,260 L585,250 L580,240 Z',
  // Japan
  'M635,72 L638,68 L642,72 L640,78 L636,76 Z',
  // UK
  'M368,58 L372,55 L375,58 L374,62 L370,62 Z',
  // New Zealand
  'M665,270 L668,265 L672,268 L670,275 L666,275 Z',
  // Indonesia
  'M565,175 L595,170 L620,172 L625,178 L610,182 L585,184 L570,180 Z',
];

export function WorldMap({ countries }: { countries: CountryData[] }) {
  const points = useMemo(() => {
    return countries
      .map((c) => {
        const coords = COUNTRY_COORDS[c.country];
        if (!coords) return null;
        const [x, y] = latLonToSvg(coords[0], coords[1]);
        return { ...c, x, y };
      })
      .filter(Boolean) as (CountryData & { x: number; y: number })[];
  }, [countries]);

  const maxUsers = Math.max(...countries.map((c) => c.activeUsers), 1);

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 800 340"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect width="800" height="340" fill="transparent" />

        {/* Continent outlines */}
        {CONTINENT_PATHS.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="rgba(148, 163, 184, 0.08)"
            stroke="rgba(148, 163, 184, 0.15)"
            strokeWidth="0.5"
          />
        ))}

        {/* Grid lines (subtle) */}
        {[0, 100, 200, 300, 400, 500, 600, 700, 800].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="340" stroke="rgba(148,163,184,0.04)" strokeWidth="0.5" />
        ))}
        {[0, 85, 170, 255, 340].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="800" y2={y} stroke="rgba(148,163,184,0.04)" strokeWidth="0.5" />
        ))}

        {/* Country dots */}
        {points.map((p) => {
          const intensity = Math.min(p.activeUsers / maxUsers, 1);
          const radius = 3 + intensity * 8;
          return (
            <g key={p.country}>
              {/* Glow ring */}
              <circle
                cx={p.x}
                cy={p.y}
                r={radius + 4}
                fill="none"
                stroke="rgba(74, 222, 128, 0.2)"
                strokeWidth="1"
              >
                <animate
                  attributeName="r"
                  values={`${radius + 2};${radius + 6};${radius + 2}`}
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.4;0.1;0.4"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              {/* Main dot */}
              <circle
                cx={p.x}
                cy={p.y}
                r={radius}
                fill={`rgba(74, 222, 128, ${0.3 + intensity * 0.5})`}
                stroke="rgba(74, 222, 128, 0.8)"
                strokeWidth="1"
              />
              {/* Center bright dot */}
              <circle
                cx={p.x}
                cy={p.y}
                r={Math.max(2, radius * 0.4)}
                fill="rgba(74, 222, 128, 0.9)"
              />
              {/* Label */}
              <text
                x={p.x}
                y={p.y - radius - 5}
                textAnchor="middle"
                fill="rgba(226, 232, 240, 0.8)"
                fontSize="9"
                fontWeight="500"
                fontFamily="system-ui, sans-serif"
              >
                {p.country} ({p.activeUsers})
              </text>
            </g>
          );
        })}

        {/* "No active users" message when empty */}
        {points.length === 0 && countries.length === 0 && (
          <text
            x="400"
            y="170"
            textAnchor="middle"
            fill="rgba(148, 163, 184, 0.4)"
            fontSize="13"
            fontFamily="system-ui, sans-serif"
          >
            No active users right now
          </text>
        )}
      </svg>
    </div>
  );
}
