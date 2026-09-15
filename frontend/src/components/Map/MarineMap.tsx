import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { MapLayersControl } from './MapLayersControl';
import { api } from '../../services/api';
import { Compass, Navigation, Radio } from 'lucide-react';

export const MarineMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<{ [key: string]: L.LayerGroup }>({});

  const {
    activeLocation,
    activeMapLayers,
    pfzs,
    routeComparison,
    setActiveLocation,
    routeToPFZ
  } = useApp();

  // 1. Initialize Map instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [activeLocation.latitude, activeLocation.longitude],
      zoom: 8,
      zoomControl: false,
      attributionControl: false
    });

    // Dark Matter CartoDB Basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Click handler to set vessel location
    map.on('click', (e: L.LeafletMouseEvent) => {
      setActiveLocation(
        { latitude: e.latlng.lat, longitude: e.latlng.lng },
        `Target: ${e.latlng.lat.toFixed(4)}?N, ${e.latlng.lng.toFixed(4)}?E`
      );
    });

    // Initialize LayerGroups
    const layers = ['vessel', 'pfz', 'sst', 'chlorophyll', 'waves', 'wind', 'imbl', 'mpas', 'restricted', 'route', 'risk_zones'];
    layers.forEach((id) => {
      const group = L.layerGroup().addTo(map);
      layerGroupsRef.current[id] = group;
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Pan map smoothly when activeLocation changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.panTo([activeLocation.latitude, activeLocation.longitude], {
      animate: true,
      duration: 0.8
    });
  }, [activeLocation.latitude, activeLocation.longitude]);

  // 3. Render Vessel Marker with Radiating Sonar Wave
  useEffect(() => {
    const group = layerGroupsRef.current['vessel'];
    if (!group) return;
    group.clearLayers();

    const vesselHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-12 h-12 rounded-full border border-cyan-400/80 sonar-circle pointer-events-none"></div>
        <div class="absolute w-8 h-8 bg-cyan-500/20 rounded-full animate-ping pointer-events-none"></div>
        <div class="relative w-6 h-6 bg-gradient-to-tr from-cyan-600 to-blue-500 border-2 border-white rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)] flex items-center justify-center text-[10px] text-white font-black">
          ?
        </div>
      </div>
    `;
    const icon = L.divIcon({
      html: vesselHtml,
      className: 'custom-leaflet-pin',
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });

    const marker = L.marker([activeLocation.latitude, activeLocation.longitude], { icon })
      .bindPopup(`
        <div class="p-2 text-slate-100 font-sans min-w-[180px]">
          <div class="flex items-center gap-1.5 font-bold text-xs text-cyan-300 pb-1 border-b border-slate-700/60">
            <span>?? Active Vessel Position</span>
          </div>
          <div class="text-xs text-cyan-400 font-mono mt-1.5 font-semibold">
            ${activeLocation.latitude.toFixed(4)}?N, ${activeLocation.longitude.toFixed(4)}?E
          </div>
          <div class="text-[10px] text-slate-400 mt-1">
            Live Sonar Transponder: Synchronized
          </div>
        </div>
      `);
    group.addLayer(marker);
  }, [activeLocation.latitude, activeLocation.longitude]);

  // 4. Render PFZs Layer with Neon Rings
  useEffect(() => {
    const group = layerGroupsRef.current['pfz'];
    if (!group) return;
    group.clearLayers();

    if (!activeMapLayers.includes('pfz')) return;

    pfzs.forEach((pfz, idx) => {
      const pfzHtml = `
        <div class="relative flex items-center justify-center group">
          <div class="absolute w-8 h-8 rounded-full bg-emerald-500/20 animate-pulse pointer-events-none"></div>
          <div class="relative flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 border-2 border-white shadow-[0_0_15px_rgba(16,185,129,0.6)] text-white font-extrabold text-[11px] font-mono">
            ${idx + 1}
          </div>
        </div>
      `;
      const icon = L.divIcon({
        html: pfzHtml,
        className: 'custom-leaflet-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([pfz.location.latitude, pfz.location.longitude], { icon });

      // Holographic styled Popup
      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-2 text-slate-100 font-sans min-w-[210px]';
      popupDiv.innerHTML = `
        <div class="flex items-center justify-between pb-1 border-b border-emerald-500/30">
          <span class="font-extrabold text-xs text-emerald-300 flex items-center gap-1">
            ?? ${pfz.name}
          </span>
          <span class="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
            pfz.safety_rating === 'SAFE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-amber-950 text-amber-300 border border-amber-700'
          }">${pfz.safety_rating}</span>
        </div>
        <div class="text-[11px] text-slate-300 my-2 space-y-1">
          <div class="flex justify-between">
            <span class="text-slate-400">Distance:</span>
            <strong class="font-mono text-cyan-300">${pfz.distance_km} km (${pfz.bearing_compass})</strong>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">SST Gradient:</span>
            <strong class="font-mono text-amber-300">${pfz.sst_c}?C</strong>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Chlorophyll-a:</span>
            <strong class="font-mono text-emerald-300">${pfz.chlorophyll_mg_m3} mg/m?</strong>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Suitability Index:</span>
            <strong class="font-mono text-white">${pfz.suitability_score}%</strong>
          </div>
        </div>
      `;
      const routeBtn = document.createElement('button');
      routeBtn.className = 'w-full py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-cyan-900/40 cursor-pointer transition-all';
      routeBtn.textContent = '?? Calculate Safe Route';
      routeBtn.onclick = () => routeToPFZ(pfz);
      popupDiv.appendChild(routeBtn);

      marker.bindPopup(popupDiv);
      group.addLayer(marker);

      // Glowing polygon contour
      if (pfz.polygon && pfz.polygon.length > 0) {
        const poly = L.polygon(pfz.polygon as any, {
          color: '#10b981',
          weight: 2,
          fillColor: '#10b981',
          fillOpacity: 0.2,
          dashArray: '4, 4'
        });
        group.addLayer(poly);
      }
    });
  }, [pfzs, activeMapLayers]);

  // 5. Render Ocean Geofences (IMBL, MPAs, Restricted Zones)
  useEffect(() => {
    api.getGeofences().then((geofences) => {
      // IMBL
      const imblGroup = layerGroupsRef.current['imbl'];
      if (imblGroup) {
        imblGroup.clearLayers();
        if (activeMapLayers.includes('imbl') && geofences.imbl) {
          geofences.imbl.forEach((b: any) => {
            const line = L.polyline(b.coordinates, {
              color: '#f59e0b',
              weight: 3,
              dashArray: '8, 8'
            }).bindPopup(`
              <div class="p-2 text-slate-100 font-sans text-xs">
                <strong class="text-amber-400 flex items-center gap-1 font-bold">?? ${b.name}</strong>
                <p class="text-[11px] text-slate-300 mt-1 leading-relaxed">${b.description}</p>
                <div class="mt-2 pt-1 border-t border-slate-700 text-[10px] text-rose-400 font-semibold">
                  Security buffer: ${b.buffer_warning_km} km
                </div>
              </div>
            `);
            imblGroup.addLayer(line);
          });
        }
      }

      // MPAs
      const mpaGroup = layerGroupsRef.current['mpas'];
      if (mpaGroup) {
        mpaGroup.clearLayers();
        if (activeMapLayers.includes('mpas') && geofences.mpas) {
          geofences.mpas.forEach((m: any) => {
            const poly = L.polygon(m.polygon, {
              color: '#f43f5e',
              weight: 2,
              fillColor: '#f43f5e',
              fillOpacity: 0.25
            }).bindPopup(`
              <div class="p-2 text-slate-100 font-sans text-xs">
                <strong class="text-rose-400 font-bold flex items-center gap-1">??? ${m.name}</strong>
                <div class="text-[11px] text-slate-300 mt-1">${m.type} (${m.state})</div>
                <div class="mt-2 p-1.5 rounded bg-rose-950/60 border border-rose-800/80 text-[10px] text-rose-200 font-medium">
                  ${m.restriction}
                </div>
              </div>
            `);
            mpaGroup.addLayer(poly);
          });
        }
      }

      // Restricted Zones
      const rzGroup = layerGroupsRef.current['restricted'];
      if (rzGroup) {
        rzGroup.clearLayers();
        if (activeMapLayers.includes('restricted') && geofences.restricted_zones) {
          geofences.restricted_zones.forEach((rz: any) => {
            const poly = L.polygon(rz.polygon, {
              color: '#a855f7',
              weight: 2,
              fillColor: '#a855f7',
              fillOpacity: 0.3,
              dashArray: '5, 5'
            }).bindPopup(`
              <div class="p-2 text-slate-100 font-sans text-xs">
                <strong class="text-purple-300 font-bold flex items-center gap-1">? ${rz.name}</strong>
                <div class="text-[11px] text-slate-400 mt-1">Authority: ${rz.authority}</div>
                <div class="mt-2 p-1.5 rounded bg-purple-950/60 border border-purple-800/80 text-[10px] text-purple-200 font-medium">
                  ${rz.restriction}
                </div>
              </div>
            `);
            rzGroup.addLayer(poly);
          });
        }
      }
    }).catch(console.error);
  }, [activeMapLayers]);

  // 6. Render SST & Chlorophyll Gradients
  useEffect(() => {
    const sstGroup = layerGroupsRef.current['sst'];
    const chlGroup = layerGroupsRef.current['chlorophyll'];
    if (sstGroup) sstGroup.clearLayers();
    if (chlGroup) chlGroup.clearLayers();

    const lat = activeLocation.latitude;
    const lon = activeLocation.longitude;

    if (sstGroup && activeMapLayers.includes('sst')) {
      const sstCircle1 = L.circle([lat + 0.15, lon - 0.2], {
        radius: 20000,
        color: '#f97316',
        fillColor: '#ea580c',
        fillOpacity: 0.18,
        weight: 1
      }).bindTooltip('SST Warm Core (29.1?C)', { permanent: false });
      const sstCircle2 = L.circle([lat - 0.2, lon - 0.3], {
        radius: 26000,
        color: '#38bdf8',
        fillColor: '#0284c7',
        fillOpacity: 0.18,
        weight: 1
      }).bindTooltip('SST Coastal Upwelling Front (27.8?C)', { permanent: false });
      sstGroup.addLayer(sstCircle1);
      sstGroup.addLayer(sstCircle2);
    }

    if (chlGroup && activeMapLayers.includes('chlorophyll')) {
      const chlCircle = L.circle([lat - 0.1, lon - 0.15], {
        radius: 22000,
        color: '#10b981',
        fillColor: '#059669',
        fillOpacity: 0.25,
        weight: 1
      }).bindTooltip('High Chlorophyll-a Plume (3.2 mg/m?)', { permanent: false });
      chlGroup.addLayer(chlCircle);
    }
  }, [activeLocation.latitude, activeLocation.longitude, activeMapLayers]);

  // 7. Render Navigation Routes
  useEffect(() => {
    const routeGroup = layerGroupsRef.current['route'];
    if (!routeGroup) return;
    routeGroup.clearLayers();

    if (!activeMapLayers.includes('route') || !routeComparison) return;

    // Shortest Route (Red dashed)
    const shortestPts: [number, number][] = routeComparison.shortest_route.waypoints.map(
      (w) => [w.latitude, w.longitude]
    );
    const shortestLine = L.polyline(shortestPts, {
      color: '#ef4444',
      weight: 3,
      dashArray: '6, 8',
      opacity: 0.8
    }).bindPopup(`
      <div class="p-2 text-slate-100 text-xs">
        <strong class="text-rose-400 font-bold">Direct Track (${routeComparison.shortest_route.distance_km} km)</strong><br/>
        <span class="text-[11px] text-slate-300">Risk: ${routeComparison.shortest_route.risk_level}</span><br/>
        ${routeComparison.shortest_route.hazards_intersected.length > 0 ? `<div class="mt-1 text-rose-300 text-[10px] font-semibold bg-rose-950/60 p-1 rounded">Crosses: ${routeComparison.shortest_route.hazards_intersected.join(', ')}</div>` : ''}
      </div>
    `);
    routeGroup.addLayer(shortestLine);

    // Safe Route (Emerald solid with neon glow)
    const safePts: [number, number][] = routeComparison.safe_route.waypoints.map(
      (w) => [w.latitude, w.longitude]
    );
    const safeLine = L.polyline(safePts, {
      color: '#10b981',
      weight: 4,
      opacity: 0.95
    }).bindPopup(`
      <div class="p-2 text-slate-100 text-xs">
        <strong class="text-emerald-300 font-bold flex items-center gap-1">? Recommended Safe Route (${routeComparison.safe_route.distance_km} km)</strong><br/>
        <span class="text-[11px] text-slate-300">Est. Duration: ${routeComparison.safe_route.estimated_duration_hours} hrs</span><br/>
        <p class="text-slate-300 text-[10px] mt-1">${routeComparison.reasoning}</p>
      </div>
    `);
    routeGroup.addLayer(safeLine);

    // Detour waypoints
    routeComparison.safe_route.waypoints.forEach((w) => {
      const wpMarker = L.circleMarker([w.latitude, w.longitude], {
        radius: 5,
        color: '#10b981',
        fillColor: '#ffffff',
        fillOpacity: 1,
        weight: 2
      }).bindTooltip(w.name, { permanent: false });
      routeGroup.addLayer(wpMarker);
    });
  }, [routeComparison, activeMapLayers]);

  // 8. Render OpenWeatherMap Tile Overlays
  const owmPrecipLayerRef = useRef<L.TileLayer | null>(null);
  const owmCloudsLayerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const owmKey = '6d3085b958ed8e8dd90c43403881fa01';

    // Precipitation Radar
    if (activeMapLayers.includes('owm_precip')) {
      if (!owmPrecipLayerRef.current) {
        owmPrecipLayerRef.current = L.tileLayer(
          `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${owmKey}`,
          { opacity: 0.7, maxZoom: 18 }
        );
      }
      if (!map.hasLayer(owmPrecipLayerRef.current)) {
        owmPrecipLayerRef.current.addTo(map);
      }
    } else if (owmPrecipLayerRef.current && map.hasLayer(owmPrecipLayerRef.current)) {
      map.removeLayer(owmPrecipLayerRef.current);
    }

    // Satellite Clouds
    if (activeMapLayers.includes('owm_clouds')) {
      if (!owmCloudsLayerRef.current) {
        owmCloudsLayerRef.current = L.tileLayer(
          `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${owmKey}`,
          { opacity: 0.6, maxZoom: 18 }
        );
      }
      if (!map.hasLayer(owmCloudsLayerRef.current)) {
        owmCloudsLayerRef.current.addTo(map);
      }
    } else if (owmCloudsLayerRef.current && map.hasLayer(owmCloudsLayerRef.current)) {
      map.removeLayer(owmCloudsLayerRef.current);
    }
  }, [activeMapLayers]);

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_35px_rgba(0,0,0,0.6)] bg-[#020617]">
      
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Tactical Layer Control */}
      <MapLayersControl />

      {/* Futuristic Floating HUD Bar (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-[400] flex items-center gap-3 bg-[#050b18]/85 backdrop-blur-xl px-4 py-2 rounded-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(0,0,0,0.6)] text-xs text-slate-200">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="font-mono font-bold text-cyan-300 text-[11px]">
            {activeLocation.latitude.toFixed(4)}?N, {activeLocation.longitude.toFixed(4)}?E
          </span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Click map to inspect any coordinate
        </span>
      </div>

      {/* Compass Rose Badge (Top Left) */}
      <div className="absolute top-4 left-4 z-[400] bg-[#050b18]/80 backdrop-blur-md p-2 rounded-xl border border-cyan-500/30 shadow-lg text-cyan-400 pointer-events-none flex items-center gap-2">
        <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
        <span className="text-[10px] font-mono tracking-widest font-bold text-cyan-300">NORTH 000?</span>
      </div>

    </div>
  );
};
