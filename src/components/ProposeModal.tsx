import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Category } from '../types';

interface ProposeModalProps {
  categories: Category[];
  onClose: () => void;
}

const ProposeModal: React.FC<ProposeModalProps> = ({ categories, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    category_id: '',
    description: '',
    price_range: 2,
    website: '',
    instagram: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mainCats = categories.filter(c => !c.parent_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Geocode address with French BAN API (Base Adresse Nationale)
      const geoRes = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(formData.address)}&limit=1`);
      const geoData = await geoRes.json();

      if (geoData.features && geoData.features.length > 0) {
        const feature = geoData.features[0];
        const [lng, lat] = feature.geometry.coordinates;
        const address = feature.properties.label;
        
        const res = await fetch('/api/places', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, address, lat, lng }),
        });

        if (res.ok) {
          alert('Merci ! Votre proposition a été envoyée pour validation.');
          onClose();
        }
      } else {
        alert("L'adresse n'a pas pu être géolocalisée.");
      }
    } catch (err) {
      alert("Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-stone-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-accent" />
        </button>

        <div className="p-12 overflow-y-auto">
          <h2 className="font-serif text-4xl mb-4 italic">Proposer une adresse</h2>
          <p className="text-micro text-accent mb-10 opacity-60">Contribuez à l'excellence du répertoire.</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-micro text-accent">Nom de l'établissement</label>
              <input 
                type="text" 
                required
                className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-ink transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-micro text-accent">Adresse précise</label>
              <input 
                type="text" 
                required
                className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-ink transition-all"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-micro text-accent">Catégorie</label>
                <select 
                  required
                  className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-ink transition-all cursor-pointer"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                >
                  <option value="">Sélectionner</option>
                  {mainCats.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-micro text-accent">Gamme de prix</label>
                <select 
                  className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-ink transition-all cursor-pointer"
                  value={formData.price_range}
                  onChange={(e) => setFormData({ ...formData, price_range: parseInt(e.target.value) })}
                >
                  <option value="1">€</option>
                  <option value="2">€€</option>
                  <option value="3">€€€</option>
                  <option value="4">€€€€</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-micro text-accent">Site Internet</label>
                <input 
                  type="url" 
                  placeholder="https://..."
                  className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-ink transition-all"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-micro text-accent">Instagram</label>
                <input 
                  type="text" 
                  placeholder="@compte"
                  className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-ink transition-all"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-micro text-accent">Description & Esprit</label>
              <textarea 
                rows={2}
                className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-ink transition-all resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-5 border border-ink text-ink text-micro hover:bg-premium hover:text-white hover:border-premium transition-all disabled:opacity-50 rounded-full"
            >
              {isSubmitting ? 'Envoi en cours...' : 'Soumettre au répertoire'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ProposeModal;
