'use client';

import { useState, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  MapPin, 
  Navigation, 
  Activity, 
  Clock, 
  TrendingUp,
  Mountain,
  Compass,
  Play,
  Square,
  RotateCcw,
  Download,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface RoutePoint {
  lng: number;
  lat: number;
  timestamp: number;
  elevation?: number;
}

interface RouteStats {
  distance: number; // in kilometers
  duration: number; // in seconds
  avgSpeed: number; // km/h
  maxSpeed: number; // km/h
  elevationGain: number; // meters
  startTime: Date;
  endTime?: Date;
}

export default function TrackSafariPage() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const [isTracking, setIsTracking] = useState(false);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [stats, setStats] = useState<RouteStats | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');
  const [currentDuration, setCurrentDuration] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Marker refs
  const startMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const currentMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Local storage keys
  const STORAGE_KEYS = {
    ROUTE_POINTS: 'safari_track_route_points',
    IS_TRACKING: 'safari_track_is_tracking',
    START_TIME: 'safari_track_start_time',
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    // Initialize map centered on Tanzania
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [35.7516, -6.3690], // Tanzania center
      zoom: 6,
    });

    // Add navigation controls
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add scale
    mapRef.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    mapRef.current.on('load', () => {
      setMapLoaded(true);
      
      // Add route source
      mapRef.current!.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });

      // Add route layer (the line showing the path)
      mapRef.current!.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3B82F6', // Blue color like Google Maps
          'line-width': 5,
          'line-opacity': 0.8
        }
      });

      // Add route outline for better visibility
      mapRef.current!.addLayer({
        id: 'route-outline',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#1E40AF', // Darker blue for outline
          'line-width': 7,
          'line-opacity': 0.4
        }
      }, 'route'); // Place outline below the main route
    });

    // Handle window resize for responsive map
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mapRef.current) {
        // Remove markers
        if (startMarkerRef.current) {
          startMarkerRef.current.remove();
          startMarkerRef.current = null;
        }
        if (currentMarkerRef.current) {
          currentMarkerRef.current.remove();
          currentMarkerRef.current = null;
        }
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Check geolocation permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      if (!navigator.geolocation) {
        setErrorMessage('Geolocation is not supported by your browser');
        return;
      }

      // Check if we're on a secure context
      if (typeof window !== 'undefined') {
        const isSecure = window.isSecureContext;
        if (!isSecure) {
          setErrorMessage('Location tracking requires HTTPS. Please access this page via a secure connection.');
          return;
        }
      }

      // Check permission state if available
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          setPermissionState(result.state);
          
          // Listen for permission changes
          result.addEventListener('change', () => {
            setPermissionState(result.state);
          });

          if (result.state === 'denied') {
            setErrorMessage('Location access is denied. Please enable it in your browser settings.');
          }
        } catch (error) {
          console.log('Permission API not fully supported, will check on tracking start');
        }
      }
    };

    checkPermission();

    // Cleanup on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (startMarkerRef.current) {
        startMarkerRef.current.remove();
      }
      if (currentMarkerRef.current) {
        currentMarkerRef.current.remove();
      }
    };
  }, []);

  // Restore tracking state from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedRoutePoints = localStorage.getItem(STORAGE_KEYS.ROUTE_POINTS);
    const savedIsTracking = localStorage.getItem(STORAGE_KEYS.IS_TRACKING);
    const savedStartTime = localStorage.getItem(STORAGE_KEYS.START_TIME);

    if (savedRoutePoints) {
      try {
        const points = JSON.parse(savedRoutePoints) as RoutePoint[];
        if (points.length > 0) {
          console.log(`Restoring ${points.length} saved route points`);
          setRoutePoints(points);
          
          // Calculate stats from saved points
          const restoredStats = calculateStats(points);
          setStats(restoredStats);

          // Restore map view and markers when map is loaded
          if (mapLoaded && mapRef.current) {
            restoreMapState(points);
          }
        }
      } catch (error) {
        console.error('Error restoring route points:', error);
      }
    }

    if (savedIsTracking === 'true' && savedStartTime) {
      console.log('Resuming tracking session...');
      startTimeRef.current = parseInt(savedStartTime);
      
      // Calculate elapsed time
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setCurrentDuration(elapsed);
      
      // Resume tracking
      resumeTracking();
    }
  }, [mapLoaded]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (routePoints.length > 0) {
      localStorage.setItem(STORAGE_KEYS.ROUTE_POINTS, JSON.stringify(routePoints));
    }
  }, [routePoints]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.IS_TRACKING, isTracking.toString());
  }, [isTracking]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (startTimeRef.current) {
      localStorage.setItem(STORAGE_KEYS.START_TIME, startTimeRef.current.toString());
    }
  }, [startTimeRef.current]);

  // Handle page visibility change (background/foreground)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('Page hidden - tracking continues in background');
      } else {
        console.log('Page visible - resuming UI updates');
        // Recalculate duration when coming back
        if (isTracking && startTimeRef.current) {
          const elapsed = (Date.now() - startTimeRef.current) / 1000;
          setCurrentDuration(elapsed);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTracking]);

  // Restore map state (route line and markers)
  const restoreMapState = (points: RoutePoint[]) => {
    if (!mapRef.current || !mapLoaded) return;

    const coordinates = points.map(p => [p.lng, p.lat]);

    // Restore route line
    (mapRef.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates
      }
    });

    // Restore start marker
    if (points.length > 0) {
      const startPoint = points[0];
      const startEl = document.createElement('div');
      startEl.className = 'start-marker';
      startEl.style.width = '32px';
      startEl.style.height = '32px';
      startEl.style.borderRadius = '50%';
      startEl.style.backgroundColor = '#10B981';
      startEl.style.border = '4px solid white';
      startEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      
      const startText = document.createElement('div');
      startText.textContent = 'S';
      startText.style.color = 'white';
      startText.style.fontWeight = 'bold';
      startText.style.fontSize = '16px';
      startText.style.display = 'flex';
      startText.style.alignItems = 'center';
      startText.style.justifyContent = 'center';
      startText.style.height = '100%';
      startEl.appendChild(startText);
      
      startMarkerRef.current = new mapboxgl.Marker({ element: startEl })
        .setLngLat([startPoint.lng, startPoint.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div style="padding: 8px;">
            <strong style="color: #10B981;">Start Point</strong><br/>
            <small>${new Date(startPoint.timestamp).toLocaleTimeString()}</small>
          </div>`
        ))
        .addTo(mapRef.current);

      // Restore current position marker
      const lastPoint = points[points.length - 1];
      const currentEl = document.createElement('div');
      currentEl.className = 'current-marker';
      currentEl.style.width = '24px';
      currentEl.style.height = '24px';
      currentEl.style.borderRadius = '50%';
      currentEl.style.backgroundColor = '#3B82F6';
      currentEl.style.border = '4px solid white';
      currentEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      currentEl.style.animation = 'pulse 2s infinite';
      
      currentMarkerRef.current = new mapboxgl.Marker({ element: currentEl })
        .setLngLat([lastPoint.lng, lastPoint.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div style="padding: 8px;">
            <strong style="color: #3B82F6;">Current Position</strong><br/>
            <small>Tracking in progress...</small>
          </div>`
        ))
        .addTo(mapRef.current);

      // Fit map to show entire route
      const bounds = new mapboxgl.LngLatBounds();
      points.forEach(p => bounds.extend([p.lng, p.lat]));
      mapRef.current.fitBounds(bounds, { padding: 50 });
    }
  };

  // Resume tracking after page reload
  const resumeTracking = () => {
    if (!navigator.geolocation) return;

    setIsTracking(true);

    // Start duration timer
    durationIntervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setCurrentDuration(elapsed);
      }
    }, 1000);

    console.log('Resuming geolocation tracking...');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPoint: RoutePoint = {
          lng: position.coords.longitude,
          lat: position.coords.latitude,
          timestamp: Date.now(),
          elevation: position.coords.altitude || undefined,
        };

        setRoutePoints(prev => {
          const updated = [...prev, newPoint];
          updateMapWithNewPoint(updated, newPoint);
          const newStats = calculateStats(updated);
          setStats(newStats);
          return updated;
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        stopTracking();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
      }
    );
  };

  // Helper function to update map with new point
  const updateMapWithNewPoint = (updated: RoutePoint[], newPoint: RoutePoint) => {
    if (!mapRef.current || !mapLoaded) return;

    const coordinates = updated.map(p => [p.lng, p.lat]);

    // Update current position marker
    if (currentMarkerRef.current) {
      currentMarkerRef.current.setLngLat([newPoint.lng, newPoint.lat]);
    }

    // Update route line
    (mapRef.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates
      }
    });

    // Pan to current position
    mapRef.current.panTo([newPoint.lng, newPoint.lat], {
      duration: 1000
    });
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calculate route statistics
  const calculateStats = (points: RoutePoint[]): RouteStats => {
    if (points.length < 2) {
      return {
        distance: 0,
        duration: 0,
        avgSpeed: 0,
        maxSpeed: 0,
        elevationGain: 0,
        startTime: new Date(),
      };
    }

    let totalDistance = 0;
    let maxSpeed = 0;
    let elevationGain = 0;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      
      // Calculate distance
      const segmentDistance = calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
      totalDistance += segmentDistance;

      // Calculate speed for this segment
      const timeDiff = (curr.timestamp - prev.timestamp) / 1000 / 3600; // hours
      if (timeDiff > 0) {
        const speed = segmentDistance / timeDiff;
        maxSpeed = Math.max(maxSpeed, speed);
      }

      // Calculate elevation gain
      if (prev.elevation && curr.elevation && curr.elevation > prev.elevation) {
        elevationGain += curr.elevation - prev.elevation;
      }
    }

    const duration = (points[points.length - 1].timestamp - points[0].timestamp) / 1000;
    const avgSpeed = duration > 0 ? (totalDistance / (duration / 3600)) : 0;

    return {
      distance: totalDistance,
      duration,
      avgSpeed,
      maxSpeed,
      elevationGain,
      startTime: new Date(points[0].timestamp),
      endTime: new Date(points[points.length - 1].timestamp),
    };
  };

  // Start tracking
  const startTracking = () => {
    // Clear any previous error
    setErrorMessage(null);

    if (!navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser. Please use a modern browser like Chrome, Firefox, or Safari.';
      setErrorMessage(msg);
      alert(msg);
      return;
    }

    // Check if we're on HTTPS or localhost (required for geolocation)
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      const msg = 'Location tracking requires a secure connection (HTTPS). Please access this page via HTTPS.';
      setErrorMessage(msg);
      alert(msg);
      return;
    }

    // Check if permission is already denied
    if (permissionState === 'denied') {
      const msg = 'Location access is denied. Please enable it in your browser settings and reload the page.';
      setErrorMessage(msg);
      alert(msg);
      return;
    }

    setIsTracking(true);
    setRoutePoints([]);
    setStats(null);
    setCurrentDuration(0);
    startTimeRef.current = Date.now();

    // Start duration timer
    durationIntervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setCurrentDuration(elapsed);
      }
    }, 1000); // Update every second

    console.log('Starting geolocation tracking...');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        console.log('Position received:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          speed: position.coords.speed
        });
        
        const newPoint: RoutePoint = {
          lng: position.coords.longitude,
          lat: position.coords.latitude,
          timestamp: Date.now(),
          elevation: position.coords.altitude || undefined,
        };

        setRoutePoints(prev => {
          const updated = [...prev, newPoint];
          
          console.log(`Total points: ${updated.length}`);
          
          // Update map
          if (mapRef.current && mapLoaded) {
            const coordinates = updated.map(p => [p.lng, p.lat]);
            
            // Add start marker (green) on first point
            if (updated.length === 1) {
              // Create custom start marker element
              const startEl = document.createElement('div');
              startEl.className = 'start-marker';
              startEl.style.width = '32px';
              startEl.style.height = '32px';
              startEl.style.borderRadius = '50%';
              startEl.style.backgroundColor = '#10B981'; // Green
              startEl.style.border = '4px solid white';
              startEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
              startEl.style.cursor = 'pointer';
              
              // Add "S" text for Start
              const startText = document.createElement('div');
              startText.textContent = 'S';
              startText.style.color = 'white';
              startText.style.fontWeight = 'bold';
              startText.style.fontSize = '16px';
              startText.style.display = 'flex';
              startText.style.alignItems = 'center';
              startText.style.justifyContent = 'center';
              startText.style.height = '100%';
              startEl.appendChild(startText);
              
              startMarkerRef.current = new mapboxgl.Marker({ element: startEl })
                .setLngLat([newPoint.lng, newPoint.lat])
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(
                  `<div style="padding: 8px;">
                    <strong style="color: #10B981;">Start Point</strong><br/>
                    <small>${new Date(newPoint.timestamp).toLocaleTimeString()}</small>
                  </div>`
                ))
                .addTo(mapRef.current);
            }
            
            // Update or create current position marker (blue, pulsing)
            if (currentMarkerRef.current) {
              currentMarkerRef.current.setLngLat([newPoint.lng, newPoint.lat]);
            } else {
              // Create custom current position marker element
              const currentEl = document.createElement('div');
              currentEl.className = 'current-marker';
              currentEl.style.width = '24px';
              currentEl.style.height = '24px';
              currentEl.style.borderRadius = '50%';
              currentEl.style.backgroundColor = '#3B82F6'; // Blue
              currentEl.style.border = '4px solid white';
              currentEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
              currentEl.style.cursor = 'pointer';
              currentEl.style.animation = 'pulse 2s infinite';
              
              // Add pulsing animation
              const style = document.createElement('style');
              style.textContent = `
                @keyframes pulse {
                  0% {
                    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
                  }
                  70% {
                    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
                  }
                  100% {
                    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
                  }
                }
              `;
              document.head.appendChild(style);
              
              currentMarkerRef.current = new mapboxgl.Marker({ element: currentEl })
                .setLngLat([newPoint.lng, newPoint.lat])
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(
                  `<div style="padding: 8px;">
                    <strong style="color: #3B82F6;">Current Position</strong><br/>
                    <small>Tracking in progress...</small>
                  </div>`
                ))
                .addTo(mapRef.current);
            }
            
            // Update route line
            (mapRef.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates
              }
            });

            // Center map on current position (only for first few points)
            if (updated.length <= 3) {
              mapRef.current.flyTo({
                center: [newPoint.lng, newPoint.lat],
                zoom: 16,
                essential: true
              });
            } else {
              // Just pan to keep current position visible
              mapRef.current.panTo([newPoint.lng, newPoint.lat], {
                duration: 1000
              });
            }
          }

          // Calculate stats
          const newStats = calculateStats(updated);
          setStats(newStats);
          
          console.log('Stats:', {
            distance: newStats.distance.toFixed(3) + ' km',
            duration: newStats.duration.toFixed(0) + ' seconds',
            avgSpeed: newStats.avgSpeed.toFixed(2) + ' km/h',
            maxSpeed: newStats.maxSpeed.toFixed(2) + ' km/h',
            points: updated.length
          });

          return updated;
        });
      },
      (error) => {
        console.error('Geolocation error details:', {
          code: error.code,
          message: error.message,
          PERMISSION_DENIED: error.PERMISSION_DENIED,
          POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
          TIMEOUT: error.TIMEOUT
        });
        
        let errorMessage = 'Error getting your location. ';
        
        // Handle different error codes
        if (error.code === 1 || error.code === error.PERMISSION_DENIED) {
          errorMessage += 'Please allow location access in your browser settings.';
          setPermissionState('denied');
        } else if (error.code === 2 || error.code === error.POSITION_UNAVAILABLE) {
          errorMessage += 'Location information is unavailable. Please check your GPS and try again.';
        } else if (error.code === 3 || error.code === error.TIMEOUT) {
          errorMessage += 'Location request timed out. Please try again.';
        } else {
          errorMessage += 'An unknown error occurred. Please enable location services and try again.';
        }
        
        setErrorMessage(errorMessage);
        alert(errorMessage);
        stopTracking();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000 // Increased timeout to 10 seconds
      }
    );
  };

  // Stop tracking
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    setIsTracking(false);
    startTimeRef.current = null;
  };

  // Reset tracking
  const resetTracking = () => {
    stopTracking();
    setRoutePoints([]);
    setStats(null);
    setCurrentDuration(0);
    setErrorMessage(null);
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ROUTE_POINTS);
      localStorage.removeItem(STORAGE_KEYS.IS_TRACKING);
      localStorage.removeItem(STORAGE_KEYS.START_TIME);
    }
    
    // Remove markers
    if (startMarkerRef.current) {
      startMarkerRef.current.remove();
      startMarkerRef.current = null;
    }
    if (currentMarkerRef.current) {
      currentMarkerRef.current.remove();
      currentMarkerRef.current = null;
    }
    
    if (mapRef.current && mapLoaded) {
      (mapRef.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: []
        }
      });
      
      // Reset map view to Tanzania
      mapRef.current.flyTo({
        center: [35.7516, -6.3690],
        zoom: 6,
        essential: true
      });
    }
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Export route data
  const exportRoute = () => {
    if (routePoints.length === 0) return;

    const data = {
      route: routePoints,
      stats: stats,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `safari-route-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-parchment to-white">
      {/* Header */}
      <header className="bg-forest text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-savanna flex items-center justify-center">
              <img src="/logo.png" alt="SafariWrap" className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">SafariWrap</h1>
              <p className="text-xs text-white/70">Track Your Safari</p>
            </div>
          </Link>
          <Link href="/">
            <Button variant="outline" className="text-white border-white hover:bg-white/10">
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Title */}
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-forest mb-2">
            🗺️ Track Your Safari Route
          </h2>
          <p className="text-stone text-lg">
            Record your safari journey in real-time and see your route, distance, and statistics
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-1">Location Error</p>
                  <p className="text-sm text-red-700">{errorMessage}</p>
                  {permissionState === 'denied' && (
                    <div className="mt-2 text-xs text-red-600">
                      <p className="font-semibold mb-1">How to fix:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Click the lock icon in your browser's address bar</li>
                        <li>Find "Location" permissions</li>
                        <li>Change it to "Allow"</li>
                        <li>Reload this page</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resume Notification */}
        {routePoints.length > 0 && !isTracking && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-800 mb-1">Previous Session Found</p>
                  <p className="text-sm text-blue-700 mb-2">
                    We found a previous tracking session with {routePoints.length} points. 
                    You can continue tracking or start fresh.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={startTracking}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Continue Tracking
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={resetTracking}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      Start Fresh
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Permission Status - Only show if denied or prompt */}
        {(permissionState === 'denied' || permissionState === 'prompt') && (
          <Card className={`mb-6 ${
            permissionState === 'denied' ? 'bg-red-50 border-red-200' :
            'bg-yellow-50 border-yellow-200'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className={`w-5 h-5 ${
                  permissionState === 'denied' ? 'text-red-600' :
                  'text-yellow-600'
                }`} />
                <span className={`text-sm font-semibold ${
                  permissionState === 'denied' ? 'text-red-800' :
                  'text-yellow-800'
                }`}>
                  Location Permission: {permissionState.charAt(0).toUpperCase() + permissionState.slice(1)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        {(stats || isTracking) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Navigation className="w-5 h-5 text-savanna" />
                  <span className="text-xs text-stone font-semibold">Distance</span>
                </div>
                <p className="text-2xl font-bold text-forest">
                  {stats ? stats.distance.toFixed(2) : '0.00'} km
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-xs text-stone font-semibold">Duration</span>
                </div>
                <p className="text-2xl font-bold text-forest">
                  {formatDuration(isTracking ? currentDuration : (stats?.duration || 0))}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  <span className="text-xs text-stone font-semibold">Avg Speed</span>
                </div>
                <p className="text-2xl font-bold text-forest">
                  {stats ? stats.avgSpeed.toFixed(1) : '0.0'} km/h
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <span className="text-xs text-stone font-semibold">Max Speed</span>
                </div>
                <p className="text-2xl font-bold text-forest">
                  {stats ? stats.maxSpeed.toFixed(1) : '0.0'} km/h
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Map and Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Map */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div 
                  ref={mapContainerRef}
                  className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] rounded-lg"
                />
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="space-y-4 order-1 lg:order-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="w-5 h-5" />
                  Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!isTracking ? (
                  <Button 
                    onClick={startTracking}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Tracking
                  </Button>
                ) : (
                  <Button 
                    onClick={stopTracking}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop Tracking
                  </Button>
                )}

                <Button 
                  onClick={resetTracking}
                  variant="outline"
                  className="w-full"
                  disabled={routePoints.length === 0}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>

                <Button 
                  onClick={exportRoute}
                  variant="outline"
                  className="w-full"
                  disabled={routePoints.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Route
                </Button>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-stone">Tracking:</span>
                    <Badge variant={isTracking ? "default" : "secondary"}>
                      {isTracking ? 'Active' : 'Stopped'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone">Points:</span>
                    <span className="font-bold text-forest">{routePoints.length}</span>
                  </div>
                  {stats && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-stone">Start:</span>
                        <span className="font-mono text-xs">
                          {stats.startTime.toLocaleTimeString()}
                        </span>
                      </div>
                      {stats.endTime && (
                        <div className="flex items-center justify-between">
                          <span className="text-stone">End:</span>
                          <span className="font-mono text-xs">
                            {stats.endTime.toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <p className="text-xs text-blue-700 mb-2">
                  <strong>📍 How to use:</strong>
                </p>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Click "Start Tracking" to begin</li>
                  <li>Allow location access when prompted</li>
                  <li>Your route will appear on the map</li>
                  <li>Click "Stop" when finished</li>
                  <li>Export your route data as JSON</li>
                </ul>
                <p className="text-xs text-blue-600 mt-3 italic">
                  Note: Location tracking requires HTTPS and browser permission.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
