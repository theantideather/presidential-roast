"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowDown } from 'react-icons/fa';

export default function Hero() {
  const [isAnimated, setIsAnimated] = useState(false);
  
  useEffect(() => {
    // Delay animation to allow page load
    setTimeout(() => {
      setIsAnimated(true);
    }, 300);
  }, []);
  
  return (
    <section className="relative min-h-[70vh] flex items-center bg-gradient-to-b from-blue-900 to-blue-800 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-stars"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/presidential-seal.png')] bg-no-repeat bg-center bg-contain opacity-30 transform scale-125"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-5xl mx-auto text-center text-white">
          <h1 className={`text-4xl md:text-6xl xl:text-7xl font-bold mb-6 transition-transform duration-700 transform ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <span className="block trumpify text-[var(--gold)]">PRESIDENTIAL</span>
            <span className="block trumpify text-white">ROAST</span>
          </h1>
          
          <p className={`text-xl md:text-2xl mb-10 text-blue-100 transition-all duration-700 delay-300 transform ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Get roasted by the most tremendous AI in the history of AI, maybe ever.
            <br/>
            Many people are saying it's the best roasting you'll ever get, believe me!
          </p>
          
          <div className={`flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 transition-all duration-700 delay-500 transform ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Link href="#roast-form" className="trump-btn text-xl px-8 py-4 rounded-lg font-bold flex items-center">
              GET ROASTED NOW
            </Link>
            
            <div className="relative group">
              <Link href="#how-it-works" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-800 px-8 py-4 rounded-lg font-bold flex items-center transition-colors">
                HOW IT WORKS
              </Link>
              <div className="absolute -right-2 -bottom-2 w-full h-full border-2 border-[var(--gold)] rounded-lg transition-all duration-300 group-hover:translate-x-1 group-hover:translate-y-1"></div>
            </div>
          </div>
          
          <div className={`mt-16 animate-bounce transition-opacity duration-700 delay-700 ${isAnimated ? 'opacity-100' : 'opacity-0'}`}>
            <Link href="#roast-form" className="inline-block text-white">
              <FaArrowDown className="text-3xl" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 