import React, { useState, useEffect } from 'react';
import ArticleCard from '../components/ArticleCard';
import type { Article } from '../types';
import { mediumArticles } from '../constants/mediumArticles';

const ArticleCardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-slate-800/50 rounded-lg overflow-hidden shadow-sm h-full flex flex-col animate-pulse">
        <div className="w-full h-56 bg-slate-200 dark:bg-slate-700"></div>
        <div className="p-6 flex flex-col flex-grow">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-6"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 mb-4"></div>
            <div className="mt-auto pt-4 flex justify-between items-center">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            </div>
        </div>
    </div>
);


const MediumPage: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const extractImageUrl = (description: string, thumbnail: string): string => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = description;
        const imgTag = tempDiv.querySelector('img');
        if (imgTag && imgTag.src) {
            try {
                const url = new URL(imgTag.src);
                if (url.hostname === 'miro.medium.com') {
                    const pathParts = url.pathname.split('/');
                    if (pathParts.length > 2 && pathParts[2].startsWith('resize:')) {
                        pathParts[2] = 'resize:fit:800'; // Request a larger image for the card
                        url.pathname = pathParts.join('/');
                        return url.toString();
                    }
                }
                return imgTag.src;
            } catch (e) {
                console.error("Could not parse image URL from description", e);
                return imgTag.src; // Return src even if URL parsing fails
            }
        }
        // If no image in description, use the thumbnail. If no thumbnail, provide a placeholder.
        return thumbnail || `https://picsum.photos/seed/${Math.random()}/800/600`;
    };

    const parseDescription = (description: string): string => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = description;
        
        let contentElement = tempDiv.querySelector('p:nth-of-type(2)');
        if (!contentElement || contentElement.textContent.length < 50) {
            contentElement = Array.from(tempDiv.querySelectorAll('p')).find(p => p.textContent.length > 50) || tempDiv.querySelector('p');
        }

        let excerpt = (contentElement?.textContent || tempDiv.textContent || "").trim();
        
        if (!excerpt) {
            excerpt = (tempDiv.innerText || "").trim();
        }
        
        excerpt = excerpt.replace(/Continue reading on Medium »/g, '').trim();

        const maxLength = 150;
        if (excerpt.length > maxLength) {
            const trimmed = excerpt.substring(0, maxLength);
            return trimmed.substring(0, Math.min(trimmed.length, trimmed.lastIndexOf(' '))) + '...';
        }
        return excerpt;
    };

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fmedium.com%2Ffeed%2Fthe-ink-home');
                if (!response.ok) {
                    throw new Error('Network response was not ok. Could not reach content feed.');
                }
                const data = await response.json();

                if (data.status !== 'ok' || !data.items || data.items.length === 0) {
                    throw new Error(data.message || 'Failed to fetch Medium feed or the feed is empty.');
                }
                
                const fetchedArticles: Article[] = data.items
                    .filter((item: any) => item.title && item.link) // Ensure item is valid
                    .map((item: any, index: number) => ({
                    id: index + 101,
                    title: item.title,
                    author: item.author,
                    date: new Date(item.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                    excerpt: parseDescription(item.description),
                    imageUrl: extractImageUrl(item.description, item.thumbnail),
                    featured: true,
                    content: '',
                    tags: item.categories || [],
                    externalUrl: item.link,
                }));

                setArticles(fetchedArticles);
            } catch (err) {
                if (err instanceof Error) {
                    setError(`${err.message} Displaying a cached version of our stories for now.`);
                } else {
                    setError('An unknown error occurred. Displaying a cached version of our stories for now.');
                }
                setArticles(mediumArticles);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, index) => (
                        <ArticleCardSkeleton key={index} />
                    ))}
                </div>
            );
        }

        if (articles.length === 0) {
            return (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
                    <h2 className="text-2xl font-serif text-slate-700 dark:text-slate-300">No stories found</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">We couldn't find any stories on Medium at the moment. Please check back later.</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article, index) => (
                    <div key={article.id} className="opacity-0 animate-fadeInUp" style={{ animationDelay: `${(index * 150) + 100}ms` }}>
                        <ArticleCard article={article} />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="opacity-0 animate-fadeInUp">
            <div className="bg-slate-50 dark:bg-gray-900/50 py-24 px-6 transition-colors duration-500">
                <div className="container mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-4 animate-scaleIn">
                        Find us on Medium
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto opacity-0 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                        Follow our journey and read our latest stories directly on Medium. Join our community of readers and writers.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-16">
                <div className="text-center mb-16 opacity-0 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
                    <a 
                        href="https://medium.com/the-ink-home"
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block bg-ink-accent text-white px-8 py-4 rounded-md hover:bg-opacity-90 transition-transform active:scale-95 font-semibold text-lg"
                    >
                        Visit The Ink Home on Medium
                    </a>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">You will be redirected to an external site.</p>
                </div>

                <section>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-slate-800 dark:text-slate-100 mb-4">
                        Our Latest Stories
                    </h2>
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
                        New stories from Medium may take up to an hour to appear here. If our latest post isn't showing, please check back soon.
                    </p>

                    {error && (
                        <div className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 max-w-4xl mx-auto">
                            <p className="text-center text-yellow-800 dark:text-yellow-200">
                                <span className="font-semibold">Heads up:</span> {error}
                            </p>
                        </div>
                    )}

                    {renderContent()}
                </section>
            </div>
        </div>
    );
};

export default MediumPage;