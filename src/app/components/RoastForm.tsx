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

// Make each roast unique and personalized based on content
function generateResumeRoast(resumeContent: string): string {
  // Extract key elements from resume
  const skills = extractSkillsFromResume(resumeContent);
  const experience = extractExperienceFromResume(resumeContent);
  const education = extractEducationFromResume(resumeContent);
  
  // Generate more personalized roasts using actual content
  let roastLines = [];
  
  // Add intro line
  roastLines.push(`I just looked at this so-called resume, folks. DISASTER!`);
  
  // Skills section roast
  if (skills.length > 0) {
    const randomSkill = skills[Math.floor(Math.random() * skills.length)];
    roastLines.push(`You list "${randomSkill}" as a skill? LAUGHABLE! I know KINDERGARTNERS with better ${randomSkill} skills than you.`);
    
    if (skills.length > 1) {
      const anotherSkill = skills.filter(s => s !== randomSkill)[0];
      roastLines.push(`And "${anotherSkill}"? Please! Who are you trying to fool?`);
    } else {
      roastLines.push(`Is that your only skill? Pathetic! I have TREMENDOUS skills, the best skills.`);
    }
  } else {
    roastLines.push(`Your skills section is EMPTY, just like your chances of getting hired! SAD!`);
  }
  
  // Experience section roast
  if (experience) {
    roastLines.push(`You worked at ${experience}? Never heard of them. LOW ENERGY company!`);
    roastLines.push(`I bet they were BEGGING you to leave. Nobody keeps bad employees longer than me, believe me.`);
  } else {
    roastLines.push(`No real experience to speak of. ZERO! How do you expect to make America great with NO EXPERIENCE?`);
  }
  
  // Education section roast
  if (education) {
    roastLines.push(`And this education from ${education}? Not impressive. I know people with TREMENDOUS educations.`);
    roastLines.push(`Did they just GIVE you a degree? Because you certainly don't seem qualified!`);
  } else {
    roastLines.push(`School? Did you even go? Doesn't look like it! I went to the BEST schools, believe me.`);
  }
  
  // Conclusion
  roastLines.push(`Listen, I've hired the BEST people, absolutely phenomenal people for my businesses. And let me tell you, with this resume, YOU'RE FIRED before you're even hired! This is the worst resume in the history of resumes, maybe ever!`);
  
  // Join all parts with appropriate spacing
  return roastLines.join(' ');
}

function generateIdeaRoast(idea: string): string {
  // Extract key concepts from the idea
  const keywords = idea.toLowerCase().match(/\b\w{5,}\b/g) || ['idea', 'business', 'startup'];
  const mainTopic = keywords.length > 3 ? keywords[Math.floor(Math.random() * 3)] : keywords[0];
  
  // Look for specific topics that can be roasted
  const hasTech = /\b(app|website|software|tech|ai|blockchain|crypto|nft|web3)\b/i.test(idea);
  const hasProduct = /\b(product|device|gadget|invention)\b/i.test(idea);
  const hasService = /\b(service|platform|marketplace|subscription)\b/i.test(idea);
  const hasFinance = /\b(money|finance|banking|investment|profit|revenue)\b/i.test(idea);
  
  // Generate a unique roast focused on the main topic
  let roastLines = [];
  
  // Intro
  roastLines.push(`So I just heard about this ${mainTopic.toUpperCase()} idea, and let me tell you, it's a COMPLETE DISASTER!`);
  
  // Comment on the verbosity
  if (idea.length > 200) {
    roastLines.push(`Very long-winded explanation, folks! SO BORING! I almost fell asleep reading it!`);
  } else if (idea.length > 100) {
    roastLines.push(`You talk too much about nothing important. Get to the point!`);
  } else {
    roastLines.push(`You barely explained anything! Low effort! SAD!`);
  }
  
  // Topic-specific roasts
  if (hasTech) {
    roastLines.push(`Another tech thing? My 10-year-old son knows more about technology, believe me. He's fantastic with the cyber!`);
    roastLines.push(`Silicon Valley would LAUGH at this idea. They only fund winners, not LOSERS!`);
  }
  
  if (hasProduct) {
    roastLines.push(`This product would NEVER sell. It's like trying to sell STEAKS at a vegan restaurant. I know products, I have the BEST products.`);
  }
  
  if (hasService) {
    roastLines.push(`This service is a JOKE! Nobody would pay for this. I've seen better business plans written by FAILING college students.`);
  }
  
  if (hasFinance) {
    roastLines.push(`Money? You think you understand MONEY? I wrote the book on deals! This wouldn't make a PENNY!`);
  }
  
  // Competition roast
  roastLines.push(`${Math.random() > 0.5 ? 'China is already doing it, and they're doing it better. AMERICA FIRST!' : 'Mexico sent us their idea, and it\'s not their best idea!'}`);
  
  // App-specific comment
  if (idea.includes('app')) {
    roastLines.push(`Another app? The app market is SATURATED! Nobody wants another app, believe me!`);
  } else {
    roastLines.push(`Not even an app? Everyone has apps these days. LOW TECH!`);
  }
  
  // Conclusion
  roastLines.push(`You want to succeed? Think BIGGER and more BEAUTIFUL, like my tremendous buildings. This idea might be the worst trade deal in the history of trade deals, maybe ever!`);
  
  // Join all parts with appropriate spacing
  return roastLines.join(' ');
}

