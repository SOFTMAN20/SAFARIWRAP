'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Trees, Leaf, MapPin, Award, TrendingUp, Globe, Search, Navigation, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { formatCarbonOffset } from '@/lib/environmental-impact';
import { TreeMapWrapper } from '@/components/TreeMapWrapper';

// Query keys for better cache management
const queryKeys = {
  impact: ['impact'] as const,
  impactStats: (userId: string) => [...queryKeys.impact, 'stats', userId] as const,
};

// Animation presets
const animationPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2 },
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export default function ImpactPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [searchLat, setSearchLat] = useState('');
  const [searchLng, setSearchLng] = useState('');
  const [searchedLocation, setSearchedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // For now, allow all operators to access impact page (free plan included)
  const hasAccess = true;
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: queryKeys.impactStats(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) return null;
      
      const response = await fetch(`/api/environmental/stats?operator_id=${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch impact stats');
      }
      
      const result = await response.json();
      return result.data;
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (!mounted) {
    return null;
  }

  // Handle coordinate search
  const handleSearchCoordinates = () => {
    const lat = parseFloat(searchLat);
    const lng = parseFloat(searchLng);

    if (isNaN(lat) || isNaN(lng)) {
      setLocationError('Please enter valid coordinates');
      return;
    }

    if (lat < -90 || lat > 90) {
      setLocationError('Latitude must be between -90 and 90');
      return;
    }

    if (lng < -180 || lng > 180) {
      setLocationError('Longitude must be between -180 and 180');
      return;
    }

    setLocationError(null);
    setSearchedLocation({ lat, lng });
  };

  // Get current GPS location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setSearchLat(lat.toFixed(6));
        setSearchLng(lng.toFixed(6));
        setSearchedLocation({ lat, lng });
        setIsGettingLocation(false);
      },
      (error) => {
        let errorMessage = 'Error getting your location. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
        }
        
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchLat('');
    setSearchLng('');
    setSearchedLocation(null);
    setLocationError(null);
  };

  if (!mounted) {
    return null;
  }

  if (statsLoading) {
    return <ImpactSkeleton />;
  }

  if (statsError) {
    return <ImpactError error={statsError} />;
  }

  return (
    <div className="min-h-screen bg-parchment py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold text-forest mb-4">
            🌍 Environmental Impact
          </h1>
          <p className="text-xl text-stone">
            Your contribution to conservation and reforestation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Trees className="w-10 h-10 text-green-600" />
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-4xl font-extrabold text-green-700 mb-2">
                  {stats?.total_trees_planted || 0}
                </div>
                <div className="text-sm font-semibold text-green-600">
                  Trees Planted
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Leaf className="w-10 h-10 text-blue-600" />
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-4xl font-extrabold text-blue-700 mb-2">
                  {formatCarbonOffset(stats?.carbon_offset_kg || 0)}
                </div>
                <div className="text-sm font-semibold text-blue-600">
                  CO₂ Offset/Year
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Award className="w-10 h-10 text-purple-600" />
                </div>
                <div className="text-4xl font-extrabold text-purple-700 mb-2">
                  {stats?.total_events || 0}
                </div>
                <div className="text-sm font-semibold text-purple-600">
                  Events with Impact
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <MapPin className="w-10 h-10 text-orange-600" />
                </div>
                <div className="text-4xl font-extrabold text-orange-700 mb-2">
                  {stats?.locations.length || 0}
                </div>
                <div className="text-sm font-semibold text-orange-600">
                  Planting Locations
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trees className="w-6 h-6 text-green-600" />
                Conservation Partnership
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-forest mb-2">
                    Green Manjaro
                  </h3>
                  <p className="text-stone mb-4">
                    We partner with Green Manjaro to plant trees in the Mount Kilimanjaro region of Tanzania.
                    Every tree is GPS-tracked and contributes to reforestation efforts in East Africa.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-stone">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>Mount Kilimanjaro, Tanzania</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Leaf className="w-4 h-4" />
                      <span>22 kg CO₂/tree/year</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" onClick={() => window.open('https://greenmanjaro.com', '_blank')}>
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {stats && stats.locations.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            {/* Coordinate Search Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-6 h-6 text-blue-600" />
                  Find Trees by Coordinates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-stone mb-4">
                  Enter GPS coordinates to locate trees on the map, or use your current location.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="latitude" className="text-sm font-semibold text-forest mb-2 block">
                      Latitude
                    </Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.000001"
                      placeholder="e.g., -3.3869"
                      value={searchLat}
                      onChange={(e) => setSearchLat(e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-stone mt-1">Range: -90 to 90</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="longitude" className="text-sm font-semibold text-forest mb-2 block">
                      Longitude
                    </Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.000001"
                      placeholder="e.g., 37.3466"
                      value={searchLng}
                      onChange={(e) => setSearchLng(e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-stone mt-1">Range: -180 to 180</p>
                  </div>
                </div>

                {locationError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{locationError}</p>
                  </div>
                )}

                {searchedLocation && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-semibold text-green-800">Location Found</p>
                        <p className="text-xs text-green-700">
                          {searchedLocation.lat.toFixed(6)}, {searchedLocation.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleClearSearch}
                      className="text-green-700 hover:text-green-900"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSearchCoordinates}
                    disabled={!searchLat || !searchLng}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search on Map
                  </Button>
                  
                  <Button
                    onClick={handleGetCurrentLocation}
                    disabled={isGettingLocation}
                    variant="outline"
                    className="border-green-600 text-green-700 hover:bg-green-50 flex-1"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    {isGettingLocation ? 'Getting Location...' : 'Use My Location'}
                  </Button>

                  {(searchLat || searchLng || searchedLocation) && (
                    <Button
                      onClick={handleClearSearch}
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>💡 Tip:</strong> Click "Use My Location" to automatically fill in your current GPS coordinates, 
                    or manually enter coordinates to find trees planted in specific locations.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tree Map */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-6 h-6 text-blue-600" />
                  Tree Planting Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-stone mb-4">
                  Explore the GPS-tracked locations where your trees are planted. 
                  Click on markers to see details about each planting site.
                  {searchedLocation && (
                    <span className="block mt-2 text-blue-600 font-semibold">
                      📍 Showing searched location on map
                    </span>
                  )}
                </p>
                <TreeMapWrapper 
                  locations={stats.locations}
                  mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''}
                  searchedLocation={searchedLocation}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {stats && stats.locations.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-orange-600" />
                  Planting Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.locations.map((location: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-parchment rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Trees className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-forest">
                            {location.location_name}
                          </h4>
                          <p className="text-sm text-stone">
                            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {location.trees}
                        </div>
                        <div className="text-xs text-stone">trees</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {stats && stats.total_trees_planted === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card>
              <CardContent className="p-12 text-center">
                <Trees className="w-16 h-16 text-forest/40 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-forest mb-2">
                  Start Making an Impact
                </h3>
                <p className="text-stone mb-6">
                  Create events and collect reviews to start planting trees.
                  Every review contributes to reforestation efforts!
                </p>
                <Button onClick={() => window.location.href = '/trips'} className="bg-forest hover:bg-forest-light text-white">
                  Create Your First Event
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ImpactSkeleton() {
  return (
    <div className="min-h-screen bg-parchment py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div {...animationPresets.fadeIn}>
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-8" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                    <div className="w-16 h-6 bg-gray-200 rounded" />
                  </div>
                  <div className="h-8 w-20 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function ImpactError({ error }: { error: any }) {
  return (
    <div className="min-h-screen bg-parchment py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trees className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-red-600 mb-2">Failed to Load Impact Data</h3>
            <p className="text-stone mb-6">{error.message}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
