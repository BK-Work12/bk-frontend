'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  items: FAQItem[];
}

export function FAQSection({ title = 'Frequently asked questions.', items }: FAQSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // Split items into two columns
  const leftColumnItems = items.filter((_, index) => index % 2 === 0);
  const rightColumnItems = items.filter((_, index) => index % 2 !== 0);

  return (
    <section className="w-full max-w-[1320px] mx-auto lg:pt-18 pb-20.75 lg:pb-24.5 px-[15px] sm:px-6 lg:px-8" >
      <div className=" mx-auto">
        <h2 className=" leading-[100%] max-xxs:text-[54px] text-[32px] font-medium font-display text-[#000000] text-center mb-12" style={{ fontWeight: 500, fontFamily: 'var(--font-manrope)' }}>
          {title}
        </h2>

        <div className="flex flex-col md:flex-row md:gap-16">
          {/* LEFT COLUMN */}
          <div className="flex-1 flex flex-col ">
            {leftColumnItems.map((item) => (
              <FAQItemComponent
                key={item.id}
                item={item}
                isExpanded={expandedIds.has(item.id)}
                onToggle={() => toggleExpanded(item.id)}
              />
            ))}
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex-1 flex flex-col  mt-8 md:mt-0">
            {rightColumnItems.map((item) => (
              <FAQItemComponent
                key={item.id}
                item={item}
                isExpanded={expandedIds.has(item.id)}
                onToggle={() => toggleExpanded(item.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface FAQItemProps {
  item: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
}

function FAQItemComponent({ item, isExpanded, onToggle }: FAQItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState('0px');

  useEffect(() => {
    if (contentRef.current) {
      setMaxHeight(isExpanded ? `${contentRef.current.scrollHeight}px` : '0px');
    }
  }, [isExpanded]);

  return (
    <div className="border-b border-[#CDD7DF] flex flex-col">
      <button
        onClick={onToggle}
        className="w-full pr-4 py-6 flex items-center justify-between gap-4 text-left hover:bg-muted/50 transition-colors min-h-[105px]"
        aria-expanded={isExpanded}
      >
        <span className="text-[20px]   text-[#656565] font-normal font-ui flex-1 leading-snug">{item.question}</span>

        <div className={`shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          <Image
            width={1000}
            height={1000}
            className="max-w-full h-auto w-full"
            src={isExpanded ? '/assets/minus-sign (1).png' : '/assets/Button - Toggle Question.png'}
            alt={isExpanded ? 'Collapse' : 'Expand'}
          />
        </div>
      </button>

      <div ref={contentRef} className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight }}>
        <div className="pr-4 pb-6">
          <p className="text-sm text-[#656565] font-normal font-ui leading-relaxed">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}
