'use client';

import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string; district?: string; province?: string }) => void;
  initialLocation?: { lat: number; lng: number };
  className?: string;
}

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px'
};

// Default center to Sri Lanka (Colombo)
const defaultCenter = {
  lat: 6.9271,
  lng: 79.8612
};

const libraries: ("places")[] = ["places"];

export default function LocationPicker({ onLocationSelect, initialLocation, className = '' }: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [address, setAddress] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: libraries
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results) {
            resolve(results);
          } else {
            reject(new Error('Geocoding failed'));
          }
        });
      });

      if (result && result.length > 0) {
        const addressComponents = result[0].address_components;
        const formattedAddress = result[0].formatted_address;
        
        // Extract district and province from address components
        let district = '';
        let province = '';
        
        addressComponents.forEach((component) => {
          if (component.types.includes('administrative_area_level_2')) {
            district = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            province = component.long_name;
          }
        });

        setAddress(formattedAddress);
        onLocationSelect({
          lat,
          lng,
          address: formattedAddress,
          district,
          province
        });
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setAddress('Unable to get address');
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      setSelectedLocation({ lat, lng });
      reverseGeocode(lat, lng);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setSelectedLocation({ lat, lng });
          reverseGeocode(lat, lng);
          
          // Center map on current location
          if (mapRef.current) {
            mapRef.current.panTo({ lat, lng });
            mapRef.current.setZoom(15);
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
          alert('Unable to get your current location. Please select a location on the map.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  if (loadError) {
    return (
      <div className={`bg-red-500/10 border border-red-500/20 rounded-lg p-4 ${className}`}>
        <p className="text-red-400 text-sm">Error loading Google Maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center justify-center ${className}`}>
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          Loading map...
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-300">
            Select Your Location
          </label>
          <button
            type="button"
            onClick={getCurrentLocation}
            className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full transition-colors"
          >
            Use Current Location
          </button>
        </div>

        <div className="relative">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={selectedLocation || defaultCenter}
            zoom={selectedLocation ? 15 : 8}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleMapClick}
            options={{
              styles: [
                {
                  elementType: "geometry",
                  stylers: [{ color: "#1f2937" }]
                },
                {
                  elementType: "labels.text.stroke",
                  stylers: [{ color: "#1f2937" }]
                },
                {
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#9ca3af" }]
                },
                {
                  featureType: "administrative.locality",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#d1d5db" }]
                },
                {
                  featureType: "poi",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#9ca3af" }]
                },
                {
                  featureType: "poi.park",
                  elementType: "geometry",
                  stylers: [{ color: "#059669" }]
                },
                {
                  featureType: "poi.park",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#10b981" }]
                },
                {
                  featureType: "road",
                  elementType: "geometry",
                  stylers: [{ color: "#374151" }]
                },
                {
                  featureType: "road",
                  elementType: "geometry.stroke",
                  stylers: [{ color: "#4b5563" }]
                },
                {
                  featureType: "road",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#9ca3af" }]
                },
                {
                  featureType: "road.highway",
                  elementType: "geometry",
                  stylers: [{ color: "#374151" }]
                },
                {
                  featureType: "road.highway",
                  elementType: "geometry.stroke",
                  stylers: [{ color: "#4b5563" }]
                },
                {
                  featureType: "road.highway",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#d1d5db" }]
                },
                {
                  featureType: "transit",
                  elementType: "geometry",
                  stylers: [{ color: "#374151" }]
                },
                {
                  featureType: "transit.station",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#9ca3af" }]
                },
                {
                  featureType: "water",
                  elementType: "geometry",
                  stylers: [{ color: "#0f172a" }]
                },
                {
                  featureType: "water",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#9ca3af" }]
                },
                {
                  featureType: "water",
                  elementType: "labels.text.stroke",
                  stylers: [{ color: "#0f172a" }]
                }
              ]
            }}
          >
            {selectedLocation && (
              <Marker
                position={selectedLocation}
                icon={{
                  url: "data:image/svg+xml," + encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="12" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
                      <circle cx="16" cy="16" r="4" fill="#ffffff"/>
                    </svg>
                  `),
                  scaledSize: new google.maps.Size(32, 32),
                  anchor: new google.maps.Point(16, 16)
                }}
              />
            )}
          </GoogleMap>
        </div>

        {selectedLocation && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
            <div className="text-sm text-gray-300 mb-1">Selected Location:</div>
            {isLoadingAddress ? (
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                Getting address...
              </div>
            ) : (
              <div className="text-sm text-white">{address || 'Address not available'}</div>
            )}
            <div className="text-xs text-gray-400 mt-1">
              Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400">
          Click on the map to select your location, or use the "Use Current Location" button to automatically detect your position.
        </p>
      </div>
    </div>
  );
}