function generateTwitterRoast(twitterHandle: string): string {
  // Create variations based on the handle
  const cleanHandle = twitterHandle.replace('@', '');
  const nameParts = cleanHandle.split(/[_.-]/);
  const nameLength = cleanHandle.length;
  
  let roastLines = [];
  
  // Intro
  roastLines.push(`Just checked out @${cleanHandle}'s Twitter. VERY LOW ENERGY!`);
  
  // Name roast
  if (nameParts.length > 1) {
    roastLines.push(`What kind of name is @${cleanHandle}? Trying to be fancy with that "${nameParts[1]}" part? Not working!`);
  } else if (nameLength > 10) {
    roastLines.push(`@${cleanHandle}? TOO LONG! Nobody remembers long handles. SAD!`);
  } else if (nameLength < 5) {
    roastLines.push(`@${cleanHandle}? TOO SHORT! Couldn't think of anything better? Low creativity!`);
  } else {
    roastLines.push(`@${cleanHandle}? BORING name! Should have asked ME for branding advice!`);
  }
  
  // Follower jokes
  const followerJokes = [
    `Probably has more BOTS than real followers. SAD!`,
    `I bet you can count your followers on one hand. I have MILLIONS!`,
    `I heard your follower count is going DOWN every day. FAILING @${cleanHandle}!`,
    `Your engagement rate is the worst in history, maybe ever. Even CNN does better!`
  ];
  
  roastLines.push(followerJokes[Math.floor(Math.random() * followerJokes.length)]);
  
  // Content roasts
  const contentRoasts = [
    `All they do is RETWEET others. No original thoughts!`,
    `The content is FAKE NEWS, believe me!`,
    `Just checked your last few tweets. BORING! No wonder nobody engages!`,
    `Your tweets are a DISASTER. I've seen better content from SLEEPY JOE!`,
    `You call those tweets? I've had more interesting SPAM emails!`
  ];
  
  roastLines.push(contentRoasts[Math.floor(Math.random() * contentRoasts.length)]);
  roastLines.push(`I have the best tweets, everyone says so. Many people are saying @${cleanHandle} should learn from me.`);
  
  // Engagement roast
  roastLines.push(`The mainstream media won't report this, but @${cleanHandle} has the lowest engagement ratings in history, maybe ever.`);
  
  // Conclusion
  const conclusions = [
    `Do yourself a favor and hit that follow button on MY account instead!`,
    `Maybe try posting something INTERESTING for once! Sad!`,
    `I would block you, but you're not worth the effort!`,
    `Your Twitter game is WEAK! Tremendously weak!`
  ];
  
  roastLines.push(conclusions[Math.floor(Math.random() * conclusions.length)]);
  
  // Join all parts with appropriate spacing
  return roastLines.join(' ');
}

