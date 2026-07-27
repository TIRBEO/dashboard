import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

const IMAGES = [
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  ''
];

const Tile = ({ src }: { src: string }) => (
  <div className="shrink-0 overflow-hidden rounded-[1.6rem] border border-[#FFFFFF]/12 shadow-[0_24px_60px_-30px_rgba(216,216,224,0.45)]">
    <img
      src={src}
      alt=""
      loading="lazy"
      className="h-[clamp(220px,28vw,400px)] w-[clamp(360px,46vw,640px)] object-cover transition-transform duration-700 hover:scale-[1.04]"
    />
  </div>
);

export const MarqueeSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const offset = useTransform(scrollY, () => {
    const el = ref.current;
    if (!el) return 0;
    const sectionTop = el.getBoundingClientRect().top + window.scrollY;
    return (window.scrollY - sectionTop + window.innerHeight) * 0.3;
  });

  const row1X = useTransform(offset, (o) => o - 200);
  const row2X = useTransform(offset, (o) => -(o - 200));

  const row1 = IMAGES.slice(0, 11);
  const row2 = IMAGES.slice(11);

  return (
    <section ref={ref} className="relative bg-transparent pt-28 sm:pt-36 md:pt-44 pb-16 sm:pb-20 overflow-hidden">
      {/* Edge fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-[#0c0c0c] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-[#0c0c0c] to-transparent z-10" />

      <div className="relative z-10 px-6 mb-12 sm:mb-16 md:mb-20 max-w-6xl mx-auto">
        <h2 className="reveal silver-heading font-black uppercase leading-[0.95] tracking-tight mt-5 text-[clamp(2rem,6vw,72px)]">
          Motion in motion
        </h2>
      </div>

      <div className="flex flex-col gap-5 sm:gap-7">
        <motion.div className="flex gap-5 sm:gap-7" style={{ x: row1X, willChange: 'transform' }}>
          {[...row1, ...row1, ...row1].map((src, i) => (
            <Tile key={`r1-${i}`} src={src} />
          ))}
        </motion.div>
        <motion.div className="flex gap-5 sm:gap-7" style={{ x: row2X, willChange: 'transform' }}>
          {[...row2, ...row2, ...row2].map((src, i) => (
            <Tile key={`r2-${i}`} src={src} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default MarqueeSection;
