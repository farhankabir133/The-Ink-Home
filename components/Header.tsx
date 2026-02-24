import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useDarkMode } from '../hooks/useDarkMode';

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const socialLinks = [
    { name: 'Twitter', href: '#', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg> },
    { name: 'Medium', href: '#', icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7.45 2.68H4V21.31h3.45V2.68zM20 2.68h-3.45v18.63H20V2.68zM14.48 2.68h-4.96v18.63h4.96V2.68z"></path></svg> },
    { name: 'GitHub', href: '#', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.164 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" /></svg> },
    { name: 'Facebook', href: '#', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg> },
    { name: 'LinkedIn', href: '#', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> },
];

const Header: React.FC = () => {
    const [theme, toggleTheme] = useDarkMode();
    const [isSticky, setSticky] = useState(false);
    const [isMenuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setSticky(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const navLinkClasses = "px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-ink-accent dark:hover:text-ink-accent transition-colors";
    const activeNavLinkClasses = "text-ink-accent dark:text-ink-accent font-semibold";

    return (
        <header className={`sticky top-0 z-50 transition-all duration-300 ${isSticky ? 'bg-white/80 dark:bg-ink-dark/80 backdrop-blur-sm shadow-md' : 'bg-transparent'}`}>
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <NavLink to="/" className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100">
                    The Ink Home
                </NavLink>
                <div className="hidden md:flex items-center space-x-4">
                    <NavLink to="/" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses}>Home</NavLink>
                    <NavLink to="/about" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses}>About</NavLink>
                    <NavLink to="/publication" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses}>Publication</NavLink>
                    <NavLink to="/medium" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses}>Medium</NavLink>
                    <NavLink to="/contact" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses}>Contact</NavLink>
                    <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-2"></div>
                    {socialLinks.map((item) => (
                        <a key={item.name} href={item.href} className="text-slate-500 dark:text-slate-400 hover:text-ink-accent dark:hover:text-ink-accent transition-colors">
                            <span className="sr-only">{item.name}</span>
                            {item.icon}
                        </a>
                    ))}
                    <button onClick={toggleTheme} className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                    </button>
                </div>
                <div className="md:hidden flex items-center">
                     <button onClick={toggleTheme} className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors mr-2">
                        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                    </button>
                    <button onClick={() => setMenuOpen(!isMenuOpen)} className="text-slate-800 dark:text-slate-100 focus:outline-none">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
                        </svg>
                    </button>
                </div>
            </nav>
            {isMenuOpen && (
                <div className="md:hidden bg-white dark:bg-ink-dark pb-4">
                    <NavLink to="/" className="block text-center py-2 text-lg text-slate-600 dark:text-slate-300" onClick={() => setMenuOpen(false)}>Home</NavLink>
                    <NavLink to="/about" className="block text-center py-2 text-lg text-slate-600 dark:text-slate-300" onClick={() => setMenuOpen(false)}>About</NavLink>
                    <NavLink to="/publication" className="block text-center py-2 text-lg text-slate-600 dark:text-slate-300" onClick={() => setMenuOpen(false)}>Publication</NavLink>
                    <NavLink to="/medium" className="block text-center py-2 text-lg text-slate-600 dark:text-slate-300" onClick={() => setMenuOpen(false)}>Medium</NavLink>
                    <NavLink to="/contact" className="block text-center py-2 text-lg text-slate-600 dark:text-slate-300" onClick={() => setMenuOpen(false)}>Contact</NavLink>
                    <div className="border-t border-slate-200 dark:border-slate-700 my-4"></div>
                    <div className="flex justify-center items-center space-x-6">
                        {socialLinks.map((item) => (
                            <a key={item.name} href={item.href} className="text-slate-500 dark:text-slate-400 hover:text-ink-accent dark:hover:text-ink-accent transition-colors">
                                <span className="sr-only">{item.name}</span>
                                {item.icon}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;