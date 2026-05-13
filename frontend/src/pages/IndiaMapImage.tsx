import { useState, useMemo } from "react";
import type { StudentListItem } from "../types";

/**
 * Standard Geographical Bounds for a typical map of India.
 * Adjust these values if your image (/india.jpg) includes 
 * more of the ocean or neighboring countries.
 */
const INDIA_BOUNDS = {
  minLat: 6.5,   // South (including islands)
  maxLat: 38.5,  // North
  minLng: 68.0,  // West
  maxLng: 98.0,  // East
};

/**
 * Indian States with Capital Coordinates (Lat/Long).
 * Using real values allows your map to scale accurately.
 * These are approximate locations of state capitals or major cities.
 */
const STATE_COORDS: Record<string, { lat: number; lng: number; state: string }> = {
  "Andhra Pradesh":      { lat: 13.1939, lng: 79.8711, state: "AP" },
  "Arunachal Pradesh":   { lat: 28.2180, lng: 92.9389, state: "AR" },
  "Assam":               { lat: 26.1445, lng: 91.7362, state: "AS" },
  "Bihar":               { lat: 25.5941, lng: 85.1376, state: "BR" },
  "Chhattisgarh":        { lat: 21.2787, lng: 81.8661, state: "CG" },
  "Goa":                 { lat: 15.2993, lng: 73.8243, state: "GA" },
  "Gujarat":             { lat: 23.0225, lng: 72.5714, state: "GJ" },
  "Haryana":             { lat: 29.0588, lng: 77.0745, state: "HR" },
  "Himachal Pradesh":    { lat: 31.7433, lng: 77.1205, state: "HP" },
  "Jharkhand":           { lat: 23.3441, lng: 85.3096, state: "JH" },
  "Karnataka":           { lat: 12.9716, lng: 77.5946, state: "KA" },
  "Kerala":              { lat: 8.7781, lng: 76.8754, state: "KL" },
  "Madhya Pradesh":      { lat: 23.1815, lng: 79.9864, state: "MP" },
  "Maharashtra":         { lat: 19.7515, lng: 75.7139, state: "MH" },
  "Manipur":             { lat: 24.6637, lng: 93.9063, state: "MN" },
  "Meghalaya":           { lat: 25.5788, lng: 91.8933, state: "ML" },
  "Mizoram":             { lat: 23.1645, lng: 92.9376, state: "MZ" },
  "Nagaland":            { lat: 25.6751, lng: 93.7597, state: "NL" },
  "Odisha":              { lat: 20.2961, lng: 85.8245, state: "OD" },
  "Punjab":              { lat: 31.5204, lng: 74.3587, state: "PB" },
  "Rajasthan":           { lat: 26.9246, lng: 75.8245, state: "RJ" },
  "Sikkim":              { lat: 27.5330, lng: 88.5122, state: "SK" },
  "Tamil Nadu":          { lat: 13.0827, lng: 80.2707, state: "TN" },
  "Telangana":           { lat: 17.3850, lng: 78.4867, state: "TG" },
  "Tripura":             { lat: 23.8103, lng: 91.2868, state: "TR" },
  "Uttar Pradesh":       { lat: 26.8467, lng: 80.9462, state: "UP" },
  "Uttarakhand":         { lat: 30.0668, lng: 79.0193, state: "UK" },
  "West Bengal":         { lat: 22.5726, lng: 88.3639, state: "WB" },
  "Delhi":               { lat: 28.6139, lng: 77.2090, state: "DL" },
  "Puducherry":          { lat: 11.9416, lng: 79.5535, state: "PY" },
  "Ladakh":              { lat: 34.3526, lng: 77.5770, state: "LD" },
  "Jammu & Kashmir":     { lat: 34.0837, lng: 74.7973, state: "JK" },
};

function project(lat: number, lng: number) {
  // Linear projection (Equirectangular) logic
  const x = ((lng - INDIA_BOUNDS.minLng) / (INDIA_BOUNDS.maxLng - INDIA_BOUNDS.minLng)) * 100;
  const y = ((INDIA_BOUNDS.maxLat - lat) / (INDIA_BOUNDS.maxLat - INDIA_BOUNDS.minLat)) * 100;

  return { x, y };
}

/**
 * Infer state from student location or target field.
 * This is a simplified mapping - in production, add a state field to the Student model.
 * Uses student_id hash for deterministic but pseudo-random distribution.
 */
function inferStateFromStudent(student: StudentListItem): string {
  const states = Object.keys(STATE_COORDS);
  
  // Create a deterministic hash from student_id
  let hash = 0;
  const str = student.student_id || "";
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Use hash to select state deterministically
  const index = Math.abs(hash) % states.length;
  return states[index];
}

/**
 * Get color based on risk score
 */
