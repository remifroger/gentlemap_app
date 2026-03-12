import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as LucideIcons from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Place, Category } from '../types';

interface MapViewProps {
  places: Place[];
  onPlaceClick: (place: Place) => void;
  categories: Category[];
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  setSelectedSubcategoryId: (id: string | null) => void;
  priceFilter: string;
  setPriceFilter: (p: string) => void;
  ratingFilter: string;
  setRatingFilter: (r: string) => void;
  mapCenter: [number, number] | null;
}

const MapView: React.FC<MapViewProps> = ({ 
  places, 
  onPlaceClick, 
  categories, 
  selectedCategoryId, 
  selectedSubcategoryId, 
  setSelectedSubcategoryId,
  priceFilter,
  setPriceFilter,
  ratingFilter,
  setRatingFilter,
  mapCenter
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const searchMarkerRef = useRef<L.Marker | null>(null);
  const userLocationRef = useRef<{ marker: L.Marker, circle: L.Circle } | null>(null);

  const createCustomIcon = (category: Category | undefined, place: Place) => {
    const color = category?.color || '#5A5A5A';
    const iconName = category?.icon || 'map-pin';
    const Icon = (LucideIcons as any)[iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())] || LucideIcons.MapPin;
    
    const isFeatured = !!place.is_featured;
    
    const html = renderToStaticMarkup(
      <div className={`custom-marker-container ${isFeatured ? 'featured-marker' : ''}`} style={{
        backgroundColor: isFeatured ? '#0047AB' : 'white',
        padding: isFeatured ? '0 8px' : '0',
        width: isFeatured ? 'max-content' : '32px',
        height: isFeatured ? '32px' : '32px',
        borderRadius: isFeatured ? '4px' : '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isFeatured ? '6px' : '0',
        color: isFeatured ? 'white' : 'black',
        boxShadow: isFeatured ? '0 4px 12px rgba(0, 71, 171, 0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
        border: isFeatured ? '1.5px solid white' : '1px solid black',
        position: 'relative',
        whiteSpace: 'nowrap',
        transform: isFeatured ? 'translateX(-50%) translateY(-100%)' : 'none'
      }}>
        <Icon size={isFeatured ? 14 : 16} strokeWidth={2} />
        {isFeatured && (
          <span className="text-[9px] uppercase tracking-wider font-bold pr-1">
            {place.name}
          </span>
        )}
      </div>
    );

    return L.divIcon({
      html,
      className: 'custom-div-icon',
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
  };

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map', { zoomControl: false }).setView([48.8566, 2.3522], 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO'
      }).addTo(mapRef.current);
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add new markers
    places.forEach(place => {
      const category = categories.find(c => c.id === place.category_id);
      const marker = L.marker([place.lat, place.lng], {
        icon: createCustomIcon(category, place),
        zIndexOffset: place.is_featured ? 1000 : 0
      }).addTo(mapRef.current!);
      
      marker.on('click', () => onPlaceClick(place));
      markersRef.current.push(marker);
    });

    if (places.length > 0) {
      const group = L.featureGroup(markersRef.current);
      mapRef.current.fitBounds(group.getBounds().pad(0.2));
    }
  }, [places, onPlaceClick, categories]);

  useEffect(() => {
    if (mapRef.current && mapCenter) {
      // Remove previous search marker
      if (searchMarkerRef.current) {
        searchMarkerRef.current.remove();
      }

      // Add discrete search marker
      const searchIcon = L.divIcon({
        html: renderToStaticMarkup(
          <div className="w-4 h-4 bg-premium border-2 border-white rounded-full shadow-lg" />
        ),
        className: '',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      searchMarkerRef.current = L.marker(mapCenter, { 
        icon: searchIcon,
        zIndexOffset: 2000 // Higher than featured markers (1000)
      }).addTo(mapRef.current);

      mapRef.current.flyTo(mapCenter, 16, {
        duration: 1.5
      });
    }
  }, [mapCenter]);

  useEffect(() => {
    if (!mapRef.current) return;

    let watchId: number;

    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const latlng = L.latLng(latitude, longitude);

          if (!userLocationRef.current) {
            const marker = L.marker(latlng, {
              icon: L.divIcon({
                html: renderToStaticMarkup(
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md z-10" />
                    <div className="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping" />
                  </div>
                ),
                className: '',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
              })
            }).addTo(mapRef.current!);

            const circle = L.circle(latlng, {
              radius: accuracy,
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.1,
              weight: 1
            }).addTo(mapRef.current!);

            userLocationRef.current = { marker, circle };
          } else {
            userLocationRef.current.marker.setLatLng(latlng);
            userLocationRef.current.circle.setLatLng(latlng);
            userLocationRef.current.circle.setRadius(accuracy);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const subcategories = categories.filter(c => c.parent_id === selectedCategoryId);

  return (
    <div className="w-full h-full relative">
      <div id="map" className="w-full h-full z-0"></div>
      
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 flex gap-0 bg-white shadow-2xl border border-border overflow-hidden rounded-full">
        {subcategories.length > 0 && (
          <select 
            className="px-6 py-3 text-[9px] font-bold uppercase tracking-[0.2em] bg-transparent border-r border-border outline-none cursor-pointer hover:bg-stone-50 transition-colors appearance-none"
            value={selectedSubcategoryId || ''}
            onChange={(e) => setSelectedSubcategoryId(e.target.value || null)}
          >
            <option value="">Spécialité</option>
            {subcategories.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        )}
        
        <select 
          className="px-6 py-3 text-[9px] font-bold uppercase tracking-[0.2em] bg-transparent border-r border-border outline-none cursor-pointer hover:bg-stone-50 transition-colors appearance-none"
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
        >
          <option value="">Prix</option>
          <option value="1">€</option>
          <option value="2">€€</option>
          <option value="3">€€€</option>
          <option value="4">€€€€</option>
        </select>

        <select 
          className="px-6 py-3 text-[9px] font-bold uppercase tracking-[0.2em] bg-transparent outline-none cursor-pointer hover:bg-stone-50 transition-colors appearance-none"
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
        >
          <option value="">Note</option>
          <option value="7">7+</option>
          <option value="8">8+</option>
          <option value="9">9+</option>
        </select>
      </div>

      <button
        onClick={() => {
          if (userLocationRef.current && mapRef.current) {
            mapRef.current.flyTo(userLocationRef.current.marker.getLatLng(), 15);
          }
        }}
        className="absolute bottom-4 left-4 z-10 p-4 bg-white border border-border shadow-xl hover:bg-stone-50 transition-all rounded-full"
        title="Ma position"
      >
        <LucideIcons.Navigation className="w-4 h-4 text-ink" />
      </button>
    </div>
  );
};

export default MapView;
