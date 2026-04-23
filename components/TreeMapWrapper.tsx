'use client';

import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

interface TreeLocation {
  latitude: number;
  longitude: number;
  trees: number;
  location_name: string;
}

interface TreeMapWrapperProps {
  locations: TreeLocation[];
  mapboxToken: string;
  searchedLocation?: { lat: number; lng: number } | null;
}

// Dynamically import the TreeMap component with no SSR
const TreeMapDynamic = dynamic(
  () => import('./TreeMapClient').then(mod => mod.TreeMapClient),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    ),
  }
);

export function TreeMapWrapper({ locations, mapboxToken, searchedLocation }: TreeMapWrapperProps) {
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

  return <TreeMapDynamic locations={locations} mapboxToken={mapboxToken} searchedLocation={searchedLocation} />;
}