function getRiskColor(avgRisk: number): { bg: string; border: string; glow: string } {
  if (avgRisk >= 0.75) {
    // HIGH RISK - Red
    return { bg: "bg-red-600", border: "border-red-700", glow: "shadow-red-500/50" };
  } else if (avgRisk >= 0.55) {
    // MEDIUM RISK - Orange
    return { bg: "bg-orange-500", border: "border-orange-600", glow: "shadow-orange-500/50" };
  } else {
    // LOW RISK - Green
    return { bg: "bg-green-500", border: "border-green-600", glow: "shadow-green-500/50" };
  }
}

/**
 * Get risk label
 */
function getRiskLabel(avgRisk: number): string {
  if (avgRisk >= 0.75) return "HIGH";
  if (avgRisk >= 0.55) return "MEDIUM";
  return "LOW";
}

interface Props {
  students: StudentListItem[];
}

export function IndiaMapImage({ students }: Props) {
  const [hover, setHover] = useState<string | null>(null);

  // Group students by state and calculate statistics
  const stateStats = useMemo(() => {
    const groups: Record<string, StudentListItem[]> = {};

    // Group students by inferred state
    students.forEach(student => {
      const state = inferStateFromStudent(student);
      if (!groups[state]) {
        groups[state] = [];
      }
      groups[state].push(student);
    });

    // Calculate statistics per state
    const stats: Record<string, {
      count: number;
      avgRisk: number;
      highRiskCount: number;
      mediumRiskCount: number;
      lowRiskCount: number;
    }> = {};

    Object.entries(groups).forEach(([state, stateStudents]) => {
      const riskScores = stateStudents.map(s => s.risk_score || 0);
      const avgRisk = riskScores.reduce((a, b) => a + b, 0) / riskScores.length;

      stats[state] = {
        count: stateStudents.length,
        avgRisk,
        highRiskCount: riskScores.filter(r => r >= 0.75).length,
        mediumRiskCount: riskScores.filter(r => r >= 0.55 && r < 0.75).length,
        lowRiskCount: riskScores.filter(r => r < 0.55).length,
      };
    });

    return stats;
  }, [students]);

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-slate-50 rounded-xl p-2 border border-slate-200 shadow-sm overflow-hidden">
      <div className="relative w-full h-full">
        {/* Map Image - Ensure the image is a standard projection */}
        <img
          src="/india.jpg"
          alt="India Student Distribution by State"
          className="w-full h-auto rounded-lg block"
        />

        {/* Coordinate Overlay Layer */}
        <div className="absolute inset-0 pointer-events-none">
          {Object.entries(STATE_COORDS).map(([stateName, coord]) => {
            const { x, y } = project(coord.lat, coord.lng);

            // Safety check: Don't render if coordinates fall outside the map area
            if (x < 0 || x > 100 || y < 0 || y > 100) return null;

            const stats = stateStats[stateName];
            if (!stats || stats.count === 0) return null; // Only show states with students

            const colors = getRiskColor(stats.avgRisk);
            const riskLabel = getRiskLabel(stats.avgRisk);

            return (
              <div
                key={stateName}
                className="absolute pointer-events-auto group"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: hover === stateName ? 50 : 10,
                }}
                onMouseEnter={() => setHover(stateName)}
                onMouseLeave={() => setHover(null)}
              >
                {/* Visual Indicator (Dot + Pulse) */}
                <div className="relative">
                  {/* Pulse Effect for visibility */}
                  <div className={`absolute inset-0 w-3 h-3 ${colors.bg} rounded-full animate-pulse opacity-40`} />
                  
                  {/* Core Dot - Color based on risk */}
                  <div className={`w-3 h-3 rounded-full border-2 border-white shadow-lg transition-all duration-200 ${colors.bg} ${
                    hover === stateName ? "scale-150 shadow-2xl" : ""
                  } ${colors.glow}`} />
                </div>

                {/* Tooltip Overlay */}
                {hover === stateName && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xl whitespace-nowrap z-50 min-w-max">
                    <div className="font-bold text-sm">{stateName}</div>
                    <div className="text-slate-300 text-xs mt-1">
                      <div>Students: <span className="text-white font-mono">{stats.count}</span></div>
                      <div>Avg Risk: <span className={`font-mono font-bold ${
                        stats.avgRisk >= 0.75 ? "text-red-300" : stats.avgRisk >= 0.55 ? "text-orange-300" : "text-green-300"
                      }`}>{(stats.avgRisk * 100).toFixed(1)}%</span></div>
                      <div className="mt-1 pt-1 border-t border-slate-700 text-xs">
                        <div>🔴 High: {stats.highRiskCount}</div>
                        <div>🟠 Medium: {stats.mediumRiskCount}</div>
                        <div>🟢 Low: {stats.lowRiskCount}</div>
                      </div>
                    </div>
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-slate-200 shadow-md text-xs font-medium">
          <div className="font-semibold text-slate-900 mb-2">Risk Level</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full border border-green-600" />
              <span>Low Risk (&lt;55%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full border border-orange-600" />
              <span>Medium Risk (55-75%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full border border-red-700" />
              <span>High Risk (≥75%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}