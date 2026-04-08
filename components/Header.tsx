import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useDarkMode, type ThemePreference, type ResolvedTheme } from '../hooks/useDarkMode';

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const InkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 014-4h0a4 4 0 014 4v2H7v-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3s4 3.6 4 7a4 4 0 11-8 0c0-3.4 4-7 4-7z" />
    </svg>
);

const AutoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3a6.75 6.75 0 104.5 12.3A7.5 7.5 0 1018 3.5a5.75 5.75 0 01-8.25-.5z" />
    </svg>
);

// Animated feather quill icon for branding
const QuillIcon = () => (
    <svg className="w-7 h-7 text-ink-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
        <line x1="16" y1="8" x2="2" y2="22" />
        <line x1="17.5" y1="15" x2="9" y2="15" />
    </svg>
);

const socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com', icon: <span className="text-[10px] font-bold tracking-wide">X</span> },
    { name: 'Medium', href: 'https://medium.com/the-ink-home', icon: <span className="text-[10px] font-bold tracking-wide">M</span> },
    { name: 'GitHub', href: 'https://github.com/farhankabir133', icon: <span className="text-[10px] font-bold tracking-wide">GH</span> },
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: <span className="text-[10px] font-bold tracking-wide">in</span> },
];

const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/publication', label: 'Publication' },
    { path: '/medium', label: 'Medium' },
    { path: '/contact', label: 'Contact' },
];

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED NAV LINK COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface NavItemProps {
    to: string;
    label: string;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <NavLink
            to={to}
            onClick={onClick}
            className="interactive-lift group relative px-4 py-2 font-medium text-sm tracking-wide uppercase"
        >
            {/* Text with hover effect */}
            <span className={`relative z-10 transition-colors duration-300 ${
                isActive 
                    ? 'text-ink-accent' 
                    : 'text-slate-600 dark:text-slate-300 group-hover:text-ink-accent'
            }`}>
                {label}
            </span>
            
            {/* Animated underline */}
            <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-transparent via-ink-accent to-transparent transition-all duration-300 ease-out ${
                isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-70'
            }`} />
            
            {/* Glow effect on active */}
            {isActive && (
                <span className="absolute inset-0 -z-10 bg-ink-accent/5 dark:bg-ink-accent/10 rounded-lg blur-sm" />
            )}
        </NavLink>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// HAMBURGER MENU COMPONENT (Animated)
// ─────────────────────────────────────────────────────────────────────────────

interface HamburgerProps {
    isOpen: boolean;
    toggle: () => void;
    controlsId: string;
}

const Hamburger: React.FC<HamburgerProps> = ({ isOpen, toggle, controlsId }) => (
    <button
        onClick={toggle}
    className="interactive-lift relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-ink-accent/10 dark:hover:bg-ink-accent/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ink-accent/50"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        aria-controls={controlsId}
    >
        <div className="w-5 h-4 flex flex-col justify-between">
            <span className={`block h-0.5 bg-slate-700 dark:bg-slate-200 rounded-full transform transition-all duration-300 origin-center ${isOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block h-0.5 bg-slate-700 dark:bg-slate-200 rounded-full transition-all duration-200 ${isOpen ? 'opacity-0 scale-x-0' : 'opacity-100'}`} />
            <span className={`block h-0.5 bg-slate-700 dark:bg-slate-200 rounded-full transform transition-all duration-300 origin-center ${isOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </div>
    </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// SOCIAL LINK COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface SocialLinkProps {
    href: string;
    icon: React.ReactNode;
    name: string;
}

const SocialLink: React.FC<SocialLinkProps> = ({ href, icon, name }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
    className="interactive-lift group relative p-2.5 rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-ink-accent hover:bg-ink-accent/10 dark:hover:bg-ink-accent/20 transition-all duration-300 hover:scale-110"
        aria-label={name}
    >
        <span className="relative z-10">{icon}</span>
        {/* Tooltip */}
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium text-white bg-slate-800 dark:bg-slate-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            {name}
        </span>
    </a>
);

// ─────────────────────────────────────────────────────────────────────────────
// THEME TOGGLE BUTTON
// ─────────────────────────────────────────────────────────────────────────────

interface ThemeToggleProps {
    themePreference: ThemePreference;
    resolvedTheme: ResolvedTheme;
    cycleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ themePreference, resolvedTheme, cycleTheme }) => {
    const modeLabel = themePreference.charAt(0).toUpperCase() + themePreference.slice(1);

    const icon = themePreference === 'auto'
        ? <AutoIcon />
        : themePreference === 'ink'
        ? <InkIcon />
        : resolvedTheme === 'dark'
        ? <MoonIcon />
        : <SunIcon />;

    return (
    <button
        onClick={cycleTheme}
    className="interactive-lift relative p-2.5 rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:text-ink-accent hover:bg-ink-accent/10 dark:hover:bg-ink-accent/20 transition-all duration-300 hover:scale-110 hover:rotate-12"
        aria-label={`Theme mode: ${modeLabel}. Activate to cycle mode.`}
        title={`Theme: ${modeLabel}`}
    >
        <div className="relative w-5 h-5 flex items-center justify-center">
            <span className="absolute inset-0 flex items-center justify-center transition-all duration-300 opacity-100 rotate-0">
                {icon}
            </span>
        </div>

        <span className="absolute -bottom-1.5 -right-1.5 rounded-full bg-ink-accent px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">
            {themePreference === 'auto' ? 'A' : themePreference.charAt(0)}
        </span>
    </button>
);
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HEADER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const Header: React.FC = () => {
    const { pathname } = useLocation();
    const { themePreference, resolvedTheme, cycleTheme } = useDarkMode();
    const [isSticky, setSticky] = useState(false);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const headerRef = useRef<HTMLElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setSticky(window.scrollY > 20);
            
            // Calculate scroll progress
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            setScrollProgress(scrolled || 0);
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    // Escape key + focus trap for mobile menu
    useEffect(() => {
        if (!isMenuOpen) return;

        const menuEl = mobileMenuRef.current;
        if (!menuEl) return;

        const focusable = menuEl.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        first?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                setMenuOpen(false);
                return;
            }

            if (e.key !== 'Tab' || focusable.length === 0) return;

            const active = document.activeElement as HTMLElement | null;
            if (e.shiftKey && active === first) {
                e.preventDefault();
                last?.focus();
            } else if (!e.shiftKey && active === last) {
                e.preventDefault();
                first?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isMenuOpen]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    return (
        <>
            <header
                ref={headerRef}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
                    isSticky 
                        ? 'py-2 bg-white/90 dark:bg-ink-dark/90 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20' 
                        : 'py-4 bg-transparent'
                }`}
            >
                {/* Scroll Progress Bar */}
                <div 
                    className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-ink-accent via-ink-accent/80 to-ink-accent transition-all duration-150 ease-out"
                    style={{ width: `${scrollProgress}%` }}
                />
                
                {/* Decorative top border glow */}
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ink-accent/30 to-transparent transition-opacity duration-500 ${isSticky ? 'opacity-100' : 'opacity-0'}`} />

                <nav className="max-w-7xl mx-auto px-6 lg:px-10 flex justify-between items-center">
                    {/* ─── Logo ─── */}
                    <NavLink 
                        to="/" 
                        className="group flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02]"
                    >
                        <div className="relative">
                            <QuillIcon />
                            {/* Glow effect */}
                            <span className="absolute inset-0 bg-ink-accent/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl lg:text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                                The Ink Home
                            </span>
                            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-accent/80 hidden sm:block">
                                Stories that feel like home
                            </span>
                        </div>
                    </NavLink>

                    {/* ─── Desktop Navigation ─── */}
                    <div className="hidden lg:flex items-center">
                        {/* Nav Links Container */}
                        <div className="flex items-center bg-slate-50/50 dark:bg-slate-800/30 rounded-full px-2 py-1 border border-slate-200/50 dark:border-slate-700/50">
                            {navItems.map((item) => (
                                <NavItem key={item.path} to={item.path} label={item.label} />
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="mx-6 h-8 w-px bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

                        {/* Social Links */}
                        <div className="flex items-center gap-2">
                            {socialLinks.map((item) => (
                                <SocialLink key={item.name} href={item.href} icon={item.icon} name={item.name} />
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="mx-4 h-8 w-px bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

                        {/* Theme Toggle */}
                        <ThemeToggle themePreference={themePreference} resolvedTheme={resolvedTheme} cycleTheme={cycleTheme} />
                    </div>

                    {/* ─── Mobile Controls ─── */}
                    <div className="lg:hidden flex items-center gap-3">
                        <ThemeToggle themePreference={themePreference} resolvedTheme={resolvedTheme} cycleTheme={cycleTheme} />
                        <Hamburger
                            isOpen={isMenuOpen}
                            toggle={() => setMenuOpen(!isMenuOpen)}
                            controlsId="mobile-menu-panel"
                        />
                    </div>
                </nav>
            </header>

            {/* ─── Mobile Menu Overlay ─── */}
            <div 
                className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${
                    isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                {/* Backdrop */}
                <div 
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setMenuOpen(false)}
                />
                
                {/* Menu Panel */}
                <div 
                    id="mobile-menu-panel"
                    ref={mobileMenuRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Mobile navigation menu"
                    className={`absolute top-0 right-0 w-full max-w-sm h-full bg-white dark:bg-ink-dark shadow-2xl transform transition-transform duration-500 ease-out ${
                        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    {/* Menu Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-lg font-serif font-bold text-slate-800 dark:text-slate-100">Menu</span>
                        <button
                            onClick={() => setMenuOpen(false)}
                            className="interactive-lift p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Nav Links */}
                    <div className="p-6 space-y-2">
                        {navItems.map((item, index) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setMenuOpen(false)}
                                className={({ isActive }) => `
                                    block px-4 py-3 rounded-xl text-lg font-medium transition-all duration-300
                                    ${isActive 
                                        ? 'bg-ink-accent/10 text-ink-accent border-l-4 border-ink-accent' 
                                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:pl-6'
                                    }
                                `}
                                style={{ transitionDelay: `${index * 50}ms` }}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </div>

                    {/* Social Links */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs uppercase tracking-widest text-slate-400 mb-4">Connect with us</p>
                        <div className="flex items-center gap-3">
                            {socialLinks.map((item) => (
                                <SocialLink key={item.name} href={item.href} icon={item.icon} name={item.name} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Spacer to prevent content from going under fixed header */}
            <div className="h-20 lg:h-24" />
        </>
    );
};

export default Header;