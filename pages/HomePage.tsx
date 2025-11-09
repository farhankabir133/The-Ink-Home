import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import { articles } from '../constants/articles';

const HomePage: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const featuredArticles = articles.filter(a => a.featured);
  const latestArticles = articles.filter(a => !a.featured).slice(0, 4);

  return (
    <div className={`${mounted ? 'opacity-100 animate-fadeInUp' : 'opacity-0'}`}>
      {/* Hero Section */}
      <section className="relative h-[70vh] sm:h-[60vh] flex items-center justify-center text-center px-6 overflow-hidden bg-ink-dark">
        <img 
          src="https://images.pexels.com/photos/34626352/pexels-photo-34626352.png"
          alt="Writing desk"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-dark/80 via-transparent to-transparent"></div>

        <div className="relative z-10 max-w-4xl">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-white mb-4 tracking-tight">
            Where Words Feel At Home
          </h1>
          <p className="text-xl md:text-2xl font-light text-slate-200">
            Stories that feel like home.
          </p>
        </div>
      </section>

      {/* Featured Stories */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-slate-800 dark:text-slate-100 mb-12">
          Featured Stories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredArticles.map((article, idx) => (
            <div key={article.id} className="opacity-0 animate-fadeInUp" style={{ animationDelay: `${idx * 150}ms` }}>
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
      </div>

        {/* Scrolling Carousel Section */}
      <section className="py-20 bg-slate-50 dark:bg-gray-900/50 overflow-hidden">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-slate-800 dark:text-slate-100 mb-12">
          Inspiration Gallery
        </h2>
        <div className="relative w-full overflow-hidden group">
            <div className="flex animate-marquee group-hover:[animation-play-state:paused] will-change-transform">
                {[...articles, ...articles].map((article, index) => (
                    <Link 
                        key={`${article.id}-${index}`} 
                        to={`/articles/${article.id}`}
                        className="relative flex-shrink-0 w-80 h-96 mx-4 rounded-lg overflow-hidden shadow-lg group/item"
                    >
                        <img 
                            src={article.imageUrl} 
                            alt={article.title} 
                            className="w-full h-full object-cover transition-transform duration-3000 ease-in-out group-hover/item:scale-105"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                        <div className="absolute inset-0 p-6 flex flex-col justify-end">
                            <h3 className="font-serif text-2xl font-bold text-white leading-tight">
                                {article.title}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
      </section>

      {/* Latest Articles */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-slate-800 dark:text-slate-100 mb-12">
          Latest Articles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {latestArticles.map((article, idx) => (
            <Link key={article.id} to={`/articles/${article.id}`} className="group block opacity-0 animate-fadeInUp" style={{ animationDelay: `${idx * 150}ms` }}>
              <article>
                <div className="overflow-hidden rounded-lg mb-4 shadow-sm">
                  <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy"/>
                </div>
                <h3 className="font-serif text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-ink-accent transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">By {article.author}</p>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
