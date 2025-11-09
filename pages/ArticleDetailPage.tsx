import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { articles } from '../constants/articles';

const ArticleDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const article = articles.find(a => a.id === parseInt(id || ''));

    if (!article) {
        return (
            <div className="container mx-auto px-6 py-16 text-center animate-fadeInUp">
                <h1 className="text-4xl font-serif font-bold">Article not found</h1>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">The story you're looking for doesn't exist or has been moved.</p>
                <Link to="/publication" className="mt-8 inline-block bg-ink-accent text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition-transform active:scale-95 font-semibold">
                    Browse All Articles
                </Link>
            </div>
        );
    }

    const contentParagraphs = article.content.split('\n').filter(p => p.trim() !== '');

    return (
        <div className="opacity-0 animate-fadeInUp">
            {/* Article Header */}
            <header className="relative h-[60vh] min-h-[400px] flex items-end justify-center text-white text-center px-6 py-12">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
                <img src={article.imageUrl} alt={article.title} className="absolute inset-0 w-full h-full object-cover -z-10" />
                <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="flex items-center justify-center flex-wrap gap-2 mb-4">
                        {article.tags.map(tag => (
                            <span key={tag} className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">{tag}</span>
                        ))}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 tracking-tight">
                        {article.title}
                    </h1>
                    <div className="text-lg text-slate-200">
                        <span>By {article.author}</span> &middot; <span>{article.date}</span>
                    </div>
                </div>
            </header>

            {/* Article Content */}
            <div className="bg-ink-light dark:bg-ink-dark transition-colors duration-500">
                <div className="container mx-auto px-6 py-16 lg:py-24">
                    <article className="prose prose-lg lg:prose-xl dark:prose-invert mx-auto prose-p:leading-relaxed prose-headings:font-serif">
                        {contentParagraphs.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </article>

                    <div className="text-center mt-16 pt-8 border-t border-slate-200 dark:border-slate-700 max-w-prose mx-auto">
                        <Link to="/publication" className="font-semibold text-ink-accent hover:underline inline-flex items-center gap-2 group">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:-translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Back to all articles
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleDetailPage;