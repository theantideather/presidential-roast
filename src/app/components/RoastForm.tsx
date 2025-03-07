import { useState, useRef, FormEvent, useEffect } from 'react';
import { FaFileUpload, FaTwitter, FaLightbulb, FaArrowRight, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

type RoastType = 'resume' | 'idea' | 'twitter';

interface RoastResult {
  roast: string;
  score: number;
  isExecutiveOrder: boolean;
  analysis?: string;
  imageUrl?: string;
}

interface RoastFormProps {
  onRoastGenerated: (roastResult: RoastResult) => void;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function RoastForm({ onRoastGenerated, isLoading, setIsLoading, setError }: RoastFormProps) {
  const [roastType, setRoastType] = useState<RoastType>('idea');
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
      
      // Check file type (accept only text files)
      const validFileTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (!validFileTypes.includes(file.type)) {
        setError('Please upload a valid document (PDF, DOC, DOCX, or TXT)');
        toast.error('Please upload a valid document (PDF, DOC, DOCX, or TXT)');
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File is too large. Maximum size is 5MB');
        toast.error('File is too large. Maximum size is 5MB');
        return;
      }
      
      setFileName(file.name);
      
      // Read file content
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const text = e.target?.result as string;
        
        if (text.length < 50) {
          setError('File content is too short. Please upload a more substantial document');
          toast.error('File content is too short. Please upload a more substantial document');
          return;
        }
        
        if (text.length > 10000) {
          setFileContent(text.substring(0, 10000));
          toast.info('File was truncated as it was too long');
        } else {
          setFileContent(text);
        }
      };
      
      reader.onerror = () => {
        setError('Error reading file');
        toast.error('Error reading file');
      };
      
      reader.readAsText(file);
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
    console.log('RoastForm handleSubmit called');
    
    // Validate form based on roast type
    if (roastType === 'resume' && !fileContent) {
      setError('Please upload your resume first!');
      toast.error('Please upload your resume first!');
      return;
    }
    
    if (roastType === 'idea' && idea.trim().length < 10) {
      setError('Please provide a more detailed idea (at least 10 characters).');
      toast.error('Please provide a more detailed idea (at least 10 characters).');
      return;
    }
    
    if (roastType === 'twitter' && !twitterAuthorized) {
      setError('Please enter your Twitter handle first!');
      toast.error('Please enter your Twitter handle first!');
      return;
    }
    
    // Clear previous errors
    setError(null);
    
    // Show loading state
    setIsLoading(true);
    console.log('Setting loading state to true, generating roast...');
    
    // Generate a mock roast immediately instead of in setTimeout
    let generatedRoast = '';
    let score = 0;
    let isExecutiveOrder = false;
    
    if (roastType === 'resume') {
      generatedRoast = generateResumeRoast(fileContent);
      score = Math.floor(Math.random() * 30) + 70; // 70-99
    } else if (roastType === 'idea') {
      generatedRoast = generateIdeaRoast(idea);
      score = Math.floor(Math.random() * 50) + 50; // 50-99
    } else {
      generatedRoast = generateTwitterRoast(twitterUsername || twitterHandle);
      score = Math.floor(Math.random() * 60) + 40; // 40-99
    }
    
    // 10% chance of getting an executive order (special roast)
    isExecutiveOrder = Math.random() < 0.1;
    
    console.log('Generated mock roast:', { generatedRoast, score, isExecutiveOrder });
    
    // Use a promise-based approach with setTimeout
    try {
      console.log('Waiting 2 seconds to simulate API delay...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate 2 second API delay
      
      console.log('Calling onRoastGenerated callback with result...');
      // Call the callback function with the generated roast data
      onRoastGenerated({
        roast: generatedRoast,
        score,
        isExecutiveOrder
      });
      
      // Show success message
      toast.success('ROAST GENERATED SUCCESSFULLY! BIGLY!');
      
      // Don't manually set isLoading here, it will be handled by the parent component
    } catch (error) {
      console.error('Error generating roast:', error);
      setError('Failed to generate roast. Please try again.');
      toast.error('Failed to generate roast. Please try again.');
      setIsLoading(false);
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

function getTrumpReactionGif(score: number): string {
  const highScoreGifs = [
    "https://media.giphy.com/media/l0IyeMK6G2Gr1Gm3e/giphy.gif",
    "https://media.giphy.com/media/YA6dmVW0gfIw8/giphy.gif"
  ];
  
  const lowScoreGifs = [
    "https://media.giphy.com/media/j6ZlX8ghxNFRknObVk/giphy.gif",
    "https://media.giphy.com/media/1ube10l4xArN6/giphy.gif"
  ];
  
  if (score >= 7) {
    return highScoreGifs[Math.floor(Math.random() * highScoreGifs.length)];
  } else {
    return lowScoreGifs[Math.floor(Math.random() * lowScoreGifs.length)];
  }
}

// Generate a resume roast that actually analyzes the content
const generateResumeRoast = (resumeText: string): string => {
  // Extract key aspects from the resume to roast
  const lowercaseResume = resumeText.toLowerCase();
  
  // Check for education
  const hasEducation = lowercaseResume.includes('education') || lowercaseResume.includes('university') || lowercaseResume.includes('college') || lowercaseResume.includes('degree');
  
  // Check for experience
  const hasExperience = lowercaseResume.includes('experience') || lowercaseResume.includes('work') || lowercaseResume.includes('job');
  
  // Check for skills
  const hasSkills = lowercaseResume.includes('skills') || lowercaseResume.includes('proficient') || lowercaseResume.includes('expertise');
  
  // Check common resume buzzwords
  const buzzwords = ['synergy', 'leverage', 'strategic', 'innovative', 'dynamic', 'proactive', 'solution', 'passionate', 'driven', 'team player'];
  const foundBuzzwords = buzzwords.filter(word => lowercaseResume.includes(word));
  
  // Generate a personalized roast based on resume content
  let roastParts = [];
  
  // Opening line
  roastParts.push("I just reviewed what people are calling your \"resume\" - if we can even call it that! TERRIBLE!");
  
  // Education roast
  if (hasEducation) {
    roastParts.push("Your education? OVERRATED schools teaching WORTHLESS subjects! Everyone knows real success comes from NATURAL TALENT, not those FAILING institutions!");
  } else {
    roastParts.push("No education worth mentioning? SAD! Some people say education isn't important, but those people don't work for ME!");
  }
  
  // Experience roast
  if (hasExperience) {
    roastParts.push("Your so-called \"experience\" is with LOW ENERGY companies doing MEANINGLESS work! Not impressed! I've had interns with better experience by age 18!");
  } else {
    roastParts.push("Where's the EXPERIENCE? Empty like the promises of a politician - except mine, which are the best promises, everyone says so!");
  }
  
  // Skills roast
  if (hasSkills) {
    roastParts.push("Your skills section? WEAK! These aren't skills, these are things my grandchildren could do better!");
  } else {
    roastParts.push("No skills listed? At least you're honest about your COMPLETE LACK OF ABILITIES!");
  }
  
  // Buzzword roast
  if (foundBuzzwords.length > 0) {
    roastParts.push(`Using buzzwords like "${foundBuzzwords.join(', ')}"? FAKE RESUME language used by people with NO ACHIEVEMENTS to hide behind big words!`);
  }
  
  // Closing assessment
  roastParts.push("Overall - NOT HIRING MATERIAL! I've seen better qualifications from a DOORKNOB! Would never make it in my tremendous organization. SAD!");
  
  return roastParts.join(" ");
};

// Generate an idea roast that actually analyzes the content
const generateIdeaRoast = (ideaText: string): string => {
  const lowercaseIdea = ideaText.toLowerCase();
  
  // Check for common startup categories
  const isApp = lowercaseIdea.includes('app') || lowercaseIdea.includes('mobile') || lowercaseIdea.includes('application');
  const isAI = lowercaseIdea.includes('ai') || lowercaseIdea.includes('artificial intelligence') || lowercaseIdea.includes('machine learning');
  const isBlockchain = lowercaseIdea.includes('blockchain') || lowercaseIdea.includes('crypto') || lowercaseIdea.includes('token') || lowercaseIdea.includes('nft');
  const isSocialMedia = lowercaseIdea.includes('social') || lowercaseIdea.includes('network') || lowercaseIdea.includes('platform') || lowercaseIdea.includes('community');
  const isEcommerce = lowercaseIdea.includes('shop') || lowercaseIdea.includes('store') || lowercaseIdea.includes('ecommerce') || lowercaseIdea.includes('marketplace');
  
  // Check for common idea qualities
  const isInnovative = lowercaseIdea.includes('new') || lowercaseIdea.includes('innovative') || lowercaseIdea.includes('revolutionary') || lowercaseIdea.includes('disrupt');
  const mentionsMoney = lowercaseIdea.includes('profit') || lowercaseIdea.includes('revenue') || lowercaseIdea.includes('monetize') || lowercaseIdea.includes('funding');
  const hasMarket = lowercaseIdea.includes('market') || lowercaseIdea.includes('customer') || lowercaseIdea.includes('client') || lowercaseIdea.includes('user');
  
  // Count words as a proxy for idea complexity
  const wordCount = ideaText.split(/\s+/).length;
  const isDetailedIdea = wordCount > 50;
  
  // Generate a personalized roast based on idea content
  let roastParts = [];
  
  // Opening line
  roastParts.push(`So I just heard about your "brilliant" idea - ${ideaText.substring(0, 40)}... - and let me tell you, it's one of the ideas I've ever heard. TRULY SPECIAL, but not in a good way!`);
  
  // Category-specific roast
  if (isApp) {
    roastParts.push("Another APP? The world needs another app like I need a smaller inauguration crowd! SATURATED MARKET! DYING PLATFORM!");
  }
  
  if (isAI) {
    roastParts.push("AI this, AI that. Everyone's doing AI now! You're too late to the party - like showing up when all the beautiful cake is GONE!");
  }
  
  if (isBlockchain) {
    roastParts.push("BLOCKCHAIN? People are still trying to make these Internet money schemes work? Your crypto idea is worth less than a VENEZUELAN BOLÍVAR!");
  }
  
  if (isSocialMedia) {
    roastParts.push("Another social platform? FAILING TWITTER and BORING FACEBOOK aren't enough for people? Your platform would have fewer users than my first campaign had votes in California!");
  }
  
  if (isEcommerce) {
    roastParts.push("E-commerce? You're going against AMAZON? Good luck with that! Like bringing a plastic spoon to a nuclear war!");
  }
  
  // Idea quality roast
  if (!isInnovative) {
    roastParts.push("There's NOTHING new here! I've heard this idea from at least 15 different people, all with more TALENT and better EXECUTION plans!");
  }
  
  if (!mentionsMoney) {
    roastParts.push("Where's the MONEY? No revenue model? In business, we care about PROFITS! Something you clearly know NOTHING about!");
  }
  
  if (!hasMarket) {
    roastParts.push("Who's your MARKET? No customers mentioned! The best ideas, and I know the best ideas, have HUGE markets! TREMENDOUS markets!");
  }
  
  if (!isDetailedIdea) {
    roastParts.push("Too SHORT! The idea has no DEPTH! My young son Baron could come up with a more detailed business plan!");
  }
  
  // Closing assessment
  const closingOptions = [
    "This idea would FAIL FASTER than a CNN lie detector test! NOT INVESTABLE!",
    "The only investment this deserves is being invested in a PAPER SHREDDER! TERRIBLE!",
    "If I pitched this on Shark Tank, they would need a BIGGER TANK just to FLUSH IT DOWN! SAD!",
    "This idea is DOA - DEAD ON ARRIVAL! Even my worst hotels perform better than this would!"
  ];
  
  roastParts.push(closingOptions[Math.floor(Math.random() * closingOptions.length)]);
  
  return roastParts.join(" ");
};

// Generate a Twitter roast that actually analyzes the username
const generateTwitterRoast = (twitterHandle: string): string => {
  // Extract characteristics from the handle
  const hasNumbers = /\d/.test(twitterHandle);
  const hasUnderscores = twitterHandle.includes('_');
  const isAllCaps = twitterHandle === twitterHandle.toUpperCase() && twitterHandle.length > 3;
  const containsCommonTerms = ['crypto', 'nft', 'eth', 'btc', 'web3', 'dev', 'coder', 'real', 'official', 'the', 'mr', 'mrs', 'miss', 'guru', 'expert', 'coach', 'influencer'].some(term => twitterHandle.toLowerCase().includes(term));
  const isTooLong = twitterHandle.length > 12;
  const isTooShort = twitterHandle.length < 4;
  
  // Generate a personalized roast
  let roastParts = [];
  
  // Opening line
  roastParts.push(`Just took a look at @${twitterHandle}'s Twitter account. VERY LOW ENERGY! Couldn't find a single tweet that didn't bore me to sleep.`);
  
  // Handle-specific roasts
  if (hasNumbers) {
    roastParts.push("Using NUMBERS in your handle? Not enough creativity to come up with a real name? SAD!");
  }
  
  if (hasUnderscores) {
    roastParts.push("Underscores in the name? What is this, a DATABASE FIELD? Very amateur!");
  }
  
  if (isAllCaps) {
    roastParts.push("ALL CAPS username? You think SHOUTING makes you important? It doesn't!");
  }
  
  if (containsCommonTerms) {
    roastParts.push("Using terms like 'crypto' or 'official' in your handle? TRYING TOO HARD to look legitimate!");
  }
  
  if (isTooLong) {
    roastParts.push("Handle is WAY TOO LONG! The best handles are SHORT and IMPACTFUL. Like mine!");
  }
  
  if (isTooShort) {
    roastParts.push("Handle is TOO SHORT! Probably grabbed early when Twitter was still relevant! ANCIENT!");
  }
  
  // Follower and content roasts
  const followerOptions = [
    "You have FEWER FOLLOWERS than I have HOTELS! And believe me, I own a lot of hotels!",
    "Your follower count is EMBARRASSING! I get more people at my smallest rallies!",
    "You call that a following? I've seen GHOST TOWNS with more activity!",
    "Nobody's listening to your BORING tweets! SAD!"
  ];
  
  const contentOptions = [
    "Your content is as EXCITING as watching PAINT DRY in SLOW MOTION!",
    "I've seen more engaging content from a TELEMARKETER SCRIPT!",
    "Your tweets make CNN's ratings look TREMENDOUS by comparison!",
    "Even SLEEPY JOE could write more engaging content!"
  ];
  
  roastParts.push(followerOptions[Math.floor(Math.random() * followerOptions.length)]);
  roastParts.push(contentOptions[Math.floor(Math.random() * contentOptions.length)]);
  
  // Closing line
  roastParts.push("There isn't enough CAFFEINE in the WORLD to make your account INTERESTING! Maybe try something else? Sad!");
  
  return roastParts.join(" ");
}; 