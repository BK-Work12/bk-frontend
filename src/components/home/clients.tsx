'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

interface Testimonial {
  id: number;
  image: string;
  quote: string;
  date: string;
  name: string;
  title: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    image: '/assets/6756 1.png',
    quote:
      'I have been a Varntix user for 4 years by now. The interaction with the platform remained always very good and the customer support was prompt and efficient throughout.',
    date: '06/25/2023',
    name: 'John Doe',
    title: 'CEO Google',
    rating: 5,
  },
  {
    id: 2,
    image: '/assets/6756 1.png',
    quote:
      'I have been a Varntix user for 4 years by now. The interaction with the platform remained always very good and the customer support was prompt and efficient throughout.',
    date: '06/25/2023',
    name: 'John Doe',
    title: 'CEO Google',
    rating: 5,
  },
  {
    id: 3,
    image: '/assets/6756 1.png',
    quote:
      'I have been a Varntix user for 4 years by now. The interaction with the platform remained always very good and the customer support was prompt and efficient throughout.',
    date: '06/25/2023',
    name: 'John Doe',
    title: 'CEO Google',
    rating: 5,
  },
  {
    id: 4,
    image: '/assets/6756 1.png',
    quote:
      'I have been a Varntix user for 4 years by now. The interaction with the platform remained always very good and the customer support was prompt and efficient throughout.',
    date: '06/25/2023',
    name: 'John Doe',
    title: 'CEO Google',
    rating: 5,
  },
];

export default function Clients() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [itemsPerView, setItemsPerView] = useState(2);

  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Detect mobile / desktop
  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(window.innerWidth < 768 ? 1 : 2);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Autoplay
  useEffect(() => {
    if (!isAutoPlay) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1 >= testimonials.length - itemsPerView + 1 ? 0 : prev + 1));
    }, 5000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlay, itemsPerView]);

  const handlePrev = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - itemsPerView : prev - 1));
  };

  const handleNext = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev + 1 >= testimonials.length - itemsPerView + 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index: number) => {
    setIsAutoPlay(false);
    setCurrentIndex(index);
  };

  // Use ceil to fix last dot issue
  const maxDots = Math.ceil(testimonials.length / itemsPerView);

  // Slide width depends on items per view
  const slideWidth = itemsPerView === 1 ? 100 : 50;

  return (
    <main className=" bg-white px-4">
      <div className="max-w-[1517px] mx-auto">
        <h1 className="text-[50px] lg:text-[60px] leading-[100%] font-medium text-[#656565] text-center mb-10 font-display">
          Trusted by users worldwide
        </h1>

        {/* Control Bar */}
        <div className="bg-[#181B21] mx-3 text-white rounded-xl px-6 py-2 mb-6 border border-[#FFFFFF1A] flex items-center justify-between">
          <span className="text-lg font-light">Testimonials</span>

          {/* Dots */}
          <div className="flex gap-2">
            {Array.from({ length: maxDots }).map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-white' : 'bg-gray-600'}`}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex gap-2">
            <button onClick={handlePrev}>
              <Image
                className="max-w-full h-auto w-full "
                width={1000}
                height={1000}
                src="/assets/left.png"
                alt="Prev"
              />
            </button>
            <button onClick={handleNext}>
              <Image
                className="max-w-full h-auto w-full "
                width={1000}
                height={1000}
                src="/assets/right.png"
                alt="Next"
              />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden w-full pb-10">
          <div
            className="flex transition-transform duration-500 ease-out will-change-transform"
            style={{
              transform: `translateX(-${currentIndex * slideWidth}%)`,
            }}
          >
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="shrink-0 w-full md:w-1/2 px-3">
                <div className="bg-white relative rounded-xl overflow-hidden  border border-[#65656526] hover:shadow-lg transition-shadow">
                  {/* Image */}
                  <Image
                    className="absolute bottom-0 w-full z-1 "
                    width={1000}
                    height={1000}
                    src="/assets/Rectangle 135.png"
                    alt=""
                  />
                  <div className="relative h-87.5 bg-[#65656526] overflow-hidden">
                    <Image
                      width={1000}
                      height={1000}
                      priority
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover object-top"
                    />
                    <button className="absolute top-4 right-4">
                      <Image width={46} height={46} src="/assets/Frame 11 (2).png" alt="Share" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6 relative z-10 lg:pt-10 lg:pl-13.75 lg:pr-6 lg:pb-10">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-[24px] font-semibold font-display text-[#181B21]">“Efficient throughout”</h3>
                      <span className="text-lg text-[#65656578] italic font-light">{testimonial.date}</span>
                    </div>

                    <p className="text-lg text-[#656565] leading-[100%] mb-[33px]  ">
                      “I have been a Varntix user for 4 years by now. The interaction with the platform remained always
                      very good and the customer support was prompt and efficient throughout.”
                    </p>

                    <div className="flex justify-between items-end">
                      <p className="text-lg italic font-light text-[#656565]">
                        {testimonial.name} | <span className="text-[#65656578]">{testimonial.title}</span>
                      </p>

                      <div className="flex gap-1">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Image width={21} height={20} key={i} src="/assets/star.png" alt="Star" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
