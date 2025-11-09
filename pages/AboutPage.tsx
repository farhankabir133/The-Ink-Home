import React from 'react';

const editors = [
    { name: 'Farhan Kabir', role: 'Founder & Editor-in-Chief', imageUrl: 'https://images.pexels.com/photos/34067041/pexels-photo-34067041.png' },
    { name: 'Dua Batool', role: 'Lead Editor', imageUrl: 'https://images.pexels.com/photos/27603289/pexels-photo-27603289.jpeg' }
];

const AboutPage: React.FC = () => {
    return (
        <div className="opacity-0 animate-fadeInUp">
            <div className="bg-slate-50 dark:bg-gray-900/50 py-24 px-6 transition-colors duration-500">
                <div className="container mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-4 animate-scaleIn">
                        About The Ink Home
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto opacity-0 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                        We believe stories are the threads that connect us. The Ink Home is a sanctuary for creative essays, heartfelt reflections, and the quiet human stories that often go untold.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-16">
                <div className="max-w-4xl mx-auto space-y-8 text-lg leading-relaxed text-slate-700 dark:text-slate-300 opacity-0 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
                    <p>
                        Founded in 2025, The Ink Home was born from a simple desire: to create a space on the internet that feels warm, thoughtful, and deeply personal. In a world of noise, we seek the quiet. In an era of speed, we cherish the slow-cooked thought. Our publication is a celebration of introspection, vulnerability, and the art of paying attention to the small, beautiful details of life.
                    </p>
                    <p>
                        Our editorial philosophy is guided by a love for craft and a respect for the reader's time. We publish stories that are honest, well-crafted, and leave you with a feeling of warmth or a new perspective. We're not chasing trends; we're building a timeless library of human experience.
                    </p>
                    <p>
                        Whether you're a writer looking to share your voice or a reader searching for a quiet corner to reflect, we welcome you. This is a place for stories that feel like coming home.
                    </p>
                </div>

                <section className="mt-20">
                    <h2 className="text-4xl font-serif font-bold text-center text-slate-800 dark:text-slate-100 mb-12 animate-scaleIn">
                        Meet the Editors
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
                        {editors.map((editor, index) => (
                            <div key={editor.name} className="text-center opacity-0 animate-fadeInUp" style={{ animationDelay: `${index * 150}ms`}}>
                                <img src={editor.imageUrl} alt={editor.name} className="w-40 h-40 rounded-full mx-auto mb-4 object-cover shadow-lg" />
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{editor.name}</h3>
                                <p className="text-ink-secondary dark:text-slate-400">{editor.role}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AboutPage;