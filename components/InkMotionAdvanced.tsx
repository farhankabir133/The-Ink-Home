import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const InkMotionAdvanced: React.FC = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = section.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width * 2 - 1;
            const y = (e.clientY - rect.top) / rect.height * 2 - 1;

            gsap.to(containerRef.current, {
                rotationY: x * 8,
                rotationX: -y * 8,
                ease: 'power1.out',
                duration: 1.2,
                transformPerspective: 900,
            });
        };

        const handleMouseLeave = () => {
            gsap.to(containerRef.current, {
                rotationY: 0,
                rotationX: 0,
                ease: 'power3.out',
                duration: 1,
            });
        };

        section.addEventListener('mousemove', handleMouseMove);
        section.addEventListener('mouseleave', handleMouseLeave);
        
        gsap.fromTo(
            containerRef.current,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 }
        );


        return () => {
            section.removeEventListener('mousemove', handleMouseMove);
            section.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <section 
            ref={sectionRef}
            className="relative w-full h-[500px] flex items-center justify-center overflow-hidden bg-ink-light dark:bg-ink-dark transition-colors duration-500"
            style={{ perspective: '1000px' }}
            aria-label="Interactive illustration of The Ink Home"
        >
            <div ref={containerRef} className="relative w-11/12 md:w-3/5 max-w-4xl will-change-transform">
                <img 
                    src="https://i.ibb.co/Q8M9S2V/house-illustration.jpg" 
                    alt="Illustration of a quaint house with trees and a large sun."
                    className="w-full h-auto rounded-lg shadow-2xl dark:shadow-black/30"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                     <h2 
                        className="text-4xl md:text-6xl font-serif text-slate-800/80 font-bold pointer-events-none" 
                        style={{ textShadow: '0px 1px 10px rgba(255,255,255,0.3)' }}
                    >
                        The Ink Home
                    </h2>
                </div>
            </div>
        </section>
    );
};

export default InkMotionAdvanced;
