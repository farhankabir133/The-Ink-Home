import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

const InkRevealSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Synchronously clean up previous PIXI app's view.
    // This is a robust pattern for React 19's StrictMode where effects re-run.
    container.innerHTML = '';

    const app = new PIXI.Application({
      resizeTo: container,
      backgroundColor: 0x1a1a1a, // Corresponds to ink-dark
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
    });
    container.appendChild(app.view);

    const inkContainer = new PIXI.Container();
    app.stage.addChild(inkContainer);

    const colors = [0xa38b77, 0x6b7280, 0xf8f8f8, 0x475569]; 
    const blobs: PIXI.Graphics[] = [];

    for (let i = 0; i < 40; i++) {
      const blob = new PIXI.Graphics();
      const color = colors[Math.floor(Math.random() * colors.length)];
      blob.beginFill(color, 0.7);
      const radius = container.clientWidth > 768 ? Math.random() * 80 + 40 : Math.random() * 40 + 20;
      blob.drawCircle(0, 0, radius);
      blob.endFill();
      blob.x = Math.random() * app.screen.width;
      blob.y = Math.random() * app.screen.height;
      inkContainer.addChild(blob);
      blobs.push(blob);
    }

    const text = new PIXI.Text('The Ink Home', {
      fontFamily: 'Playfair Display, serif',
      fontSize: 150, // Initial size, will be updated by resize handler
      fill: 0xffffff,
      fontWeight: 'bold',
      align: 'center',
      wordWrap: true,
    });
    text.anchor.set(0.5);
    text.alpha = 0;
    app.stage.addChild(text);

    inkContainer.mask = text;
    const blurFilter = new PIXI.BlurFilter(15);
    inkContainer.filters = [blurFilter];

    app.ticker.add(() => {
      blobs.forEach((blob, i) => {
        blob.x += Math.sin((app.ticker.elapsedMS / 1000 + i * 0.2)) * 0.4;
        blob.y += Math.cos((app.ticker.elapsedMS / 1000 + i * 0.2)) * 0.4;
      });
    });

    const tl = gsap.timeline();
    tl.to(inkContainer, { alpha: 1, duration: 2.5, ease: 'power2.out' })
      .to(text, { alpha: 1, duration: 2.5, ease: 'power3.inOut' }, "-=2")
      .to(blurFilter, { blur: 5, duration: 3.5, ease: 'power2.out' }, "-=1")
      .to(inkContainer, { alpha: 0.8, duration: 4 }, "-=3.5");

    const handleResize = (width: number, height: number) => {
        text.style.fontSize = width > 768 ? 150 : 80;
        text.style.wordWrapWidth = width * 0.9;
        text.x = width / 2;
        text.y = height / 2;
    };
    
    app.renderer.on('resize', handleResize);
    handleResize(app.screen.width, app.screen.height); // Set initial position

    return () => {
      tl.kill();
      app.renderer.off('resize', handleResize);
      // The app.destroy() call is crucial for releasing WebGL context and other resources.
      app.destroy(true, { children: true, texture: true });
    };
  }, []);

  return (
    <section className="relative h-screen overflow-hidden bg-ink-dark">
      <div ref={containerRef} className="absolute inset-0 w-full h-full"></div>
    </section>
  );
};

export default InkRevealSection;