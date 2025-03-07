'use client';

import { useState } from 'react';
import Header from './components/Header';
import RoastForm from './components/RoastForm';
import RoastResult from './components/RoastResult';

export default function Home() {
  const [roastResult, setRoastResult] = useState<{
    roast: string;
    score: number;
    analysis: string;
    imageUrl?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoastResult = (result: {
    roast: string;
    score: number;
    analysis: string;
    imageUrl?: string;
  }) => {
    setRoastResult(result);
    setError(null);
    
    // Scroll to the result
    setTimeout(() => {
      const resultElement = document.getElementById('roast-result');
      if (resultElement) {
        resultElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleRoastError = (errorMessage: string) => {
    setError(errorMessage);
    setRoastResult(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <RoastForm 
            onRoastResult={handleRoastResult} 
            onRoastError={handleRoastError}
            setIsLoading={setIsLoading}
          />
          
          <div id="roast-result" className="mt-8">
            <RoastResult 
              result={roastResult}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
