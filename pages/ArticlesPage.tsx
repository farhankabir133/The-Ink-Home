import React, { useState, useMemo } from 'react';
import ArticleCard from '../components/ArticleCard';
import { articles } from '../constants/articles';

const ArticlesPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredArticles = useMemo(() => {
        if (!searchTerm) {
            return articles;
        }
        return articles.filter(article =>
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    return (
        <div className="opacity-0 animate-fadeInUp">
            <div className="bg-slate-50 dark:bg-gray-900/50 py-24 px-6 transition-colors duration-500">
                <div className="container mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-4 animate-scaleIn">
                        Our Stories
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto opacity-0 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                        Browse our collection of essays, reflections, and creative nonfiction.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-16">
                {/* Search Bar */}
                <div className="mb-12 max-w-2xl mx-auto">
                    <input
                        type="text"
                        placeholder="Search articles by title, author, or keyword..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-5 py-3 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-ink-accent transition-colors duration-500 shadow-sm"
                    />
                </div>

                {filteredArticles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredArticles.map((article, index) => (
                            <div key={article.id} className="opacity-0 animate-fadeInUp" style={{ animationDelay: `${index * 100}ms` }}>
                                <ArticleCard article={article} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-serif text-slate-700 dark:text-slate-200">No stories found.</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Try adjusting your search terms.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArticlesPage;