import React, { useState, useMemo, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { StudentListItem } from '../types';
import { useTheme } from '../context/ThemeContext';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

/**
 * Map cities to their corresponding states so students are grouped by State.
 */
const CITY_TO_STATE: Record<string, string> = {
  'Mumbai': 'Maharashtra',
  'Delhi': 'Delhi',
  'Bengaluru': 'Karnataka',
  'Chennai': 'Tamil Nadu',
  'Hyderabad': 'Telangana',
  'Pune': 'Maharashtra',
  'Kolkata': 'West Bengal',
  'Ahmedabad': 'Gujarat',
  'Jaipur': 'Rajasthan',
  'Lucknow': 'Uttar Pradesh',
  'Chandigarh': 'Punjab',
  'Bhopal': 'Madhya Pradesh',
  'Nagpur': 'Maharashtra',
  'Coimbatore': 'Tamil Nadu',
  'Kochi': 'Kerala',
  'Indore': 'Madhya Pradesh',
  'Patna': 'Bihar',
  'Bhubaneswar': 'Odisha',
  'Visakhapatnam': 'Andhra Pradesh',
  'Thiruvananthapuram': 'Kerala',
  'Guwahati': 'Assam',
  'Dehradun': 'Uttarakhand',
  'Ranchi': 'Jharkhand',
  'Raipur': 'Chhattisgarh',
  'Srinagar': 'Jammu & Kashmir',
};

/**
 * State-level fallback coordinates for legacy/synthetic students
 * without a city field. Used with the hash-based distribution.
 */
const STATE_COORDS: Record<string, { lat: number; lng: number; abbr: string }> = {
  'Andhra Pradesh': { lat: 15.91, lng: 79.74, abbr: 'AP' },
  'Arunachal Pradesh': { lat: 28.21, lng: 94.72, abbr: 'AR' },
  'Assam': { lat: 26.20, lng: 92.93, abbr: 'AS' },
  'Bihar': { lat: 25.09, lng: 85.31, abbr: 'BR' },
  'Chhattisgarh': { lat: 21.27, lng: 81.86, abbr: 'CG' },
  'Goa': { lat: 15.29, lng: 73.85, abbr: 'GA' },
  'Gujarat': { lat: 22.25, lng: 71.19, abbr: 'GJ' },
  'Haryana': { lat: 29.05, lng: 76.08, abbr: 'HR' },
  'Himachal Pradesh': { lat: 31.10, lng: 77.17, abbr: 'HP' },
  'Jharkhand': { lat: 23.61, lng: 85.27, abbr: 'JH' },
  'Karnataka': { lat: 15.31, lng: 75.71, abbr: 'KA' },
  'Kerala': { lat: 10.85, lng: 76.27, abbr: 'KL' },
  'Madhya Pradesh': { lat: 23.47, lng: 77.94, abbr: 'MP' },
  'Maharashtra': { lat: 19.75, lng: 75.71, abbr: 'MH' },
  'Manipur': { lat: 24.66, lng: 93.90, abbr: 'MN' },
  'Meghalaya': { lat: 25.46, lng: 91.36, abbr: 'ML' },
  'Mizoram': { lat: 23.16, lng: 92.93, abbr: 'MZ' },
  'Nagaland': { lat: 26.15, lng: 94.56, abbr: 'NL' },
  'Odisha': { lat: 20.95, lng: 85.09, abbr: 'OD' },
  'Punjab': { lat: 31.14, lng: 75.34, abbr: 'PB' },
  'Rajasthan': { lat: 27.39, lng: 73.43, abbr: 'RJ' },
  'Sikkim': { lat: 27.53, lng: 88.51, abbr: 'SK' },
  'Tamil Nadu': { lat: 11.12, lng: 78.65, abbr: 'TN' },
  'Telangana': { lat: 18.11, lng: 79.01, abbr: 'TG' },
  'Tripura': { lat: 23.94, lng: 91.98, abbr: 'TR' },
  'Uttar Pradesh': { lat: 26.84, lng: 80.94, abbr: 'UP' },
  'Uttarakhand': { lat: 30.06, lng: 79.01, abbr: 'UK' },
  'West Bengal': { lat: 22.98, lng: 87.85, abbr: 'WB' },
  'Delhi': { lat: 28.61, lng: 77.20, abbr: 'DL' },
  'Puducherry': { lat: 11.94, lng: 79.80, abbr: 'PY' },
  'Jammu & Kashmir': { lat: 33.77, lng: 76.57, abbr: 'JK' },
};

/**
 * For legacy students without a city, hash their ID to a state name.
 */
function inferState(student: StudentListItem): string {
  const states = Object.keys(STATE_COORDS);
  let hash = 0;
  const str = student.student_id || '';
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return states[Math.abs(hash) % states.length];
}

/**
 * Resolve a student to a location label + coordinates.
 * Maps valid cities to their respective State, or uses the hash fallback.
 */
function resolveLocation(student: StudentListItem): { label: string; lat: number; lng: number } {
  if (student.city && student.city !== 'Other' && CITY_TO_STATE[student.city]) {
    const state = CITY_TO_STATE[student.city];
    const sc = STATE_COORDS[state];
    return { label: state, lat: sc.lat, lng: sc.lng };
  }
  // Fallback: hash-based state assignment for legacy students
  const state = inferState(student);
  const sc = STATE_COORDS[state];
  return { label: state, lat: sc.lat, lng: sc.lng };
}

export function IndiaMapImage({ students }: { students: StudentListItem[] }) {
  console.log("data", students);
  const { theme } = useTheme();
  const mapRef = useRef<any>(null);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  const locationStats = useMemo(() => {
    const groups: Record<string, { students: StudentListItem[]; lat: number; lng: number }> = {};
    students.forEach(s => {
      const loc = resolveLocation(s);
      if (!groups[loc.label]) {
        groups[loc.label] = { students: [], lat: loc.lat, lng: loc.lng };
      }
      groups[loc.label].students.push(s);
    });

    const out: Record<string, { count: number; avgRisk: number; lat: number; lng: number }> = {};
    Object.entries(groups).forEach(([label, data]) => {
      const scores = data.students.map(s => s.risk_score || 0);
      out[label] = {
        count: data.students.length,
        avgRisk: scores.reduce((a, b) => a + b, 0) / scores.length,
        lat: data.lat,
        lng: data.lng,
      };
    });
    return out;
  }, [students]);

  const maxCount = Math.max(...Object.values(locationStats).map(s => s.count), 1);

  return (
    <>
      {/* Global CSS for the ripple animation */}
      <style>{`
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(3); opacity: 0; }
        }
        .ripple {
          position: absolute;
          border-radius: 50%;
          animation: ripple 1s ease-out infinite;
        }
        .mapboxgl-popup-content {
          background: rgba(18, 18, 31, 0.9) !important;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important;
          color: white !important;
          padding: 12px !important;
        }
        /* Vignette overlay to blend map edges */
        .map-vignette {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 5;
          background: radial-gradient(circle at center, transparent 30%, #f8fafc 100%);
        }
        .dark .map-vignette {
          background: radial-gradient(circle at center, transparent 30%, #080812 100%);
        }
        .mapboxgl-popup-tip {
          border-top-color: rgba(18, 18, 31, 0.9) !important;
        }
      `}</style>

      <div className={`relative w-full h-[550px] rounded-2xl overflow-hidden border ${theme === 'dark' ? 'border-white/5 bg-[#0d0d1f]' : 'border-slate-200 bg-white'}`}>
        {/* The Vignette */}
        <div className="map-vignette" />

        <Map
          ref={mapRef}
          initialViewState={{ longitude: 78.9629, latitude: 22.5937, zoom: 4.2 }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={theme === 'dark' ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11"}
          mapboxAccessToken={MAPBOX_TOKEN}
          attributionControl={false}
        >
          <NavigationControl position="top-right" />

          {Object.entries(locationStats).map(([name, stats]) => {
            const isHigh = stats.avgRisk >= 0.75;
            const isMid = stats.avgRisk >= 0.55;
            const coreColor = isHigh ? '#ef4444' : isMid ? '#f59e0b' : '#34d399';
            const size = 2 + (stats.count / maxCount) * 10;

            return (
              <React.Fragment key={name}>
                <Marker longitude={stats.lng} latitude={stats.lat} anchor="center">
                  <div
                    className="relative cursor-pointer group"
                    onMouseEnter={() => setHoveredLocation(name)}
                    onMouseLeave={() => setHoveredLocation(null)}
                  >
                    <div
                      className="ripple"
                      style={{
                        width: size, height: size,
                        backgroundColor: coreColor,
                        left: 0, top: 0
                      }}
                    />
                    <div
                      className="relative transition-all duration-300 group-hover:scale-125 shadow-lg"
                      style={{
                        width: size,
                        height: size,
                        backgroundColor: coreColor,
                        borderRadius: '50%',
                        border: '1.5px solid rgba(255,255,255,0.4)',
                        boxShadow: `0 0 20px ${coreColor}`,
                      }}
                    />
                  </div>
                </Marker>

                {hoveredLocation === name && (
                  <Popup
                    longitude={stats.lng}
                    latitude={stats.lat}
                    anchor="bottom"
                    closeButton={false}
                    offsetTop={-size}
                  >
                    <div className="font-display">
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Location Details</p>
                      <h3 className="font-bold text-sm text-white dark:text-white mb-2">{name}</h3>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-300">Borrowers</span>
                        <span className="text-xs font-bold">{stats.count}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 mt-1">
                        <span className="text-xs text-slate-300">Risk Level</span>
                        <span className="text-xs font-bold" style={{ color: coreColor }}>
                          {(stats.avgRisk * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </Popup>
                )}
              </React.Fragment>
            );
          })}

          {/* Floating Header Label */}
          <div className="absolute top-4 left-4 z-10">
            <div className={`${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white/40 border-slate-200'} backdrop-blur-md border px-3 py-1.5 rounded-lg`}>
              <p className={`text-[10px] ${theme === 'dark' ? 'text-white/50' : 'text-slate-500'} uppercase tracking-[0.2em] font-medium`}>
                Live Risk Spread
              </p>
            </div>
          </div>
        </Map>
      </div>
    </>
  );
}