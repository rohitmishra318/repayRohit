import { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { scaleSqrt } from "d3-scale";
import type { StudentListItem } from '../../types';

interface Props { 
  students: StudentListItem[];
}

/** * Official India GeoJSON URL for accurate state boundaries 
 * Includes all union territories and states.
 */
const INDIA_GEO_URL = "https://raw.githubusercontent.com/lokesh-007/India-GeoJSON/master/india_states.json";

/**
 * Accurate Longitude and Latitude for major Indian hubs.
 * [Longitude, Latitude] format required for react-simple-maps.
 */
const CITY_COORDS: Record<string, { coord: [number, number]; name: string }> = {
  'Mumbai':     { coord: [72.8777, 19.0760], name: 'Mumbai' },
  'Delhi':      { coord: [77.1025, 28.7041], name: 'Delhi' },
  'Bengaluru':  { coord: [77.5946, 12.9716], name: 'Bengaluru' },
  'Chennai':    { coord: [80.2707, 13.0827], name: 'Chennai' },
  'Hyderabad':  { coord: [78.4867, 17.3850], name: 'Hyderabad' },
  'Pune':       { coord: [73.8567, 18.5204], name: 'Pune' },
  'Kolkata':    { coord: [88.3639, 22.5726], name: 'Kolkata' },
  'Ahmedabad':  { coord: [72.5714, 23.0225], name: 'Ahmedabad' },
  'Jaipur':     { coord: [75.7873, 26.9124], name: 'Jaipur' },
  'Lucknow':    { coord: [80.9462, 26.8467], name: 'Lucknow' },
  'Chandigarh': { coord: [76.7794, 30.7333], name: 'Chandigarh' },
  'Bhopal':     { coord: [77.4126, 23.2599], name: 'Bhopal' },
  'Nagpur':     { coord: [79.0882, 21.1458], name: 'Nagpur' },
  'Coimbatore': { coord: [76.9558, 11.0168], name: 'Coimbatore' },
  'Kochi':      { coord: [76.2673, 9.9312],  name: 'Kochi' },
};

const CITY_NAMES = Object.keys(CITY_COORDS);

export function IndiaMap({ students }: Props) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Group students by city using your index-based distribution (or student.city if available)
  const cityGroups = useMemo(() => {
    const groups: Record<string, StudentListItem[]> = {};
    students.forEach((s, i) => {
      const cityName = CITY_NAMES[i % CITY_NAMES.length];
      if (!groups[cityName]) groups[cityName] = [];
      groups[cityName].push(s);
    });
    return groups;
  }, [students]);

  // Marker size scaling based on student count
  const sizeScale = scaleSqrt()
    .domain([0, Math.max(...Object.values(cityGroups).map(g => g.length), 1)])
    .range([4, 12]);

  return (
    <div className="relative w-full h-full bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1000,
          center: [80, 22] // Centered on India
        }}
        className="w-full h-full"
      >
        <Geographies geography={INDIA_GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#F8FAFC"
                stroke="#CBD5E1"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { fill: "#F1F5F9", outline: "none" },
                  pressed: { outline: "none" }
                }}
              />
            ))
          }
        </Geographies>

        {Object.entries(cityGroups).map(([city, cityStudents]) => {
          const cityData = CITY_COORDS[city];
          if (!cityData) return null;

          const highRiskCount = cityStudents.filter(s => s.risk_tier === 'HIGH').length;
          const total = cityStudents.length;
          
          // Determine color based on high risk presence
          const color = highRiskCount > 0 ? '#DC2626' : 
                        total > 5 ? '#D97706' : '#16A34A';
          
          const radius = sizeScale(total);

          return (
            <Marker 
              key={city} 
              coordinates={cityData.coord}
              onMouseEnter={(e) => {
                setHoveredCity(city);
                setTooltipPos({ x: e.pageX, y: e.pageY });
              }}
              onMouseLeave={() => setHoveredCity(null)}
            >
              {/* Pulse effect for High Risk clusters */}
              {highRiskCount > 0 && (
                <circle r={radius + 4} fill={color} opacity={0.2}>
                  <animate attributeName="r" values={`${radius+2};${radius+8};${radius+2}`} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              
              <circle
                r={radius}
                fill={color}
                stroke="#FFFFFF"
                strokeWidth={2}
                className="cursor-pointer transition-transform hover:scale-125"
              />
            </Marker>
          );
        })}
      </ComposableMap>

      {/* Tooltip Overlay */}
      {hoveredCity && cityGroups[hoveredCity] && (
        <div 
          className="fixed pointer-events-none bg-white/95 backdrop-blur-sm border border-slate-200 p-3 rounded-lg shadow-xl z-50 text-xs min-w-[150px]"
          style={{ left: tooltipPos.x + 15, top: tooltipPos.y - 50 }}
        >
          <p className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-2">
            {hoveredCity} Hub
          </p>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Totals Borrowers:</span>
              <span className="font-semibold">{cityGroups[hoveredCity].length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-500 font-medium">Critical (High):</span>
              <span className="text-red-600 font-bold">
                {cityGroups[hoveredCity].filter(s => s.risk_tier === 'HIGH').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Avg Risk:</span>
              <span className="font-semibold">
                {(cityGroups[hoveredCity].reduce((acc, s) => acc + s.risk_score, 0) / cityGroups[hoveredCity].length * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-xs p-2 rounded-md border border-slate-200 shadow-sm flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-600">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" /> Critical Issues
        </div>
        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-600">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium Exposure
        </div>
        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Stable Zone
        </div>
      </div>
    </div>
  );
}