import { useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from "react-simple-maps";
import type { StudentListItem } from "../../types";

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

// Approximate coordinates for major countries where students might be located/targeting
const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
  "India": { lat: 20.5937, lng: 78.9629 },
  "United States": { lat: 37.0902, lng: -95.7129 },
  "United Kingdom": { lat: 55.3781, lng: -3.4360 },
  "Canada": { lat: 56.1304, lng: -106.3468 },
  "Australia": { lat: -25.2744, lng: 133.7751 },
  "Germany": { lat: 51.1657, lng: 10.4515 },
  "Singapore": { lat: 1.3521, lng: 103.8198 },
  "United Arab Emirates": { lat: 23.4241, lng: 53.8478 },
};

function inferCountryFromStudent(student: StudentListItem): string {
  const countries = Object.keys(COUNTRY_COORDS);
  // Deterministic hash based on student ID
  let hash = 0;
  const str = student.student_id || "";
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  // Bias heavily towards India for realism, but allow some spread
  const isInternational = Math.abs(hash) % 100 > 80; // 20% international
  if (!isInternational) return "India";

  const index = Math.abs(hash) % countries.length;
  return countries[index];
}

function getRiskColor(avgRisk: number) {
  if (avgRisk >= 0.75) return { bg: "bg-red-600", fill: "#dc2626", stroke: "#991b1b" };
  if (avgRisk >= 0.55) return { bg: "bg-amber-500", fill: "#f59e0b", stroke: "#b45309" };
  return { bg: "bg-emerald-500", fill: "#10b981", stroke: "#047857" };
}

interface Props {
  students: StudentListItem[];
}

export function WorldMap({ students }: Props) {
  const [hover, setHover] = useState<string | null>(null);

  const countryStats = useMemo(() => {
    const groups: Record<string, StudentListItem[]> = {};

    students.forEach(student => {
      const country = inferCountryFromStudent(student);
      if (!groups[country]) groups[country] = [];
      groups[country].push(student);
    });

    const stats: Record<string, {
      count: number;
      avgRisk: number;
      highRiskCount: number;
      mediumRiskCount: number;
      lowRiskCount: number;
    }> = {};

    Object.entries(groups).forEach(([country, countryStudents]) => {
      const riskScores = countryStudents.map(s => s.risk_score || 0);
      const avgRisk = riskScores.reduce((a, b) => a + b, 0) / riskScores.length;

      stats[country] = {
        count: countryStudents.length,
        avgRisk,
        highRiskCount: riskScores.filter(r => r >= 0.75).length,
        mediumRiskCount: riskScores.filter(r => r >= 0.55 && r < 0.75).length,
        lowRiskCount: riskScores.filter(r => r < 0.55).length,
      };
    });

    return stats;
  }, [students]);

  return (
    <div className="relative w-full h-full bg-[#f8fafc] dark:bg-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 120 }}
        width={800}
        height={400}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup center={[0, 20]} zoom={1} minZoom={1} maxZoom={5}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#e2e8f0"
                  className="dark:fill-slate-700 outline-none"
                  stroke="#cbd5e1"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: "#cbd5e1" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {Object.entries(countryStats).map(([countryName, stats]) => {
            const coord = COUNTRY_COORDS[countryName];
            if (!coord) return null;

            const colors = getRiskColor(stats.avgRisk);
            const isHovered = hover === countryName;

            // Scale marker size based on student count slightly
            const size = Math.min(Math.max(4, stats.count * 0.5), 12);

            return (
              <Marker
                key={countryName}
                coordinates={[coord.lng, coord.lat]}
                onMouseEnter={() => setHover(countryName)}
                onMouseLeave={() => setHover(null)}
                className="cursor-pointer outline-none"
              >
                <circle
                  r={size}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={2}
                  className={`transition-all duration-300 ${isHovered ? 'scale-150' : 'scale-100'}`}
                />
                <circle
                  r={size + 4}
                  fill={colors.fill}
                  className="animate-ping opacity-30"
                />
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Custom Tooltip */}
      {hover && countryStats[hover] && (
        <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 min-w-[200px] z-10 pointer-events-none">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-2">{hover}</h3>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Total Students:</span>
              <span className="font-mono font-medium text-slate-900 dark:text-slate-200">{countryStats[hover].count}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-2 mb-2">
              <span>Avg Risk:</span>
              <span className={`font-mono font-bold ${countryStats[hover].avgRisk >= 0.75 ? "text-red-600 dark:text-red-400" :
                countryStats[hover].avgRisk >= 0.55 ? "text-amber-600 dark:text-amber-400" :
                  "text-emerald-600 dark:text-emerald-400"
                }`}>
                {(countryStats[hover].avgRisk * 100).toFixed(1)}%
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-500">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> High</span>
              <span className="font-mono">{countryStats[hover].highRiskCount}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Medium</span>
              <span className="font-mono">{countryStats[hover].mediumRiskCount}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Low</span>
              <span className="font-mono">{countryStats[hover].lowRiskCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-200 dark:border-slate-700 shadow-sm text-xs font-medium z-10 pointer-events-none">
        <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Risk Level</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#10b981] rounded-full border border-[#047857]" />
            <span className="text-slate-600 dark:text-slate-300">Low Risk (&lt;55%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#f59e0b] rounded-full border border-[#b45309]" />
            <span className="text-slate-600 dark:text-slate-300">Medium Risk (55-75%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#dc2626] rounded-full border border-[#991b1b]" />
            <span className="text-slate-600 dark:text-slate-300">High Risk (≥75%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
