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
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/blog');
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPosts();
  }, []);

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

    if (posts.length > 0) {
      handleHash();
    }
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [posts]);

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
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-premium border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !selectedPost ? (
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
