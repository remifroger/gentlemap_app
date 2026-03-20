import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, ChevronRight, ArrowLeft, Star, ExternalLink, Instagram } from 'lucide-react';
import { Notebook, Place } from '../types';

interface NotebookModalProps {
  onClose: () => void;
  onSelectNotebook: (notebook: Notebook) => void;
}

const NotebookModal: React.FC<NotebookModalProps> = ({ onClose, onSelectNotebook }) => {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
  const [notebookPlaces, setNotebookPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  useEffect(() => {
    const fetchNotebooks = async () => {
      try {
        const res = await fetch('/api/notebooks');
        const data = await res.json();
        setNotebooks(data);
      } catch (error) {
        console.error("Error fetching notebooks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotebooks();
  }, []);

  const handleSelectNotebook = async (notebook: Notebook) => {
    setSelectedNotebook(notebook);
    setLoadingPlaces(true);
    try {
      const res = await fetch(`/api/places/ids?ids=${notebook.place_ids.join(',')}`);
      const data = await res.json();
      setNotebookPlaces(data);
    } catch (error) {
      console.error("Error fetching notebook places:", error);
    } finally {
      setLoadingPlaces(false);
    }
  };

  const handleViewOnMap = () => {
    if (selectedNotebook) {
      onSelectNotebook(selectedNotebook);
      onClose();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-4">
            {selectedNotebook && (
              <button 
                onClick={() => setSelectedNotebook(null)}
                className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"
              >
                <ArrowLeft className="w-5 h-5 text-ink" />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-serif italic text-ink">
                {selectedNotebook ? selectedNotebook.title : "Carnet d'adresses"}
              </h2>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent">
                {selectedNotebook ? "Détails du guide" : "Découvrez nos sélections thématiques"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"
          >
            <X className="w-6 h-6 text-ink" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {!selectedNotebook ? (
              <motion.div 
                key="grid"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-[4/5] rounded-3xl bg-stone-100 animate-pulse" />
                  ))
                ) : (
                  notebooks.map(notebook => (
                    <button
                      key={notebook.id}
                      onClick={() => handleSelectNotebook(notebook)}
                      className="group relative aspect-[3/2] rounded-3xl overflow-hidden text-left shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1"
                    >
                      <img 
                        src={notebook.image_url || 'https://images.unsplash.com/photo-1594932224828-b4b057b7d6ee?q=80&w=800&auto=format&fit=crop'} 
                        alt={notebook.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-white/60 mb-2 block">
                          {notebook.place_ids.length} adresses
                        </span>
                        <h3 className="text-xl font-serif text-white font-bold leading-tight mb-2 transition-colors">
                          {notebook.title}
                        </h3>
                        <p className="text-[10px] text-white/80 line-clamp-2 leading-relaxed">
                          {notebook.description}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="relative h-32 rounded-3xl overflow-hidden shadow-xl">
                  <img 
                    src={selectedNotebook.image_url || ''} 
                    alt={selectedNotebook.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-ink/40 flex items-center justify-center p-8 text-center">
                    <p className="text-white text-sm font-serif italic max-w-lg">
                      {selectedNotebook.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-premium">
                      Liste des adresses ({notebookPlaces.length})
                    </h3>
                    <button
                      onClick={handleViewOnMap}
                      className="px-6 py-2 bg-ink text-white rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-premium transition-all shadow-lg flex items-center gap-2"
                    >
                      Voir sur la carte
                      <MapPin className="w-3 h-3" />
                    </button>
                  </div>

                  {loadingPlaces ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-24 rounded-2xl bg-stone-50 animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {notebookPlaces.map(place => (
                        <div 
                          key={place.id}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-border/50 hover:border-premium transition-all group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-white border border-border flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                            <MapPin className="w-5 h-5 text-premium" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h4 className="font-bold text-ink truncate">{place.name}</h4>
                              {place.avg_rating && (
                                <div className="flex items-center gap-0.5 text-amber-500">
                                  <Star className="w-3 h-3 fill-current" />
                                  <span className="text-[10px] font-bold">{place.avg_rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-[10px] text-accent truncate">{place.address}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {place.instagram && (
                              <a 
                                href={`https://instagram.com/${place.instagram.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-white rounded-full text-accent hover:text-premium transition-all shadow-sm"
                              >
                                <Instagram className="w-4 h-4" />
                              </a>
                            )}
                            {place.website && (
                              <a 
                                href={place.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-white rounded-full text-accent hover:text-premium transition-all shadow-sm"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NotebookModal;
