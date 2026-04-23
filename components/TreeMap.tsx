'use client';

import { useEffect, useState } from 'react';
import { Trees, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import react-map-gl to avoid SSR issues
const Map = dynamic(() => import('react-map-gl').then(mod => mod.default), { ssr: false });
const Marker = dynamic(() => import('react-map-gl').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-map-gl').then(mod => mod.Popup), { ssr: false });
const NavigationControl = dynamic(() => import('react-map-gl').then(mod => mod.NavigationControl), { ssr: false });

interface TreeLocation {
  latitude: number;
  longitude: number;
  trees: number;
  location_name: string;
}

interface TreeMapProps {
  locations: TreeLocation[];
  mapboxToken: string;
}

export function TreeMap({ locations, mapboxToken }: TreeMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<TreeLocation | null>(null);
  const [mounted, setMounted] = useState(false);
  const [viewState, setViewState] = useState({
    longitude: 37.3466,
    latitude: -3.3869,
    zoom: 8,
  });

  // Only render on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate bounds to fit all markers
  useEffect(() => {
    if (locations.length > 0) {
      const lats = locations.map(loc => loc.latitude);
      const lngs = locations.map(loc => loc.longitude);
      
      const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
      
      setViewState({
        longitude: avgLng,
        latitude: avgLat,
        zoom: locations.length === 1 ? 10 : 8,
      });
    }
  }, [locations]);

  if (!mounted) {
    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold mb-2">Map Configuration Required</p>
          <p className="text-sm text-gray-500">
            Add NEXT_PUBLIC_MAPBOX_TOKEN to your environment variables
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border-2 border-forest/20 shadow-lg">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={mapboxToken}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        
        {locations.map((location, index) => (
          <Marker
            key={index}
            longitude={location.longitude}
            latitude={location.latitude}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setSelectedLocation(location);
            }}
          >
            <div className="cursor-pointer transform hover:scale-110 transition-transform">
              <div className="relative">
                {/* Tree marker with shadow */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/30 rounded-full blur-sm" />
                
                {/* Tree icon */}
                <div className="bg-green-600 text-white rounded-full p-2 shadow-lg border-2 border-white">
                  <Trees className="w-6 h-6" />
                </div>
                
                {/* Tree count badge */}
                <div className="absolute -top-2 -right-2 bg-accent text-forest text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow">
                  {location.trees}
                </div>
              </div>
            </div>
          </Marker>
        ))}

        {selectedLocation && (
          <Popup
            longitude={selectedLocation.longitude}
            latitude={selectedLocation.latitude}
            anchor="top"
            onClose={() => setSelectedLocation(null)}
            closeButton={true}
            closeOnClick={false}
            className="tree-popup"
          >
            <div className="p-3 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <Trees className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-forest text-sm">
                  {selectedLocation.location_name}
                </h3>
              </div>
              
              <div className="space-y-1 text-xs text-stone">
                <div className="flex items-center justify-between">
                  <span>Trees Planted:</span>
                  <span className="font-bold text-green-600">
                    {selectedLocation.trees}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>CO₂ Offset:</span>
                  <span className="font-bold text-blue-600">
                    {selectedLocation.trees * 22} kg/year
                  </span>
                </div>
                
                <div className="pt-2 border-t border-gray-200 text-[10px] text-gray-500">
                  <div>Lat: {selectedLocation.latitude.toFixed(4)}</div>
                  <div>Lng: {selectedLocation.longitude.toFixed(4)}</div>
                </div>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
