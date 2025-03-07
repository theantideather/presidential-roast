'use client';

import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import RoastForm from './components/RoastForm';
import RoastResult from './components/RoastResult';
import Footer from './components/Footer';

// Define a custom event for wallet connection changes
declare global {
  interface WindowEventMap {
    walletConnectionChanged: Event;
  }
}

export default function Home() {
  // State to track if a roast has been generated
  const [showResult, setShowResult] = useState(false);
  
  // State to store the generated roast data
  const [roastResult, setRoastResult] = useState<{
    roast: string;
    score: number;
    analysis: string;
    imageUrl?: string;
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for wallet connection on component mount
  useEffect(() => {
    // Create a polyfill for our custom event if needed
    if (typeof window !== 'undefined') {
      // Check if the Phantom wallet extension is installed
      const isPhantomInstalled = window.hasOwnProperty('solana');
      
      // Log for debugging
      console.log('Phantom wallet detected:', isPhantomInstalled);
      
      // If Phantom is installed, check if it's already connected
      if (isPhantomInstalled) {
        try {
          // @ts-ignore - Solana isn't typed by default
          window.solana.connect({ onlyIfTrusted: true })
            .then((response: any) => {
              if (response.publicKey) {
                // Store wallet address in localStorage
                localStorage.setItem('walletAddress', response.publicKey.toString());
                
                // Dispatch event for other components
                window.dispatchEvent(new Event('walletConnectionChanged'));
                
                console.log('Wallet auto-connected:', response.publicKey.toString());
              }
            })
            .catch((err: any) => {
              console.log('Wallet auto-connect error (expected if not previously connected):', err);
            });
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    }
  }, []);
  
  // Handler for when a roast is generated
  const handleRoastResult = (result: {
    roast: string;
    score: number;
    analysis: string;
    imageUrl?: string;
  }) => {
    setRoastResult(result);
    setError(null);
    setShowResult(true);
    
    // Scroll to the result section
    setTimeout(() => {
      document.getElementById('roast-result')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  const handleRoastError = (errorMessage: string) => {
    setError(errorMessage);
    setRoastResult(null);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <Hero />
        
        <section className="py-16 bg-white dark:bg-gray-800" id={showResult ? 'roast-result' : 'roast-form'}>
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 trumpify text-[var(--maga-red)]">
              {showResult ? 'YOUR OFFICIAL PRESIDENTIAL ROAST' : 'GET YOUR PRESIDENTIAL ROAST'}
            </h2>
            
            {showResult && roastResult ? (
              <div>
                <RoastResult 
                  result={roastResult} 
                  isLoading={false} 
                  error={null} 
                />
                
                <div className="text-center mt-8">
                  <button 
                    onClick={() => setShowResult(false)}
                    className="trump-btn py-3 px-6 font-bold"
                  >
                    GET ANOTHER ROAST
                  </button>
                </div>
              </div>
            ) : (
              <RoastForm 
                onRoastResult={handleRoastResult} 
                onRoastError={handleRoastError}
                setIsLoading={setIsLoading}
              />
            )}
          </div>
        </section>
        
        <section className="py-16 bg-gray-100 dark:bg-gray-900" id="how-it-works">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8 trumpify text-[var(--maga-red)]">HOW IT WORKS</h2>
            
            <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[var(--maga-red)] text-white flex items-center justify-center text-2xl font-bold mb-4">1</div>
                <h3 className="text-xl font-bold mb-2 trumpify">SUBMIT</h3>
                <p className="text-gray-700 dark:text-gray-400">
                  Upload your SAD resume, share your FAILING idea, or connect your FAKE NEWS Twitter!
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[var(--maga-red)] text-white flex items-center justify-center text-2xl font-bold mb-4">2</div>
                <h3 className="text-xl font-bold mb-2 trumpify">GET ROASTED</h3>
                <p className="text-gray-700 dark:text-gray-400">
                  Receive a TREMENDOUS roast in President Trump's BIGLY style! THE BEST ROASTS!
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[var(--maga-red)] text-white flex items-center justify-center text-2xl font-bold mb-4">3</div>
                <h3 className="text-xl font-bold mb-2 trumpify">EARN TOKENS</h3>
                <p className="text-gray-700 dark:text-gray-400">
                  Connect your Phantom wallet and receive HUUUGE ROAST token rewards! SO MUCH WINNING!
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[var(--maga-red)] text-white flex items-center justify-center text-2xl font-bold mb-4">4</div>
                <h3 className="text-xl font-bold mb-2 trumpify">MINT NFT</h3>
                <p className="text-gray-700 dark:text-gray-400">
                  Turn your roast into a BEAUTIFUL NFT on the Solana blockchain! VERY SPECIAL!
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
