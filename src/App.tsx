import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import PlaceDetails from './components/PlaceDetails';
import ProposeModal from './components/ProposeModal';
import AboutPage from './components/AboutPage';
import { Category, Place } from './types';

const App: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<string>('');
  const [ratingFilter, setRatingFilter] = useState<string>('');
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [showAbout, setShowAbout] = useState(window.location.hash === '#about');

  useEffect(() => {
    const handleHashChange = () => {
      setShowAbout(window.location.hash === '#about');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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
      if (ratingFilter) params.append('minRating', ratingFilter);
      
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
  }, [selectedCategoryId, selectedSubcategoryId, priceFilter, ratingFilter]);

  const handlePlaceSelect = (place: Place) => {
    setMapCenter([place.lat, place.lng]);
    setSelectedPlace(place);
  };

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
      />
      
      <main className="flex flex-1 overflow-hidden relative">
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
        
        <div className="flex-1 relative">
          <MapView 
            places={places} 
            onPlaceClick={setSelectedPlace}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            selectedSubcategoryId={selectedSubcategoryId}
            setSelectedSubcategoryId={setSelectedSubcategoryId}
            priceFilter={priceFilter}
            setPriceFilter={setPriceFilter}
            ratingFilter={ratingFilter}
            setRatingFilter={setRatingFilter}
            mapCenter={mapCenter}
          />
          
          <AnimatePresence>
            {selectedPlace && (
              <PlaceDetails 
                place={selectedPlace} 
                onClose={() => setSelectedPlace(null)} 
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
        {showAbout && (
          <AboutPage onBack={() => window.location.hash = ''} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
