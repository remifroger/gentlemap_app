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
import LineString from 'ol/geom/LineString';
import * as LucideIcons from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Place, Category, Notebook } from '../types';

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
  selectedNotebook: Notebook | null;
  selectedPlace: Place | null;
  onCloseNotebook: () => void;
  onOpenNotebookModal: () => void;
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
  mapCenter,
  selectedNotebook,
  selectedPlace,
  onCloseNotebook,
  onOpenNotebookModal
}) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource>(new VectorSource());
  const overlaysRef = useRef<Overlay[]>([]);
  const userLocationOverlayRef = useRef<Overlay | null>(null);
  const searchMarkerOverlayRef = useRef<Overlay | null>(null);
  const lastCategoryRef = useRef<string | null>(null);
  const lastSubcategoryRef = useRef<string | null>(null);
  const lastNotebookRef = useRef<string | null>(null);
  const hasFittedNotebookRef = useRef<string | null>(null);
  const isFirstRender = useRef(true);

  const [isNotebookExpanded, setIsNotebookExpanded] = useState(false);

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

    // Sort places so featured ones are rendered last (on top)
    const sortedPlaces = [...places].sort((a, b) => {
      const aFeatured = a.is_featured || selectedNotebook?.place_ids.includes(a.id);
      const bFeatured = b.is_featured || selectedNotebook?.place_ids.includes(b.id);
      if (aFeatured && !bFeatured) return 1;
      if (!aFeatured && bFeatured) return -1;
      return 0;
    });

    sortedPlaces.forEach(place => {
      const lat = Number(place.lat);
      const lng = Number(place.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      const coords = fromLonLat([lng, lat]);
      const category = categories.find(c => c.id === place.category_id);
      const iconName = category?.icon || 'map-pin';
      const Icon = (LucideIcons as any)[iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())] || LucideIcons.MapPin;
      
      const isNotebookPlace = selectedNotebook?.place_ids.includes(place.id);
      const notebookIndex = selectedNotebook?.place_ids.indexOf(place.id);
      const isSelected = selectedPlace?.id === place.id;

      if (place.is_featured || isNotebookPlace) {
        const container = document.createElement('div');
        container.className = 'custom-marker-wrapper';
        
        container.innerHTML = renderToStaticMarkup(
          <div className={`featured-marker flex items-center gap-2 ${isNotebookPlace ? 'bg-ink' : 'bg-premium'} text-white px-3 py-1.5 rounded-md border-2 ${isSelected ? 'border-premium ring-4 ring-premium/30 scale-110' : 'border-white'} shadow-[0_2px_8px_rgba(0,0,0,0.05)] whitespace-nowrap cursor-pointer transition-all hover:scale-105`}>
            {isNotebookPlace && (
              <span className="w-4 h-4 rounded-full bg-white text-ink flex items-center justify-center text-[8px] font-bold">
                {(notebookIndex ?? 0) + 1}
              </span>
            )}
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
          stopEvent: false,
          positioning: 'bottom-center'
        });

        mapRef.current?.addOverlay(overlay);
        overlaysRef.current.push(overlay);
      } else {
        const color = category?.color || '#5A5A5A';
        const container = document.createElement('div');
        container.className = 'custom-marker-wrapper';
        
        container.innerHTML = renderToStaticMarkup(
          <div className={`w-8 h-8 bg-white border ${isSelected ? 'border-premium ring-4 ring-premium/30 scale-125' : 'border-black'} rounded-full flex items-center justify-center shadow-none cursor-pointer hover:scale-110 transition-transform`}>
             <Icon size={14} strokeWidth={2} style={{ color: isSelected ? 'var(--color-premium)' : color }} />
          </div>
        );

        container.onclick = (e) => {
          e.stopPropagation();
          onPlaceClick(place);
        };

        const overlay = new Overlay({
          position: coords,
          element: container,
          stopEvent: false,
          positioning: 'center-center'
        });

        mapRef.current?.addOverlay(overlay);
        overlaysRef.current.push(overlay);
      }
    });

    // Draw notebook line
    if (selectedNotebook && places.length > 0) {
      const notebookCoords = selectedNotebook.place_ids
        .map(id => places.find(p => p.id === id))
        .filter((p): p is Place => !!p)
        .map(p => fromLonLat([Number(p.lng), Number(p.lat)]));

      if (notebookCoords.length > 1) {
        const lineFeature = new Feature({
          geometry: new LineString(notebookCoords)
        });
        lineFeature.setStyle(new Style({
          stroke: new Stroke({
            color: '#121212',
            width: 3,
            lineDash: [10, 10]
          })
        }));
        vectorSourceRef.current.addFeature(lineFeature);
      }
    }

    if (places.length > 0) {
      const currentNotebookId = selectedNotebook?.id || null;
      const notebookChanged = lastNotebookRef.current !== currentNotebookId;
      
      // Only fit if it's the first render and no mapCenter is provided OR if notebook changed
      let shouldFit = (isFirstRender.current && !mapCenter);
      
      if (currentNotebookId && hasFittedNotebookRef.current !== currentNotebookId) {
        // Check if the current places list actually contains the notebook places
        const notebookPlaceIds = selectedNotebook?.place_ids || [];
        const isNotebookLoaded = notebookPlaceIds.length > 0 && 
                                 notebookPlaceIds.every(id => places.some(p => p.id === id));
        
        if (isNotebookLoaded) {
          shouldFit = true;
          hasFittedNotebookRef.current = currentNotebookId;
        }
      }

      if (shouldFit) {
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
    }

    lastCategoryRef.current = selectedCategoryId;
    lastSubcategoryRef.current = selectedSubcategoryId;
    lastNotebookRef.current = selectedNotebook?.id || null;
    if (!selectedNotebook) {
      hasFittedNotebookRef.current = null;
    }
    isFirstRender.current = false;
  }, [places, onPlaceClick, categories, selectedCategoryId, selectedSubcategoryId, mapCenter, selectedPlace, selectedNotebook]);

  // Handle Map Center (Search or Place Selection)
  useEffect(() => {
    if (mapRef.current && mapCenter) {
      const coords = fromLonLat([mapCenter[1], mapCenter[0]]);
      const view = mapRef.current.getView();
      const size = mapRef.current.getSize();
      
      // Handle search marker (only for address search, not place selection)
      const isPlaceSelection = selectedPlace && 
        Math.abs(selectedPlace.lat - mapCenter[0]) < 0.0001 && 
        Math.abs(selectedPlace.lng - mapCenter[1]) < 0.0001;

      if (!isPlaceSelection) {
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
      } else if (searchMarkerOverlayRef.current) {
        mapRef.current.removeOverlay(searchMarkerOverlayRef.current);
        searchMarkerOverlayRef.current = null;
      }

      if (isPlaceSelection && size) {
        // If a place is selected, we want to offset the center to the left
        // to account for the side panel (550px on desktop)
        const isMobile = window.innerWidth < 768;
        const paddingRight = isMobile ? 0 : 550;
        
        // Calculate target center with offset
        const targetZoom = 17; // Increased zoom for better detail
        const resolution = view.getResolutionForZoom(targetZoom);
        
        // On mobile, we might want a vertical offset if the panel is at the bottom
        // But currently PlaceDetails is a side panel on desktop and likely full screen or bottom on mobile
        const pixelOffset = isMobile ? 0 : (paddingRight / 2);
        const mapOffset = pixelOffset * resolution;
        
        view.animate({
          center: [coords[0] + mapOffset, coords[1]],
          zoom: targetZoom,
          duration: 1500
        });
      } else {
        // Normal search centering
        view.animate({
          center: coords,
          zoom: 16,
          duration: 1500
        });
      }
    }
  }, [mapCenter, selectedPlace]);

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

  const subcategories = selectedCategoryId 
    ? categories.filter(c => c.parent_id === selectedCategoryId)
    : [];

  return (
    <div className="w-full h-full relative">
      <div ref={mapElement} className="w-full h-full bg-[#F2EFE9]"></div>
      
      {selectedNotebook && (
        <div className={`absolute top-6 right-6 z-20 w-[calc(100%-3rem)] max-w-sm bg-white/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl transition-all duration-500 ease-in-out ${isNotebookExpanded ? 'p-6' : 'p-3 px-4'}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex-shrink-0 w-8 h-8 bg-ink text-white flex items-center justify-center rounded-lg shadow-lg">
                <LucideIcons.Book className="w-4 h-4" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[7px] uppercase tracking-[0.2em] font-bold text-premium leading-none mb-1">
                  Carnet d'adresses
                </span>
                <h3 className={`font-serif text-ink font-bold leading-tight truncate ${isNotebookExpanded ? 'text-xl' : 'text-sm'}`}>
                  {selectedNotebook.title}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsNotebookExpanded(!isNotebookExpanded)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                title={isNotebookExpanded ? "Réduire" : "Développer"}
              >
                {isNotebookExpanded ? <LucideIcons.ChevronUp className="w-4 h-4 text-ink" /> : <LucideIcons.ChevronDown className="w-4 h-4 text-ink" />}
              </button>
              <button 
                onClick={onCloseNotebook}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                title="Fermer le carnet"
              >
                <LucideIcons.X className="w-4 h-4 text-ink" />
              </button>
            </div>
          </div>
          
          {isNotebookExpanded && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="h-px bg-border/50 mb-4" />
              <p className="text-sm text-accent leading-relaxed mb-6 font-serif">
                "{selectedNotebook.description}"
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-premium">
                  <LucideIcons.MapPin className="w-3 h-3" />
                  {selectedNotebook.place_ids.length} adresses à découvrir
                </div>
                <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center">
                   <LucideIcons.ArrowRight className="w-3 h-3 text-ink" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 z-20 flex gap-0 bg-white shadow-2xl border border-border overflow-hidden rounded-full max-w-[95vw] md:max-w-none">
        {subcategories.length > 0 && (
          <select 
            className="px-3 md:px-6 py-2 md:py-3 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] bg-transparent border-r border-border outline-none cursor-pointer hover:bg-stone-50 transition-colors appearance-none"
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
          className="px-3 md:px-6 py-2 md:py-3 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] bg-transparent border-r border-border outline-none cursor-pointer hover:bg-stone-50 transition-colors appearance-none"
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
          className="px-3 md:px-6 py-2 md:py-3 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] bg-transparent outline-none cursor-pointer hover:bg-stone-50 transition-colors appearance-none"
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
        >
          <option value="">Note</option>
          <option value="7">7.0+</option>
          <option value="7.5">7.5+</option>
          <option value="8">8.0+</option>
          <option value="8.5">8.5+</option>
          <option value="9">9.0+</option>
          <option value="9.5">9.5+</option>
        </select>
      </div>

      <div className="absolute bottom-10 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3 w-full px-4 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onOpenNotebookModal}
            className="px-5 md:px-6 py-3 bg-ink text-white border border-border shadow-2xl hover:bg-accent transition-all rounded-full flex items-center gap-2 group whitespace-nowrap"
            title="Carnet d'adresses"
          >
            <LucideIcons.Book className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest">
              Carnet d'adresses
            </span>
          </button>

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
            className="p-3 bg-white border border-border shadow-2xl hover:bg-stone-50 transition-all rounded-full flex items-center justify-center"
            title="Ma position"
          >
            <LucideIcons.Navigation className="w-4 h-4 text-ink" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapView;

