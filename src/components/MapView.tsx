import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Style, Icon as OlIcon, Circle as OlCircle, Fill, Stroke } from 'ol/style';
import Overlay from 'ol/Overlay';
import { Zoom } from 'ol/control';
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
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource>(new VectorSource());
  const overlaysRef = useRef<Overlay[]>([]);
  const userLocationOverlayRef = useRef<Overlay | null>(null);
  const searchMarkerOverlayRef = useRef<Overlay | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapElement.current) return;

    const map = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            attributions: '&copy; CARTO'
          })
        })
      ],
      view: new View({
        center: fromLonLat([2.3522, 48.8566]),
        zoom: 13
      }),
      controls: [
        new Zoom({
          className: 'custom-zoom-controls'
        })
      ]
    });

    mapRef.current = map;

    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current
    });
    map.addLayer(vectorLayer);

    map.on('click', (event) => {
      map.forEachFeatureAtPixel(event.pixel, (feature) => {
        const place = feature.get('place');
        if (place) {
          onPlaceClick(place);
          return true;
        }
      });
    });

    // Force resize check
    setTimeout(() => {
      map.updateSize();
    }, 100);

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  // Handle Places and Markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing overlays and features
    overlaysRef.current.forEach(overlay => mapRef.current?.removeOverlay(overlay));
    overlaysRef.current = [];
    vectorSourceRef.current.clear();

    places.forEach(place => {
      const lat = Number(place.lat);
      const lng = Number(place.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      const coords = fromLonLat([lng, lat]);
      const category = categories.find(c => c.id === place.category_id);
      const iconName = category?.icon || 'map-pin';
      const Icon = (LucideIcons as any)[iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())] || LucideIcons.MapPin;
      
      if (place.is_featured) {
        const container = document.createElement('div');
        container.className = 'custom-marker-wrapper';
        
        container.innerHTML = renderToStaticMarkup(
          <div className="featured-marker flex items-center gap-2 bg-premium text-white px-3 py-1.5 rounded-md border-2 border-white shadow-lg whitespace-nowrap cursor-pointer">
            <Icon size={14} strokeWidth={2} />
            <span className="text-[9px] uppercase tracking-wider font-bold">
              {place.name}
            </span>
          </div>
        );

        container.onclick = (e) => {
          e.stopPropagation();
          onPlaceClick(place);
        };

        const overlay = new Overlay({
          position: coords,
          element: container,
          stopEvent: true,
          positioning: 'bottom-center'
        });

        mapRef.current?.addOverlay(overlay);
        overlaysRef.current.push(overlay);
      } else {
        const color = category?.color || '#5A5A5A';
        const container = document.createElement('div');
        container.className = 'custom-marker-wrapper';
        
        container.innerHTML = renderToStaticMarkup(
          <div className="w-8 h-8 bg-white border border-black rounded-full flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform">
             <Icon size={14} strokeWidth={2} style={{ color }} />
          </div>
        );

        container.onclick = (e) => {
          e.stopPropagation();
          onPlaceClick(place);
        };

        const overlay = new Overlay({
          position: coords,
          element: container,
          stopEvent: true,
          positioning: 'center-center'
        });

        mapRef.current?.addOverlay(overlay);
        overlaysRef.current.push(overlay);
      }
    });

    if (places.length > 0) {
      const lats = places.map(p => Number(p.lat));
      const lngs = places.map(p => Number(p.lng));
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      const min = fromLonLat([minLng, minLat]);
      const max = fromLonLat([maxLng, maxLat]);
      
      mapRef.current.getView().fit([min[0], min[1], max[0], max[1]], {
        padding: [100, 100, 100, 100],
        duration: 1000
      });
    }
  }, [places, onPlaceClick, categories]);

  // Handle Map Center (Search)
  useEffect(() => {
    if (mapRef.current && mapCenter) {
      const coords = fromLonLat([mapCenter[1], mapCenter[0]]);

      if (searchMarkerOverlayRef.current) {
        mapRef.current.removeOverlay(searchMarkerOverlayRef.current);
      }

      const container = document.createElement('div');
      container.innerHTML = renderToStaticMarkup(
        <div className="w-4 h-4 bg-premium border-2 border-white rounded-full shadow-lg" />
      );

      const overlay = new Overlay({
        position: coords,
        element: container,
        positioning: 'center-center'
      });

      mapRef.current.addOverlay(overlay);
      searchMarkerOverlayRef.current = overlay;

      mapRef.current.getView().animate({
        center: coords,
        zoom: 16,
        duration: 1500
      });
    }
  }, [mapCenter]);

  // Handle Geolocation
  useEffect(() => {
    if (!mapRef.current) return;

    let watchId: number;

    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const coords = fromLonLat([longitude, latitude]);

          if (!userLocationOverlayRef.current) {
            const container = document.createElement('div');
            container.innerHTML = renderToStaticMarkup(
              <div className="relative flex items-center justify-center">
                <div className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md z-10" />
                <div className="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping" />
              </div>
            );

            const overlay = new Overlay({
              position: coords,
              element: container,
              positioning: 'center-center'
            });

            mapRef.current?.addOverlay(overlay);
            userLocationOverlayRef.current = overlay;
          } else {
            userLocationOverlayRef.current.setPosition(coords);
          }
        },
        (error) => console.error(error),
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
      <div ref={mapElement} className="w-full h-full bg-[#F2EFE9]"></div>
      
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
          if (userLocationOverlayRef.current && mapRef.current) {
            const pos = userLocationOverlayRef.current.getPosition();
            if (pos) {
              mapRef.current.getView().animate({
                center: pos,
                zoom: 15,
                duration: 1000
              });
            }
          }
        }}
        className="absolute bottom-24 md:bottom-4 left-4 z-10 p-4 bg-white border border-border shadow-xl hover:bg-stone-50 transition-all rounded-full"
        title="Ma position"
      >
        <LucideIcons.Navigation className="w-4 h-4 text-ink" />
      </button>
    </div>
  );
};

export default MapView;