// Helper functions to extract information from resume
function extractSkillsFromResume(resume: string): string[] {
  // Try to find a skills section first
  const skillsSection = resume.match(/skills:?(.+?)(?:\n|$)/i) || 
                      resume.match(/proficiencies:?(.+?)(?:\n|$)/i) ||
                      resume.match(/proficient in:?(.+?)(?:\n|$)/i);
  
  if (skillsSection && skillsSection[1]) {
    return skillsSection[1].split(/[,.]/).map(s => s.trim()).filter(s => s.length > 3 && s.length < 20);
  }
  
  // If no skills section, try to extract words that might be skills
  const technicalSkills = resume.match(/\b(javascript|python|typescript|java|c\+\+|ruby|php|html|css|sql|react|angular|vue|node|express|django|flask|spring|docker|kubernetes|aws|azure|gcp|git|jenkins|ci\/cd|agile|scrum)\b/gi);
  
  const softSkills = resume.match(/\b(leadership|management|communication|teamwork|problem-solving|analytical|critical-thinking|time-management|organization|creativity|adaptability|flexibility|detail-oriented|customer-service|presentation|negotiation|public-speaking)\b/gi);
  
  const tools = resume.match(/\b(excel|word|powerpoint|photoshop|illustrator|figma|sketch|adobe|sap|salesforce|tableau|power-bi|jira|confluence|asana|trello|slack)\b/gi);
  
  // Combine all potential skills
  const allSkills = [...new Set([
    ...(technicalSkills || []),
    ...(softSkills || []),
    ...(tools || [])
  ].map(s => s.trim().toLowerCase()))];
  
  return allSkills.length > 0 ? allSkills : ['nothing impressive'];
}

function extractExperienceFromResume(resume: string): string {
  // Try to find company names
  const experienceSection = resume.match(/experience:?(.+?)(?:\n\n|\n[A-Z]|$)/is);
  
  if (experienceSection && experienceSection[1]) {
    // Look for company names in the experience section
    const companies = experienceSection[1].match(/\b(at|for|with) ([A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+){0,2})\b/) ||
                      experienceSection[1].match(/\b([A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+){0,2}),?\s+(inc|llc|corp|corporation|company|co)\b/i) ||
                      experienceSection[1].match(/\b([A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+){0,2})\b/);
    
    if (companies && (companies[2] || companies[1])) {
      return companies[2] || companies[1];
    }
  }
  
  // Try to find any capitalized words that might be company names
  const potentialCompanies = resume.match(/\b([A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+){0,2})\b/g);
  
  if (potentialCompanies && potentialCompanies.length > 0) {
    // Filter out common non-company words
    const filteredCompanies = potentialCompanies.filter(c => 
      !['I', 'Me', 'My', 'University', 'College', 'High', 'School', 'January', 'February', 'March', 
        'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].includes(c)
    );
    
    if (filteredCompanies.length > 0) {
      return filteredCompanies[0];
    }
  }
  
  return '';
}

function extractEducationFromResume(resume: string): string {
  // Try to find education institutions
  const educationSection = resume.match(/education:?(.+?)(?:\n\n|\n[A-Z]|$)/is);
  
  if (educationSection && educationSection[1]) {
    const institutions = educationSection[1].match(/\b(University|College|School) of ([A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+){0,2})\b/) || 
                        educationSection[1].match(/\b([A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+){0,2}) (University|College|School)\b/) ||
                        educationSection[1].match(/\b([A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+){0,2})\b/);
    
    if (institutions) {
      return institutions[0];
    }
  }
  
  // Try to find any reference to education elsewhere
  const institutions = resume.match(/\b(University|College|School) of ([A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+){0,2})\b/) || 
                    resume.match(/\b([A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+){0,2}) (University|College|School)\b/) ||
                    resume.match(/\b(Bachelor|Master|PhD|Doctorate|B\.S\.|M\.S\.|M\.A\.|B\.A\.|MBA)\b/i);
  
  if (institutions) {
    return institutions[0];
  }
  
  return '';
} 