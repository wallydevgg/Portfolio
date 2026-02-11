import { useInsertionEffect } from 'react';

export function GoogleFontsOptimizer() {
  useInsertionEffect(() => {
    const links = [
      { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com', crossorigin: true },
    ];

    links.forEach(link => {
      const element = document.createElement('link');
      Object.keys(link).forEach(key => element[key] = link[key]);
      document.head.appendChild(element);
    });

    return () => {
      links.forEach(link => {
        const elements = document.querySelectorAll(`link[rel="${link.rel}"]`);
        elements.forEach(element => element.remove());
      });
    };
  }, []);

  return null;
}
