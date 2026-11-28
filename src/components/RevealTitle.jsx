import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../lib/scroll';

gsap.registerPlugin(ScrollTrigger);

// Judul yang muncul kata demi kata saat digulir ke layar (GSAP + ScrollTrigger).
// Kata dipecah oleh React sendiri (bukan SplitText) supaya teks yang berubah tidak merusak DOM.
export default function RevealTitle({ children, className = '', as: Tag = 'h2' }) {
  const ref = useRef(null);
  const text = String(children);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap.from('[data-word]', {
        yPercent: 110,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.07,
        scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true },
      });
    }, ref);
    return () => ctx.revert();
  }, [text]);

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {text.split(' ').map((word, i) => (
        <React.Fragment key={i}>
          {i > 0 && ' '}
          <span aria-hidden="true" className="inline-block overflow-hidden align-bottom pb-[0.2em] -mb-[0.2em]">
            <span data-word className="inline-block">{word}</span>
          </span>
        </React.Fragment>
      ))}
    </Tag>
  );
}
