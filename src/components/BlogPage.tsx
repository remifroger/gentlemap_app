import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, ChevronRight, ArrowLeft, MapPin } from 'lucide-react';
import { BlogPost } from '../types';

interface BlogPageProps {
  onBack: () => void;
  onViewNotebook: (notebookId: string) => void;
}

const BlogPage: React.FC<BlogPageProps> = ({ onBack, onViewNotebook }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const posts: BlogPost[] = [
    {
      id: 4,
      slug: "itineraire-debutant-paris-costumes-occasion",
      title: "Itinéraire du débutant à Paris : L'art du costume d'occasion",
      excerpt: "Comment se constituer une garde-robe classique de haute volée sans se ruiner ? Suivez notre guide pas à pas dans les rues de Paris.",
      content: `
        <p>Débuter dans l'art tailleur peut sembler intimidant, surtout quand on regarde les prix de la Grande Mesure. Pourtant, Paris regorge de trésors pour qui sait où chercher. Nous avons conçu cet itinéraire spécialement pour ceux qui veulent allier élégance intemporelle et budget maîtrisé.</p>
        
        <h3>Étape 1 : La chine de luxe chez Ammar</h3>
        <p>Commencez votre journée au 13 Rue de la Grange Batelière. Chez Ammar, vous apprendrez à reconnaître les belles matières et les coupes d'exception. C'est ici que vous trouverez peut-être votre première veste en tweed ou un costume de grande maison à une fraction de son prix d'origine.</p>
        
        <h3>Étape 2 : L'accessoire chez Charvet</h3>
        <p>Une fois votre veste trouvée, dirigez-vous vers la Place Vendôme. Même si vous n'achetez pas de chemise sur mesure, l'observation des soies et des lins chez Charvet affinera votre œil. Une belle cravate ou une pochette d'occasion (trouvée chez Ammar) se marie parfaitement avec l'excellence de cette maison.</p>
        
        <h3>Étape 3 : La retouche, secret de l'élégance</h3>
        <p>Un costume d'occasion n'est parfait que s'il est ajusté. Passez voir Scavini pour comprendre l'importance d'une ligne d'épaule ou d'un tombé de pantalon. Un bon retoucheur est le meilleur ami de l'amateur de vintage.</p>
        
        <p>Cet itinéraire n'est pas qu'une liste de boutiques, c'est une éducation de l'œil. Prenez le temps de discuter avec les passionnés que vous rencontrerez sur votre route.</p>
      `,
      date: "19 Mars 2026",
      author: "L'équipe Gentlemap",
      category: "Carnet",
      image: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&q=80&w=800",
      notebook_id: "paris-debutant-costumes"
    },
    {
      id: 1,
      slug: "cifonelli-epaule-iconique-rue-marbeuf",
      title: "Cifonelli : L'Épaule Iconique de la Rue Marbeuf",
      excerpt: "Plongez dans l'univers du plus célèbre tailleur de la Grande Mesure parisienne, où chaque coupe est une œuvre d'art.",
      content: `
        <p>Située au 31 Rue Marbeuf, la maison Cifonelli incarne l'excellence du tailleur parisien. Fondée en 1880, elle est aujourd'hui dirigée par Lorenzo et Massimo Cifonelli, qui perpétuent un savoir-faire unique au monde.</p>
        <p>Ce qui rend Cifonelli si spécial, c'est avant tout son "épaule". Une coupe particulière, légèrement projetée vers l'avant, qui offre une silhouette à la fois structurée et d'une souplesse incroyable. C'est le mariage parfait entre la rigueur anglaise et la fluidité italienne.</p>
        <p>Entrer chez Cifonelli, c'est entrer dans un temple de la patience. Un costume en Grande Mesure nécessite plus de 80 heures de travail manuel et plusieurs essayages. Chaque détail, de la boutonnière à la doublure, est pensé pour l'homme qui le porte.</p>
        <p>Pour les amateurs d'élégance classique, c'est une étape incontournable de notre carte.</p>
      `,
      date: "15 Mars 2026",
      author: "L'équipe Gentlemap",
      category: "Tailleur",
      image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 2,
      slug: "chez-ammar-caverne-alibaba-vintage",
      title: "Chez Ammar : La Caverne d'Alibaba du Vintage",
      excerpt: "Découvrez notre adresse favorite pour dénicher des costumes d'occasion et des pièces rares au cœur du 9ème arrondissement.",
      content: `
        <p>Au 13 Rue de la Grange Batelière, se cache l'un des secrets les mieux gardés des élégants parisiens : Chez Ammar. Loin des friperies classiques, cette boutique propose une sélection pointue de costumes d'occasion, de vestes de sport et d'accessoires de luxe.</p>
        <p>Ammar, le maître des lieux, possède un œil infaillible pour dénicher des pièces de grandes maisons à des prix accessibles. On y trouve souvent du Cifonelli (justement !), du Hermès ou du Charvet, patiemment sélectionnés pour leur état et leur style intemporel.</p>
        <p>C'est l'endroit idéal pour commencer une garde-robe classique sans se ruiner, ou pour trouver la pièce rare qui manque à votre collection. L'accueil y est toujours chaleureux, et les conseils d'Ammar sont précieux pour quiconque s'intéresse à l'histoire du vêtement.</p>
      `,
      date: "10 Mars 2026",
      author: "L'équipe Gentlemap",
      category: "Vintage",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 3,
      slug: "le-select-ame-de-montparnasse",
      title: "Le Select : L'Âme de Montparnasse",
      excerpt: "Retour sur l'histoire d'un café mythique où le temps semble s'être arrêté, entre littérature et élégance décontractée.",
      content: `
        <p>Le Select, au 99 Boulevard du Montparnasse, n'est pas qu'un simple café. C'est une institution qui a vu passer Hemingway, Picasso et Fitzgerald. Contrairement à ses voisins parfois trop touristiques, Le Select a su préserver son authenticité.</p>
        <p>Avec son comptoir en zinc, ses banquettes en cuir et ses serveurs en tablier blanc, l'ambiance y est restée celle du Paris des années 30. C'est l'endroit parfait pour lire un livre de la Librairie Galignani tout en dégustant un café ou un apéritif.</p>
        <p>L'élégance ici est discrète, presque nonchalante. C'est le lieu idéal pour observer la faune parisienne et se laisser porter par l'histoire littéraire du quartier.</p>
      `,
      date: "5 Mars 2026",
      author: "L'équipe Gentlemap",
      category: "Café",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800"
    }
  ];

  React.useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#blog/')) {
        const slug = hash.split('/')[1];
        const post = posts.find(p => p.slug === slug);
        if (post) {
          setSelectedPost(post);
        }
      } else if (hash === '#blog') {
        setSelectedPost(null);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handlePostSelect = (post: BlogPost) => {
    setSelectedPost(post);
    window.location.hash = `#blog/${post.slug}`;
  };

  const handleBackToList = () => {
    setSelectedPost(null);
    window.location.hash = '#blog';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 bg-bg overflow-y-auto"
    >
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-12 md:pb-24">
        <AnimatePresence mode="wait">
          {!selectedPost ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <header className="mb-20">
                <h1 className="text-6xl md:text-8xl font-serif italic text-ink mb-8 leading-tight">
                  Blog
                </h1>
                <p className="text-2xl md:text-3xl font-serif text-accent/80 leading-relaxed max-w-2xl">
                  Récits, rencontres et réflexions sur l'art de vivre et le beau.
                </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-24">
                {posts.map((post) => (
                  <article 
                    key={post.id} 
                    className="group cursor-pointer"
                    onClick={() => handlePostSelect(post)}
                  >
                    <div className="aspect-[4/5] overflow-hidden rounded-2xl mb-6 relative">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[9px] uppercase tracking-widest font-bold rounded-full">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest text-accent/60 font-bold">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {post.author}
                        </div>
                      </div>
                      <h2 className="text-2xl font-serif text-ink font-bold leading-snug">
                        {post.title}
                      </h2>
                      <p className="text-sm text-accent leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="pt-2 flex items-center gap-2 text-premium font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        Lire la suite <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto"
            >
              <button 
                onClick={handleBackToList}
                className="group flex items-center gap-2 text-accent hover:text-ink transition-colors mb-12"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span className="text-sm uppercase tracking-widest font-bold text-[10px]">Retour aux articles</span>
              </button>

              <div className="aspect-video overflow-hidden rounded-3xl mb-12">
                <img 
                  src={selectedPost.image} 
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-accent/60 font-bold mb-8">
                <span className="text-premium">{selectedPost.category}</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {selectedPost.date}
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {selectedPost.author}
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl font-serif italic text-ink mb-12 leading-tight">
                {selectedPost.title}
              </h1>

              {selectedPost.notebook_id && (
                <button 
                  onClick={() => onViewNotebook(selectedPost.notebook_id!)}
                  className="mb-12 flex items-center gap-3 px-8 py-4 bg-ink text-white rounded-full hover:bg-accent transition-all shadow-xl group"
                >
                  <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs uppercase tracking-[0.2em] font-bold">Voir le carnet d'adresses</span>
                </button>
              )}

              <div 
                className="prose prose-lg max-w-none text-accent leading-relaxed space-y-6 font-serif text-xl italic"
                dangerouslySetInnerHTML={{ __html: selectedPost.content }}
              />

              <div className="mt-20 pt-12 border-t border-border">
                <button 
                  onClick={() => setSelectedPost(null)}
                  className="text-premium font-bold text-xs uppercase tracking-widest hover:underline"
                >
                  Découvrir d'autres récits
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8 mt-24">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-4xl font-serif italic text-ink mb-2">Gentlemap</span>
            <p className="text-xs text-accent italic">La curation du beau au quotidien.</p>
          </div>
          <div className="flex gap-8">
            <a href="mailto:contact@gentlemap.com" className="text-[10px] uppercase tracking-widest font-bold text-accent hover:text-ink transition-colors">Contact</a>
            <a href="#" className="text-[10px] uppercase tracking-widest font-bold text-accent hover:text-ink transition-colors">Newsletter</a>
          </div>
        </footer>
      </div>
    </motion.div>
  );
};

export default BlogPage;
