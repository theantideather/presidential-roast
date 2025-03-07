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
    console.log('handleRoastGenerated called with:', roastResult);
    
    // Create a properly formatted result with analysis
    const formattedResult = {
      roast: roastResult.roast,
      score: roastResult.score,
      analysis: roastResult.analysis || generateAnalysis(roastResult.score, roastResult.isExecutiveOrder),
      imageUrl: roastResult.imageUrl || getRandomGif(roastResult.score)
    };
    
    console.log('Formatted roast result:', formattedResult);
    
    setRoastData(formattedResult);
    setIsLoading(false);
    setError(null);
    setShowResult(true);
    
    console.log('State updated - showResult:', true, 'roastData:', formattedResult);
    
    // Scroll to the result section
    setTimeout(() => {
      const resultElement = document.getElementById('roast-result');
      console.log('Trying to scroll to result element:', resultElement);
      resultElement?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  // Generate a detailed analysis based on score if none provided
  const generateAnalysis = (score: number, isExecutiveOrder: boolean): string => {
    // Base analysis factors
    const scoreAnalysis = 
      score >= 90 ? "TREMENDOUS score! This is in the top 1% of all roasts." :
      score >= 80 ? "VERY GOOD score! This roast is better than 85% of submissions." :
      score >= 70 ? "ABOVE AVERAGE score. Top 35% of all roasts." :
      score >= 60 ? "DECENT score. Not terrible, not great." :
      score >= 50 ? "BARELY PASSING score. You can do better!" :
      "LOW ENERGY score. SAD!";
    
    // Executive order status
    const executiveOrderAnalysis = isExecutiveOrder 
      ? "This roast has been granted EXECUTIVE ORDER status! This is a VERY SPECIAL designation given to only the most BIGLY impressive submissions."
      : "This roast did NOT qualify for an executive order. Maybe next time!";
    
    // Improvement suggestions
    const improvementSuggestions =
      score >= 90 ? "No improvements needed! You've achieved PERFECTION!" :
      score >= 80 ? "To reach a perfect score: Add more WINNING achievements and TREMENDOUS accomplishments to your profile." :
      score >= 70 ? "To improve: Need more HIGH ENERGY content and LESS failing material!" :
      score >= 60 ? "Major improvements needed: Complete restructuring of your approach. TOTAL OVERHAUL!" :
      score >= 50 ? "SERIOUS problems detected. Almost everything needs to be changed!" :
      "This submission needs to be COMPLETELY REDONE from scratch. DISASTER!";
    
    // Build the complete analysis
    let analysis = `The President has analyzed your submission with a score of ${score}/100.\n\n${scoreAnalysis}\n\n${executiveOrderAnalysis}\n\n${improvementSuggestions}`;
    
    // Add a "presidential message" based on the score range
    if (score >= 90) {
      analysis += "\n\nPresidential Message: YOU'RE HIRED! This is the kind of EXCELLENCE I look for in all my ventures!";
    } else if (score >= 70) {
      analysis += "\n\nPresidential Message: Not bad! With some work, you could be TREMENDOUS someday!";
    } else if (score >= 50) {
      analysis += "\n\nPresidential Message: I've seen worse, but not by much. NEED IMPROVEMENT!";
    } else {
      analysis += "\n\nPresidential Message: YOU'RE FIRED! This is below even the LOWEST standards!";
    }
    
    return analysis;
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
    
    if (score >= 70) {
      return highScoreGifs[Math.floor(Math.random() * highScoreGifs.length)];
    } else {
      return lowScoreGifs[Math.floor(Math.random() * lowScoreGifs.length)];
    }
  };
  
  // Function to reset the roast form and results
  const handleReset = () => {
    setShowResult(false);
    setRoastData(null);
    setError(null);
    
    // Scroll back to the top of the form
    setTimeout(() => {
      document.getElementById('roast-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // For debugging - trigger a mock roast directly
  const triggerMockRoast = () => {
    const mockRoast = {
      roast: "Just took a look at @omg14doteth's Twitter account. VERY LOW ENERGY! Couldn't find a single tweet that didn't bore me to sleep. They said Twitter was a BIRD... but all I see is a DOVE. Where's the EAGLE?! They have less followers than I have hotels, and believe me, I know hotels! There isn't enough caffeine in the WORLD to make this account INTERESTING! Sad!",
      score: 85,
      isExecutiveOrder: true,
    };
    handleRoastGenerated(mockRoast);
  };

  // Debug output for rendering
  console.log('Rendering Home component with:', { showResult, roastData });

  return (
    <main className="flex min-h-screen flex-col trump-gradient">
      <Header />
      
      <Hero />
      
      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-12">
        {/* Dev debug button - only visible in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-md">
            <p className="font-bold mb-2">Developer Debug Tools</p>
            <button 
              onClick={triggerMockRoast}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Trigger Test Roast Result
            </button>
            <div className="mt-2">
              <p><strong>showResult:</strong> {showResult ? 'true' : 'false'}</p>
              <p><strong>isLoading:</strong> {isLoading ? 'true' : 'false'}</p>
              <p><strong>hasRoastData:</strong> {roastData ? 'true' : 'false'}</p>
            </div>
          </div>
        )}
        
        {/* Roast Form Section */}
        <section id="roast-form" className="mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 gold-border">
              <h2 className="text-3xl font-bold mb-6 text-center trumpify text-[var(--maga-red)]">CREATE YOUR PRESIDENTIAL ROAST</h2>
              
              <RoastForm 
                onRoastGenerated={handleRoastGenerated}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                setError={setError}
              />
              
              {error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                  {error}
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Roast Result Section - Only shown after generating a roast */}
        {showResult && roastData ? (
          <section id="roast-result" className="mb-16">
            <div className="max-w-4xl mx-auto">
              <RoastResult 
                roastData={roastData}
                onReset={handleReset}
              />
            </div>
          </section>
        ) : (
          // Additional loading message for debugging
          isLoading && (
            <section id="roast-loading" className="mb-16">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 gold-border text-center">
                  <h2 className="text-2xl font-bold mb-4 trumpify text-[var(--maga-red)]">
                    THE PRESIDENT IS ANALYZING YOUR SUBMISSION...
                  </h2>
                  <div className="flex justify-center my-8">
                    <div className="w-16 h-16 border-4 border-[var(--maga-red)] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-lg font-bold">
                    TREMENDOUS roast incoming! It will be the BEST roast you've ever seen, believe me!
                  </p>
                </div>
              </div>
            </section>
          )
        )}
        
        {/* How It Works Section */}
        <section id="how-it-works" className="mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 gold-border">
              <h2 className="text-3xl font-bold mb-6 text-center trumpify text-[var(--maga-red)]">HOW IT WORKS</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--maga-red)] text-white rounded-full mb-4 text-2xl font-bold">1</div>
                  <h3 className="text-xl font-bold mb-2 trumpify">SUBMIT</h3>
                  <p>Upload your resume, Twitter profile, or business idea for roasting.</p>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--maga-red)] text-white rounded-full mb-4 text-2xl font-bold">2</div>
                  <h3 className="text-xl font-bold mb-2 trumpify">GET ROASTED</h3>
                  <p>Our AI presidential roaster will analyze and roast your submission in BIGLY fashion!</p>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--maga-red)] text-white rounded-full mb-4 text-2xl font-bold">3</div>
                  <h3 className="text-xl font-bold mb-2 trumpify">EARN REWARDS</h3>
                  <p>Get ROAST tokens and mint your presidential roast as an NFT on Solana!</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </main>
  );
}
