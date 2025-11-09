import React from 'react';
import { Link } from 'react-router-dom';
import type { Article } from '../types';

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const cardContent = (
    <article className="bg-white dark:bg-slate-800/50 rounded-lg overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 ease-in-out transform hover:-translate-y-1 h-full flex flex-col">
      <div className="overflow-hidden">
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
          loading="lazy"
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-serif text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-ink-accent">
          {article.title}
        </h3>
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          <span>By {article.author}</span> &middot; <span>{article.date}</span>
        </div>
        <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed flex-grow">
          {article.excerpt}
        </p>
        <div className="flex justify-between items-center mt-auto pt-4">
            <div className="font-semibold text-ink-accent inline-block">
              Read More <span className="inline-block group-hover:translate-x-1 transition-transform duration-300 ease-in-out">&rarr;</span>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 italic">Featured on Medium</span>
        </div>
      </div>
    </article>
  );

  if (article.externalUrl) {
    return (
      <a href={article.externalUrl} target="_blank" rel="noopener noreferrer" className="block group h-full">
        {cardContent}
      </a>
    );
  }

  return (
    <Link to={`/publication/${article.id}`} className="block group h-full">
      {cardContent}
    </Link>
  );
};

export default ArticleCard;