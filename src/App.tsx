import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import PlaceDetails from './components/PlaceDetails';
import ProposeModal from './components/ProposeModal';
import AboutPage from './components/AboutPage';
import BlogPage from './components/BlogPage';
import NotebookModal from './components/NotebookModal';
import { Category, Place, Notebook } from './types';

const App: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
  const [itineraryPlaces, setItineraryPlaces] = useState<Place[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<string>('');
  const [ratingFilter, setRatingFilter] = useState<string>('');
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [showAbout, setShowAbout] = useState(window.location.hash.startsWith('#about'));
  const [showBlog, setShowBlog] = useState(window.location.hash.startsWith('#blog'));

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      setShowAbout(hash.startsWith('#about'));
      setShowBlog(hash.startsWith('#blog'));
      
      // Handle deep linking for places: #place/123
      if (hash.startsWith('#place/')) {
        const placeIdStr = hash.split('/')[1];
        if (placeIdStr) {
          const placeId = parseInt(placeIdStr, 10);
          const place = places.find(p => p.id === placeId);
          if (place) {
            handlePlaceSelect(place);
          }
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [places]);

  // Initial check for place in URL
  useEffect(() => {
    if (places.length > 0) {
      const hash = window.location.hash;
      if (hash.startsWith('#place/')) {
        const placeIdStr = hash.split('/')[1];
        if (placeIdStr) {
          const placeId = parseInt(placeIdStr, 10);
          const place = places.find(p => p.id === placeId);
          if (place) {
            handlePlaceSelect(place);
          }
        }
      }
    }
  }, [places]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        console.error("Categories data is not an array:", data);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchPlaces = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategoryId) params.append('category', selectedCategoryId);
      if (selectedSubcategoryId) params.append('subcategory', selectedSubcategoryId);
      if (priceFilter) params.append('maxPrice', priceFilter);
      if (ratingFilter) params.append('minRating', ratingFilter.toString());
      if (debouncedSearchQuery) params.append('q', debouncedSearchQuery);

      // If a notebook is active, we only want to fetch places that belong to it
      if (selectedNotebook) {
        params.append('ids', selectedNotebook.place_ids.join(','));
      }
      
      const res = await fetch(`/api/places?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setPlaces(data);
      } else {
        console.error("Places data is not an array:", data);
        setPlaces([]);
      }
    } catch (error) {
      console.error("Error fetching places:", error);
      setPlaces([]);
    }
  }, [selectedCategoryId, selectedSubcategoryId, priceFilter, ratingFilter, selectedNotebook, debouncedSearchQuery]);

  const handlePlaceSelect = (place: Place) => {
    setMapCenter([place.lat, place.lng]);
    setSelectedPlace(place);
    // Update URL hash without triggering scroll or reload
    window.location.hash = `#place/${place.id}`;
  };

  const handleClosePlace = () => {
    setSelectedPlace(null);
    // Clear place hash if we are not on about or blog
    if (!window.location.hash.startsWith('#about') && !window.location.hash.startsWith('#blog')) {
      window.location.hash = '';
    }
  };

  const handleSelectSubcategory = (subId: string | null) => {
    setSelectedSubcategoryId(subId);
    if (subId) {
      const sub = categories.find(c => c.id === subId);
      if (sub && sub.parent_id) {
        setSelectedCategoryId(sub.parent_id);
      }
    }
  };

  const handleViewNotebook = async (notebookId: string) => {
    try {
      const res = await fetch(`/api/notebooks/${notebookId}`);
      const notebook: Notebook = await res.json();
      
      setSelectedNotebook(notebook);
      // Reset category filters to "Tout voir"
      setSelectedCategoryId(null);
      setSelectedSubcategoryId(null);
      setShowBlog(false);
      window.location.hash = '';
    } catch (error) {
      console.error("Error viewing notebook:", error);
    }
  };

  useEffect(() => {
    if (selectedNotebook) {
      // When a notebook is selected, we center the map on its first place if available
      // fetchPlaces() will be called automatically because selectedNotebook is a dependency of fetchPlaces
    } else {
      setItineraryPlaces([]);
    }
  }, [selectedNotebook]);

  useEffect(() => {
    if (selectedNotebook && places.length > 0) {
      const notebookPlacesList = places.filter(p => selectedNotebook.place_ids.includes(p.id));
      if (notebookPlacesList.length > 0 && !mapCenter) {
        setMapCenter([notebookPlacesList[0].lat, notebookPlacesList[0].lng]);
      }
    }
  }, [selectedNotebook, places, mapCenter]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  return (
    <div className="flex flex-col h-screen bg-bg">
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onProposeClick={() => setIsProposeModalOpen(true)}
        onAddressSelect={(lat, lng) => setMapCenter([lat, lng])}
        onPlaceSelect={handlePlaceSelect}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        onLogoClick={() => {
          window.location.hash = '';
          setSelectedPlace(null);
          setShowAbout(false);
          setShowBlog(false);
        }}
        isDiscreet={showAbout || showBlog}
      />
      
      <main className="flex flex-1 overflow-hidden relative">
        {(!showAbout && !showBlog) && (
          <Sidebar 
            categories={categories} 
            selectedCategoryId={selectedCategoryId} 
            onSelectCategory={(id) => {
              setSelectedCategoryId(id);
              setSelectedSubcategoryId(null);
              setIsSidebarOpen(false);
            }} 
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
        
        <div className="flex-1 relative">
          <MapView 
            places={places} 
            onPlaceClick={handlePlaceSelect}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            selectedSubcategoryId={selectedSubcategoryId}
            setSelectedSubcategoryId={handleSelectSubcategory}
            priceFilter={priceFilter}
            setPriceFilter={setPriceFilter}
            ratingFilter={ratingFilter}
            setRatingFilter={setRatingFilter}
            mapCenter={mapCenter}
            selectedNotebook={selectedNotebook}
            selectedPlace={selectedPlace}
            onCloseNotebook={() => setSelectedNotebook(null)}
            onOpenNotebookModal={() => {
        console.log("Opening Notebook Modal");
        setIsNotebookModalOpen(true);
      }}
          />
          
          <AnimatePresence>
            {selectedPlace && (
              <PlaceDetails 
                place={selectedPlace} 
                onClose={handleClosePlace} 
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {isProposeModalOpen && (
          <ProposeModal 
            categories={categories} 
            onClose={() => setIsProposeModalOpen(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isNotebookModalOpen && (
          <NotebookModal 
            onClose={() => setIsNotebookModalOpen(false)} 
            onSelectNotebook={(notebook) => {
              setSelectedNotebook(notebook);
              // Reset category filters to "Tout voir"
              setSelectedCategoryId(null);
              setSelectedSubcategoryId(null);
              setIsNotebookModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAbout && (
          <AboutPage onBack={() => window.location.hash = ''} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBlog && (
          <BlogPage 
            onBack={() => window.location.hash = ''} 
            onViewNotebook={handleViewNotebook}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
