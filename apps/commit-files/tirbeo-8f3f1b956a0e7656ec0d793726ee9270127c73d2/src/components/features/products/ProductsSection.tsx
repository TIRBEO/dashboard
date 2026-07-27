import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { useI18n } from '../../../lib/i18n';
import { useSiteConfig, bi } from '../../../lib/useSiteConfig';
import type { Product } from '../../../types';

const ProjectCard = ({ project, index, total }: { project: Product; index: number; total: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const targetScale = 1 - (total - 1 - index) * 0.03;
  const scale = useTransform(scrollYProgress, [0, 1], [targetScale, targetScale]);
  const { lang } = useI18n();
  const cat = bi(project.category, lang);
  const name = bi(project.name, lang);
  const cta = bi(project.cta, lang);

  return (
    <div ref={ref} className="h-[70vh] sm:h-[90vh] md:h-[88vh] sticky top-16 sm:top-20 md:top-28" style={{ top: `${index * 32}px` }}>
      <motion.div style={{ scale }} className="h-full rounded-[28px] sm:rounded-[40px] md:rounded-[60px] border border-[#FFFFFF]/20 bg-[#0c0c0c]/50 p-4 sm:p-8 md:p-12 flex flex-col gap-4 sm:gap-8 shadow-[0_40px_120px_-40px_rgba(216,216,224,0.35)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-5 md:gap-10">
            <span className="font-black text-[#FFFFFF] text-[clamp(2.5rem,12vw,170px)] leading-none">{project.n}</span>
            <div className="flex flex-col">
              {cat && <span className="uppercase tracking-widest text-[#FFFFFF]/60 text-[10px] sm:text-xs md:text-sm">{cat}</span>}
              <span className="font-medium uppercase text-[#FFFFFF] text-[clamp(1rem,3.5vw,3rem)] leading-tight mt-1">{name}</span>
            </div>
          </div>
          <a href={project.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full border-2 border-[#FFFFFF] text-[#FFFFFF] font-medium uppercase tracking-widest px-6 py-2.5 sm:px-10 sm:py-3.5 text-xs sm:text-base transition-all hover:bg-[#FFFFFF]/10 hover:-translate-y-0.5">
            {cta}
          </a>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 md:gap-8 flex-1 min-h-0">
          <div className="flex flex-col gap-4 sm:gap-5 md:gap-8 sm:flex-1 min-h-0" style={{ flexBasis: undefined }}>
            <div className="overflow-hidden rounded-[24px] sm:rounded-[40px] md:rounded-[60px] border border-[#FFFFFF]/10 flex-1 min-h-[120px] sm:min-h-0">
              <img src={project.col1Top} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700" />
            </div>
            <div className="overflow-hidden rounded-[24px] sm:rounded-[40px] md:rounded-[60px] border border-[#FFFFFF]/10 flex-1 min-h-[120px] sm:min-h-0">
              <img src={project.col1Bottom} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700" />
            </div>
          </div>
          <div className="flex-1 min-h-0 min-h-[200px] sm:min-h-0 overflow-hidden rounded-[24px] sm:rounded-[40px] md:rounded-[60px] border border-[#FFFFFF]/10">
            <img src={project.col2} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const ProductsSection = () => {
  const { lang } = useI18n();
  const cfg = useSiteConfig();
  const items = cfg.products.items;

  return (
    <section id="projects" className="relative px-5 sm:px-8 md:px-10 pt-24 sm:pt-32 md:pt-40 pb-28 sm:pb-32">
      <div className="reveal max-w-6xl mx-auto text-center mb-16 sm:mb-20 md:mb-28">
        <h2 className="silver-heading font-black uppercase leading-[0.95] tracking-tight text-[clamp(2rem,6vw,72px)]">
          {bi(cfg.products.heading, lang)}
        </h2>
      </div>

      <div className="max-w-6xl mx-auto">
        {items.map((p, i) => (
          <ProjectCard key={p.n} project={p} index={i} total={items.length} />
        ))}
      </div>
    </section>
  );
};

export default ProductsSection;
