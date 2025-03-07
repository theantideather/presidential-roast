"use client";

import { useState, useRef, FormEvent, useEffect } from 'react';
import { FaFileUpload, FaTwitter, FaLightbulb, FaArrowRight, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

type RoastType = 'resume' | 'idea' | 'twitter';

interface RoastFormProps {
  onRoastResult: (result: {
    roast: string;
    score: number;
    analysis: string;
    imageUrl?: string;
  }) => void;
  onRoastError: (error: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export default function RoastForm({ onRoastResult, onRoastError, setIsLoading }: RoastFormProps) {
  const [roastType, setRoastType] = useState<RoastType>('idea');
  const [isLoading, setIsLoadingState] = useState(false);
  const [isTwitterAuthorizing, setIsTwitterAuthorizing] = useState(false);
  const [idea, setIdea] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  
  // Check if wallet is connected on mount (for the bonus tokens messaging)
  useEffect(() => {
    // Only check localStorage on the client side
    const checkWalletConnection = () => {
      if (typeof window !== 'undefined') {
        const isConnected = localStorage.getItem('walletAddress') !== null;
        setIsWalletConnected(isConnected);
      }
    };
    
    checkWalletConnection();
    
    // Listen for wallet connection changes
    if (typeof window !== 'undefined') {
      window.addEventListener('walletConnectionChanged', checkWalletConnection);
      
      return () => {
        window.removeEventListener('walletConnectionChanged', checkWalletConnection);
      };
    }
  }, []);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content || 'Unable to read file content');
    };
    
    reader.onerror = () => {
      toast.error('Failed to read the file');
      setFileContent('Error reading file');
    };
    
    if (file.type === 'application/pdf') {
      // For a real app, you'd extract text from PDF
      setFileContent(`[Content extracted from PDF: ${file.name}]`);
    } else {
      reader.readAsText(file);
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (roastType === 'idea' && !idea.trim()) {
      onRoastError('Please enter your business idea');
      return;
    }
    
    if (roastType === 'twitter' && !twitterHandle.trim()) {
      onRoastError('Please enter your Twitter handle');
      return;
    }
    
    if (roastType === 'resume' && !fileContent.trim() && !fileName) {
      onRoastError('Please enter your resume text or upload a file');
      return;
    }
    
    // Set loading states
    setIsLoadingState(true);
    setIsLoading(true);
    
    try {
      let contentToRoast = '';
      
      // Prepare data based on roast type
      if (roastType === 'idea') {
        contentToRoast = idea;
      } else if (roastType === 'twitter') {
        // Clean the handle (remove @ if present)
        const cleanHandle = twitterHandle.trim().replace(/^@/, '');
        contentToRoast = `Twitter handle: @${cleanHandle}`;
      } else if (roastType === 'resume') {
        if (fileContent) {
          contentToRoast = fileContent;
        } else {
          contentToRoast = `Resume from file: ${fileName}`;
        }
      }
      
      // Call API to generate roast
      const response = await axios.post('/api/roast', {
        content: contentToRoast,
        type: roastType
      });
      
      // Update state with response
      if (response.data && response.data.roast) {
        onRoastResult({
          roast: response.data.roast,
          score: response.data.score || 75,
          analysis: response.data.analysis || '',
          imageUrl: response.data.imageUrl
        });
        
        toast.success('ROAST GENERATED SUCCESSFULLY! BIGLY! 🔥');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error submitting roast:', error);
      onRoastError(error.response?.data?.error || 'Failed to generate roast. Please try again later.');
      toast.error('Failed to generate roast. SAD!');
    } finally {
      setIsLoadingState(false);
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 trumpify text-[var(--maga-red)]">
        GET BIGLY ROASTED!
      </h2>
      
      <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-2 border-[var(--gold)]">
        {/* Roast Type Selector */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => setRoastType('idea')}
            className={`px-6 py-3 rounded-full flex items-center gap-2 font-bold transition-all transform hover:scale-105 ${
              roastType === 'idea'
                ? 'bg-[var(--maga-red)] text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'
            }`}
          >
            <FaLightbulb />
            <span className="trumpify">IDEA</span>
          </button>
          
          <button
            type="button"
            onClick={() => setRoastType('resume')}
            className={`px-6 py-3 rounded-full flex items-center gap-2 font-bold transition-all transform hover:scale-105 ${
              roastType === 'resume'
                ? 'bg-[var(--maga-red)] text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'
            }`}
          >
            <FaFileUpload />
            <span className="trumpify">RESUME</span>
          </button>
          
          <button
            type="button"
            onClick={() => setRoastType('twitter')}
            className={`px-6 py-3 rounded-full flex items-center gap-2 font-bold transition-all transform hover:scale-105 ${
              roastType === 'twitter'
                ? 'bg-[var(--maga-red)] text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'
            }`}
          >
            <FaTwitter />
            <span className="trumpify">TWITTER</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Form fields based on type */}
          {roastType === 'idea' && (
            <div className="mb-6">
              <label className="block text-lg font-bold mb-3 trumpify text-[var(--maga-red)]">
                YOUR IDEA (GIVE ME YOUR BEST SHOT!)
              </label>
              <textarea
                className="w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[var(--maga-red)] focus:border-[var(--maga-red)] min-h-[200px]"
                placeholder="Describe your TREMENDOUS idea here! The more detail, the BETTER the roast!"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
              />
            </div>
          )}
          
          {roastType === 'twitter' && (
            <div className="mb-6">
              <label className="block text-lg font-bold mb-3 trumpify text-[var(--maga-red)]">
                YOUR TWITTER HANDLE
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl">@</span>
                <input
                  type="text"
                  className="w-full p-4 pl-10 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[var(--maga-red)] focus:border-[var(--maga-red)]"
                  placeholder="your_twitter_handle"
                  value={twitterHandle.replace(/^@/, '')}
                  onChange={(e) => setTwitterHandle(e.target.value)}
                />
              </div>
            </div>
          )}
          
          {roastType === 'resume' && (
            <div className="mb-6">
              <label className="block text-lg font-bold mb-3 trumpify text-[var(--maga-red)]">
                UPLOAD YOUR RESUME (I'LL TELL YOU IF YOU'RE FIRED!)
              </label>
              <div 
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-[var(--maga-red)] transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                />
                
                {fileName ? (
                  <div>
                    <p className="text-lg font-medium mb-2">File selected:</p>
                    <p className="text-[var(--maga-red)] font-bold">{fileName}</p>
                  </div>
                ) : (
                  <div>
                    <FaFileUpload className="mx-auto text-4xl mb-4 text-gray-400 dark:text-gray-500" />
                    <p className="text-lg font-medium mb-2">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">PDF, DOC, TXT files accepted</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-4 text-white font-bold rounded-lg shadow-md transition trumpify text-lg ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'trump-btn wiggle-on-hover'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  GENERATING YOUR ROAST...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  ROAST ME BIGLY! <FaArrowRight className="ml-2" />
                </span>
              )}
            </button>
          </div>
          
          {/* Bonus Tokens Message */}
          {isWalletConnected && (
            <div className="mt-4 p-3 bg-[var(--gold)] bg-opacity-20 rounded-lg text-center border border-[var(--gold)]">
              <p className="text-[var(--gold)] font-bold">
                WALLET CONNECTED! 🎉 You'll receive bonus ROAST tokens for this submission!
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
} 