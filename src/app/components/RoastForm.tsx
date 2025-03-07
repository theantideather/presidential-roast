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
  const [twitterAuthorized, setTwitterAuthorized] = useState(false);
  const [twitterUsername, setTwitterUsername] = useState('');
  const [twitterProfilePic, setTwitterProfilePic] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if wallet is connected on mount (for the bonus tokens messaging)
  useEffect(() => {
    const checkWalletConnection = () => {
      const walletAddress = localStorage.getItem('walletAddress');
      setIsWalletConnected(!!walletAddress);
    };
    
    checkWalletConnection();
    
    // Listen for wallet connection events from the Header component
    window.addEventListener('walletConnectionChanged', checkWalletConnection);
    
    return () => {
      window.removeEventListener('walletConnectionChanged', checkWalletConnection);
    };
  }, []);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      
      try {
        // For text files, read directly
        if (file.type === 'text/plain') {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setFileContent(event.target.result as string);
              toast.success('Resume loaded successfully!');
            }
          };
          reader.readAsText(file);
        } 
        // For all other file types, we'll just use the filename
        else {
          // Simplified approach - just use filename for all non-text files
          setFileContent(`Resume from ${file.name} (File content would be extracted in production)`);
          toast.success(`File "${file.name}" received! Ready for roasting!`);
        }
      } catch (error) {
        console.error('Error processing file:', error);
        toast.error('Failed to process the file. Please try again.');
      }
    }
  };
  
  // Simplified Twitter handling - no authentication needed, just use the handle
  const handleTwitterSubmit = () => {
    if (!twitterHandle.trim()) {
      toast.error('Please enter a Twitter handle first!');
      return;
    }
    
    const username = twitterHandle.replace('@', '').trim();
    if (username.length < 1) {
      toast.error('Please enter a valid Twitter handle!');
      return;
    }
    
    setTwitterUsername(username);
    setTwitterProfilePic(`https://unavatar.io/twitter/${username}`);
    setTwitterAuthorized(true);
    toast.success(`Twitter handle @${username} is ready for roasting! 🔥`);
  };
  
  const disconnectTwitter = () => {
    setTwitterAuthorized(false);
    setTwitterUsername('');
    setTwitterProfilePic('');
    setTwitterHandle('');
    toast.info('Twitter account removed!');
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
    setIsSubmitting(true);
    setIsLoadingState(true);
    
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
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error submitting roast:', error);
      onRoastError(error.response?.data?.error || 'Failed to generate roast. Please try again later.');
    } finally {
      setIsSubmitting(false);
      setIsLoadingState(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 max-w-3xl mx-auto border-t-8 border-[var(--maga-red)]">
      <h2 className="text-2xl md:text-3xl trumpify mb-6 text-center text-[var(--maga-red)]">
        GET BIGLY ROASTED!
      </h2>
      
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setRoastType('idea')}
            className={`flex items-center px-4 py-2 text-sm font-bold rounded-l-lg ${
              roastType === 'idea' 
                ? 'bg-[var(--maga-red)] text-white' 
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <FaLightbulb className="mr-2" />
            IDEA
          </button>
          <button
            type="button"
            onClick={() => setRoastType('resume')}
            className={`flex items-center px-4 py-2 text-sm font-bold ${
              roastType === 'resume' 
                ? 'bg-[var(--maga-red)] text-white' 
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <FaFileUpload className="mr-2" />
            RESUME
          </button>
          <button
            type="button"
            onClick={() => setRoastType('twitter')}
            className={`flex items-center px-4 py-2 text-sm font-bold rounded-r-lg ${
              roastType === 'twitter' 
                ? 'bg-[var(--maga-red)] text-white' 
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <FaTwitter className="mr-2" />
            TWITTER
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {roastType === 'idea' && (
          <div>
            <label htmlFor="idea" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase">
              Your Idea (Give me your BEST shot!)
            </label>
            <textarea
              id="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--maga-red)] focus:border-[var(--maga-red)] dark:bg-gray-700"
              placeholder="Describe your TREMENDOUS idea here! The more detail, the BETTER the roast!"
              maxLength={1000}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <div>
                {idea.length > 0 && idea.length < 100 && (
                  <span className="text-[var(--maga-red)]">More detail = BETTER roast! Make it LONGER!</span>
                )}
              </div>
              <div>{idea.length}/1000 characters</div>
            </div>
          </div>
        )}
        
        {roastType === 'resume' && (
          <div>
            <label htmlFor="resume" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase">
              Upload Your Resume (ANY FILE FORMAT)
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 transition duration-300 hover:border-[var(--maga-red)]">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {fileName ? (
                    <div className="text-center">
                      <div className="flex items-center justify-center w-16 h-16 mb-3 rounded-full bg-green-100 text-green-600">
                        <FaFileUpload className="w-8 h-8" />
                      </div>
                      <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{fileName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Click to change file</p>
                      {fileContent && (
                        <div className="mt-2 text-green-600 dark:text-green-400">
                          <span className="text-xs">✓ File loaded successfully</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <FaFileUpload className="w-12 h-12 mb-3 text-gray-500 dark:text-gray-400" />
                      <p className="mb-2 text-sm text-gray-700 dark:text-gray-300 font-bold">
                        CLICK TO UPLOAD YOUR RESUME
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ANY FILE FORMAT ACCEPTED
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                        Upload your SAD resume and get it ROASTED!
                      </p>
                    </>
                  )}
                </div>
                <input 
                  id="resume" 
                  ref={fileInputRef}
                  type="file" 
                  accept="*/*"
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
        )}
        
        {roastType === 'twitter' && (
          <div>
            <label htmlFor="twitter" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase">
              Your Twitter Handle
            </label>
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaTwitter className="text-[#1DA1F2]" />
              </div>
              <input
                id="twitter"
                type="text"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                className="w-full pl-10 px-3 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1DA1F2] focus:border-[#1DA1F2] dark:bg-gray-700"
                placeholder="@yourhandle"
              />
            </div>
            
            {twitterAuthorized ? (
              <div className="flex items-center justify-between bg-blue-50 dark:bg-gray-700 p-3 rounded-lg border border-blue-200 dark:border-gray-600">
                <div className="flex items-center">
                  <img 
                    src={twitterProfilePic} 
                    alt={twitterUsername} 
                    className="w-10 h-10 rounded-full mr-3 border-2 border-[#1DA1F2]"
                  />
                  <div>
                    <p className="font-bold">@{twitterUsername}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ready to be roasted!</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={disconnectTwitter}
                  className="text-sm text-red-500 font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleTwitterSubmit}
                className="w-full py-3 flex items-center justify-center bg-[#1DA1F2] text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FaTwitter className="mr-2" />
                Use This Twitter Handle
              </button>
            )}
          </div>
        )}
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 px-4 text-white font-bold rounded-lg shadow-md transition trumpify text-lg ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'trump-btn wiggle-on-hover'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                Roasting in progress...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                ROAST ME BIGLY! <FaArrowRight className="ml-2" />
              </span>
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        {isWalletConnected ? (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm">
            <p className="font-bold text-[var(--gold)]">WALLET CONNECTED! 💰</p>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Get 0.0001 SOL and mint your roast as an NFT after submission!
            </p>
          </div>
        ) : (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm text-gray-500 dark:text-gray-400">
            <p>Connect your wallet to earn Solana tokens and mint your roast as an NFT!</p>
          </div>
        )}
      </div>
    </div>
  );
} 