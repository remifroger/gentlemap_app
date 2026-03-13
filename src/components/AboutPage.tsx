import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, MapPin, Heart, Compass, Share2 } from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 bg-bg overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-24">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-accent hover:text-ink transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm uppercase tracking-widest font-bold text-[10px]">Retour à la carte</span>
        </button>

        <header className="mb-20">
          <h1 className="text-6xl md:text-8xl font-serif italic text-ink mb-8 leading-tight">
            À propos
          </h1>
          <p className="text-2xl md:text-3xl font-serif text-accent/80 leading-relaxed max-w-2xl">
            Une invitation à la flânerie pour les amoureux du beau, du rare et du singulier.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
          <section className="space-y-6">
            <div className="w-12 h-12 bg-premium/10 rounded-full flex items-center justify-center mb-8">
              <Compass className="w-6 h-6 text-premium" />
            </div>
            <h2 className="text-xl font-bold uppercase tracking-widest text-ink">Notre Vision</h2>
            <p className="text-lg text-accent leading-relaxed">
              Dans un monde d'algorithmes et de recommandations uniformes, Gentlemap propose une alternative : une sélection humaine, minutieuse, de lieux choisis pour leur âme, leur élégance, leur intemporalité.
            </p>
          </section>

          <section className="space-y-6">
            <div className="w-12 h-12 bg-premium/10 rounded-full flex items-center justify-center mb-8">
              <MapPin className="w-6 h-6 text-premium" />
            </div>
            <h2 className="text-xl font-bold uppercase tracking-widest text-ink">La Sélection</h2>
            <p className="text-lg text-accent leading-relaxed">
              Chaque point sur la carte est le fruit d'une recherche attentive ou d'un coup de cœur partagé. Tailleurs anciens, librairies cachées, artisans discrets, cafés historiques, hôtels de charme : ici, rien n'est laissé au hasard.
            </p>
          </section>

          <section className="space-y-6">
            <div className="w-12 h-12 bg-premium/10 rounded-full flex items-center justify-center mb-8">
              <Share2 className="w-6 h-6 text-premium" />
            </div>
            <h2 className="text-xl font-bold uppercase tracking-widest text-ink">Collaboration</h2>
            <p className="text-lg text-accent leading-relaxed">
              Vous connaissez une adresse qui mérite sa place sur Gentlemap ? Contribuez à enrichir la carte en nous écrivant. Votre expertise est notre plus grande richesse.
            </p>
            <a 
              href="mailto:contact@gentlemap.com"
              className="inline-flex items-center gap-2 text-premium hover:underline font-bold text-sm uppercase tracking-widest"
            >
              <Mail className="w-4 h-4" />
              contact@gentlemap.com
            </a>
          </section>

          <section className="space-y-6">
            <div className="w-12 h-12 bg-premium/10 rounded-full flex items-center justify-center mb-8">
              <Heart className="w-6 h-6 text-premium" />
            </div>
            <h2 className="text-xl font-bold uppercase tracking-widest text-ink">L'Esprit</h2>
            <p className="text-lg text-accent leading-relaxed">
              Gentlemap n'est ni une application de plus, ni une plateforme de masse. C'est une invitation à ralentir, à observer, à redécouvrir nos villes avec un œil curieux et exigeant.
            </p>
          </section>
        </div>

        <footer className="pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-4xl font-serif italic text-ink mb-2">Gentlemap</span>
          </div>
        </footer>
      </div>
    </motion.div>
  );
};

export default AboutPage;
