import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Menu } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onProposeClick: () => void;
  onAddressSelect?: (lat: number, lng: number) => void;
  onPlaceSelect?: (place: any) => void;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, setSearchQuery, onProposeClick, onAddressSelect, onPlaceSelect, onMenuClick }) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [placeSuggestions, setPlaceSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (inputValue.length < 2) {
        setAddressSuggestions([]);
        setPlaceSuggestions([]);
        return;
      }
      
      // Fetch Addresses
      try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(inputValue)}&limit=3`);
        const data = await res.json();
        setAddressSuggestions(data.features || []);
      } catch (err) {
        console.error('BAN API Error:', err);
      }

      // Fetch Places
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(inputValue)}&limit=5`);
        const data = await res.json();
        setPlaceSuggestions(data || []);
      } catch (err) {
        console.error('Places API Error:', err);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  return (
    <header className="flex items-center justify-between px-4 md:px-12 py-4 md:py-6 bg-bg border-b border-border z-[100]">
      <div className="flex items-center gap-2 md:gap-6 group cursor-pointer">
        <button 
          className="md:hidden p-2 -ml-2 text-ink"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col" onClick={() => window.location.reload()}>
          <div className="font-serif text-2xl md:text-5xl font-medium tracking-tight text-ink leading-none">
            Gentle<span className="italic font-light">map</span>
          </div>
        </div>
      </div>
      
      <div className="hidden md:flex flex-1 max-w-md mx-12 relative">
        <div className="relative w-full group">
          <input
            type="text"
            placeholder="Rechercher un artisan, un style ou une adresse..."
            className="w-full pl-0 pr-6 py-2 bg-transparent border-b border-border text-sm font-light italic focus:outline-none focus:border-ink transition-all placeholder:text-accent/40"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          <Search className="absolute right-0 top-2 w-4 h-4 text-accent/40 group-focus-within:text-ink transition-colors" />
          
          {showSuggestions && (addressSuggestions.length > 0 || placeSuggestions.length > 0) && (
            <div className="absolute top-full left-0 w-full bg-white border border-border shadow-2xl mt-1 z-[110] overflow-hidden rounded-lg">
              {placeSuggestions.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-stone-50 border-b border-border">
                    <span className="text-[8px] uppercase tracking-widest font-bold text-premium">Artisans & Lieux</span>
                  </div>
                  {placeSuggestions.map((place) => (
                    <button
                      key={`place-${place.id}`}
                      className="w-full px-4 py-3 text-left hover:bg-stone-50 flex items-center gap-3 border-b border-border last:border-0 transition-colors"
                      onClick={() => {
                        onPlaceSelect?.(place);
                        setInputValue(place.name);
                        setSearchQuery(''); 
                        setShowSuggestions(false);
                      }}
                    >
                      <Search className="w-3 h-3 text-premium" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-medium text-ink">{place.name}</span>
                        <span className="text-[8px] text-accent uppercase tracking-tighter">{place.address}</span>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {addressSuggestions.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-stone-50 border-b border-border border-t first:border-t-0">
                    <span className="text-[8px] uppercase tracking-widest font-bold text-accent">Adresses</span>
                  </div>
                  {addressSuggestions.map((feat, i) => (
                    <button
                      key={`addr-${i}`}
                      className="w-full px-4 py-3 text-left hover:bg-stone-50 flex items-center gap-3 border-b border-border last:border-0 transition-colors"
                      onClick={() => {
                        const [lng, lat] = feat.geometry.coordinates;
                        onAddressSelect?.(lat, lng);
                        setInputValue(feat.properties.label);
                        setSearchQuery(''); 
                        setShowSuggestions(false);
                      }}
                    >
                      <MapPin className="w-3 h-3 text-accent" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-medium text-ink">{feat.properties.label}</span>
                        <span className="text-[8px] text-accent uppercase tracking-tighter">{feat.properties.context}</span>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          className="md:hidden p-2 text-ink"
          onClick={() => setShowSuggestions(!showSuggestions)}
        >
          <Search className="w-5 h-5" />
        </button>
        <button
          onClick={onProposeClick}
          className="group relative flex items-center gap-2 md:gap-4 px-4 md:px-8 py-2 md:py-3 overflow-hidden border border-ink text-[8px] md:text-[10px] font-bold uppercase tracking-[0.1em] md:tracking-[0.25em] transition-all hover:bg-premium hover:text-white hover:border-premium rounded-full"
        >
          <span className="relative z-10">Proposer</span>
          <Plus className="relative z-10 w-3 h-3 transition-transform group-hover:rotate-90" />
        </button>
      </div>
    </header>
  );
};

export default Header;
