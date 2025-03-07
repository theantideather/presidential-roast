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
  
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State to store the generated roast data
  const [roastData, setRoastData] = useState<{
    roast: string;
    score: number;
    analysis: string;
    imageUrl?: string;
  } | null>(null);

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
  const handleRoastGenerated = (roastResult: {
    roast: string;
    score: number;
    isExecutiveOrder: boolean;
    analysis?: string;
    imageUrl?: string;
  }) => {
    // Create a properly formatted result with analysis
    const formattedResult = {
      roast: roastResult.roast,
      score: roastResult.score,
      analysis: roastResult.analysis || generateAnalysis(roastResult.score, roastResult.isExecutiveOrder),
      imageUrl: roastResult.imageUrl || getRandomGif(roastResult.score)
    };
    
    setRoastData(formattedResult);
    setIsLoading(false);
    setError(null);
    setShowResult(true);
    
    // Scroll to the result section
    setTimeout(() => {
      document.getElementById('roast-result')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  // Generate a simple analysis based on score if none provided
  const generateAnalysis = (score: number, isExecutiveOrder: boolean): string => {
    if (score >= 9) {
      return "TREMENDOUS RESULT! This roast is so good, many people are saying it's the best they've ever seen. Believe me!";
    } else if (score >= 7) {
      return "A very good roast, lots of potential here. The President sees great things in your future!";
    } else if (score >= 5) {
      return "Not bad, not bad. Could use some work, but there's definitely something here.";
    } else {
      return "This didn't score very well. SAD! Maybe try again with something more impressive?";
    }
  };
  
  // Get a random reaction GIF based on score
  const getRandomGif = (score: number): string => {
    const highScoreGifs = [
      "https://media.giphy.com/media/l0IyeMK6G2Gr1Gm3e/giphy.gif",
      "https://media.giphy.com/media/YA6dmVW0gfIw8/giphy.gif",
      "https://media.giphy.com/media/xTiTnHXbRoaZ1B1Mo8/giphy.gif"
    ];
    
    const lowScoreGifs = [
      "https://media.giphy.com/media/j6ZlX8ghxNFRknObVk/giphy.gif",
      "https://media.giphy.com/media/1ube10l4xArN6/giphy.gif",
      "https://media.giphy.com/media/xTiTnvFvRnmYGl6CEE/giphy.gif"
    ];
    
    if (score >= 7) {
      return highScoreGifs[Math.floor(Math.random() * highScoreGifs.length)];
    } else {
      return lowScoreGifs[Math.floor(Math.random() * lowScoreGifs.length)];
    }
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
            
            {showResult ? (
              <div>
                <RoastResult 
                  result={roastData}
                  isLoading={isLoading}
                  error={error}
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
              <RoastForm onRoastGenerated={handleRoastGenerated} />
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
