import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Star, MapPin, Euro, Instagram, Globe, Copy } from 'lucide-react';
import { Place, Review } from '../types';

interface PlaceDetailsProps {
  place: Place;
  onClose: () => void;
}

const PlaceDetails: React.FC<PlaceDetailsProps> = ({ place, onClose }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(8);
  const [comment, setComment] = useState('');

  const fetchReviews = async () => {
    const res = await fetch(`/api/places/${place.id}/reviews`);
    const data = await res.json();
    setReviews(data);
  };

  useEffect(() => {
    fetchReviews();
  }, [place.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ place_id: place.id, rating, comment, user_name: userName })
    });
    if (res.ok) {
      setUserName('');
      setComment('');
      fetchReviews();
    }
  };

  return (
    <motion.aside
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 35, stiffness: 200 }}
      className="fixed md:absolute right-0 top-0 h-full w-full md:w-[550px] bg-bg z-[100] md:z-50 overflow-y-auto border-l border-border shadow-2xl"
    >
      <button 
        onClick={onClose}
        className="absolute top-6 md:top-10 right-6 md:right-10 p-3 md:p-4 hover:bg-ink hover:text-white rounded-full transition-all z-10 border border-border bg-white/80 backdrop-blur-sm"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="p-6 md:p-16">
        <div className="mb-12 md:mb-16">
          <div className="flex items-center gap-4 mb-6 md:mb-8">
             <span className={`text-micro ${place.is_featured ? 'text-premium' : 'text-ink'}`}>Sélection Exclusive</span>
             <div className="h-[0.5px] flex-1 bg-border"></div>
          </div>
          
          <h2 className="font-serif text-4xl md:text-6xl font-light leading-[1.05] mb-6 md:mb-8 tracking-tight italic">{place.name}</h2>
          
          <div className="flex flex-wrap items-center gap-4 md:gap-8 text-[10px] uppercase tracking-[0.2em] font-bold text-accent">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Euro key={i} className={`w-3 h-3 ${i < place.price_range ? 'text-ink' : 'text-border'}`} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Star className={`w-3 h-3 ${place.is_featured ? 'text-premium' : 'text-ink'}`} />
              <span>{place.avg_rating ? `${Number(place.avg_rating).toFixed(1)}/10` : 'Aucun avis'}</span>
            </div>
          </div>
          
          <div className="mt-8 md:mt-10 flex items-start justify-between gap-4 border-t border-border pt-6 md:pt-8">
            <div className="flex items-start gap-4 text-sm text-accent leading-relaxed italic">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{place.address}</span>
            </div>
            <button 
              onClick={(e) => {
                navigator.clipboard.writeText(place.address || '');
                const btn = e.currentTarget;
                const originalTitle = btn.title;
                btn.title = 'Copié !';
                btn.classList.add('bg-green-50');
                setTimeout(() => {
                  btn.title = originalTitle;
                  btn.classList.remove('bg-green-50');
                }, 2000);
              }}
              className="p-2 hover:bg-stone-100 rounded-full transition-all shrink-0"
              title="Copier l'adresse"
            >
              <Copy className="w-3.5 h-3.5 text-accent" />
            </button>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {place.website && (
              <a 
                href={place.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 border border-ink text-ink text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-premium hover:text-white hover:border-premium transition-all rounded-full"
              >
                <Globe className="w-3 h-3" />
                <span>Site Officiel</span>
              </a>
            )}
            {place.instagram && (
              <a 
                href={`https://instagram.com/${place.instagram.replace('@', '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 border border-ink text-ink text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-ink hover:text-white transition-all rounded-full"
              >
                <Instagram className="w-3 h-3" />
                <span>Instagram</span>
              </a>
            )}
            <a 
              href="mailto:contact@gentlemap.com" 
              className="flex items-center gap-3 px-6 py-3 bg-premium text-white text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-ink transition-all rounded-full"
            >
              <Star className="w-3 h-3" />
              <span>Devenir premium</span>
            </a>
          </div>
        </div>

        <div className="space-y-16">
          <section>
            <div className="flex items-center gap-4 mb-8">
               <h3 className="text-micro text-accent">L'Héritage</h3>
               <div className="h-[0.5px] flex-1 bg-border"></div>
            </div>
            <p className="text-ink/80 leading-relaxed font-light text-xl italic font-serif">
               {place.description || 'Une adresse confidentielle à découvrir.'}
            </p>
          </section>

          <section className="bg-white p-12 border border-border relative overflow-hidden rounded-xl">
            <div className={`absolute top-0 left-0 w-1 h-full ${place.is_featured ? 'bg-premium' : 'bg-ink'}`}></div>
            <h3 className={`text-micro mb-6 ${place.is_featured ? 'text-premium' : 'text-ink'}`}>Le Regard Gentlemap</h3>
            <div className="italic text-ink text-2xl leading-relaxed font-serif">
              "{place.gentlemap_review || 'Un savoir-faire qui force le respect.'}"
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-10">
               <h3 className="text-micro text-accent">Chroniques</h3>
               <div className="h-[0.5px] flex-1 bg-border"></div>
            </div>
            <div className="space-y-10">
              {reviews.map(review => (
                <div key={review.id} className="border-b border-border pb-8 last:border-0">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-serif italic text-xl">{review.user_name || 'Un esthète'}</span>
                    <span className="text-[9px] font-bold tracking-widest text-accent">{review.rating}/10</span>
                  </div>
                  <p className="text-sm text-accent font-light leading-relaxed italic">
                    "{review.comment}"
                  </p>
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="py-16 text-center border border-dashed border-border">
                   <p className="text-micro opacity-40">Silence Éloquent</p>
                </div>
              )}
            </div>
          </section>

          <section className="bg-bg p-12 border border-border rounded-xl">
            <h4 className={`text-micro mb-8 ${place.is_featured ? 'text-premium' : 'text-ink'}`}>Contribuer au Répertoire</h4>
            <form onSubmit={handleSubmitReview} className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-micro opacity-60">Signature</label>
                  <input 
                    type="text" 
                    className="w-full bg-transparent border-b border-ink/20 py-2 text-sm focus:outline-none focus:border-premium transition-all"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-micro opacity-60">Note</label>
                  <input 
                    type="number" 
                    min="1" max="10"
                    className="w-full bg-transparent border-b border-ink/20 py-2 text-sm focus:outline-none focus:border-premium transition-all"
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-micro opacity-60">Commentaire</label>
                <textarea 
                  rows={2}
                  className="w-full bg-transparent border-b border-ink/20 py-2 text-sm focus:outline-none focus:border-premium transition-all resize-none"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              <button type="submit" className="w-full py-4 border border-ink text-ink text-micro hover:bg-premium hover:text-white hover:border-premium transition-all rounded-full">
                Publier la chronique
              </button>
            </form>
          </section>
        </div>
      </div>
    </motion.aside>
  );
};

export default PlaceDetails;
