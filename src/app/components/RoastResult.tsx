"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaTwitter, FaCopy, FaCoins, FaCheck, FaDownload, FaSpinner, FaExclamationTriangle, FaWallet, FaFileAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getPhantomProvider, claimRoastTokens, mintRoastNFT, PhantomProvider } from '../../utils/PhantomWallet';

interface RoastResultProps {
  roastData: {
    roast: string;
    score: number;
    analysis: string;
    imageUrl?: string;
  };
  onReset: () => void;
}

export default function RoastResult({ roastData, onReset }: RoastResultProps) {
  console.log('RoastResult component rendered with:', roastData);
  
  const [isCopied, setIsCopied] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [provider, setProvider] = useState<PhantomProvider | null>(null);
  const [tokensClaimed, setTokensClaimed] = useState(false);
  const [nftMinted, setNftMinted] = useState(false);
  const [isClaimingTokens, setIsClaimingTokens] = useState(false);
  const [isMintingNFT, setIsMintingNFT] = useState(false);
  const [phantomInstalled, setPhantomInstalled] = useState(false);
  const [nftData, setNftData] = useState<{
    mint: string;
    txId: string;
    imageUrl: string;
  } | null>(null);
  
  // Tokens to award based on roast score
  const getTokenAmount = (score: number) => {
    if (score >= 90) return 100;
    if (score >= 80) return 75;
    if (score >= 70) return 50;
    if (score >= 50) return 25;
    return 10;
  };
  
  useEffect(() => {
    console.log('RoastResult useEffect running with roastData:', roastData);
    // Check wallet connection status
    const checkWalletConnection = () => {
      const phantomProvider = getPhantomProvider();
      
      if (phantomProvider && phantomProvider.isConnected && phantomProvider.publicKey) {
        setIsWalletConnected(true);
        setWalletAddress(phantomProvider.publicKey.toString());
        setProvider(phantomProvider);
      } else {
        setIsWalletConnected(false);
        setWalletAddress('');
        setProvider(null);
      }
    };
    
    // Reset state when new result
    if (roastData) {
      setTokensClaimed(false);
      setNftMinted(false);
    }
    
    checkWalletConnection();
    
    // Listen for wallet connection changes
    window.addEventListener('walletConnectionChanged', checkWalletConnection);
    
    return () => {
      window.removeEventListener('walletConnectionChanged', checkWalletConnection);
    };
  }, [roastData]);
  
  useEffect(() => {
    const checkWalletStatus = () => {
      // Check for wallet connection in localStorage
      const savedWalletAddress = localStorage.getItem('walletAddress');
      if (savedWalletAddress) {
        setWalletAddress(savedWalletAddress);
        setIsWalletConnected(true);
      } else {
        setWalletAddress('');
        setIsWalletConnected(false);
      }
      
      // Check if Phantom is installed
      const provider = getProvider();
      setPhantomInstalled(!!provider);
    };
    
    // Initial check
    if (typeof window !== 'undefined') {
      checkWalletStatus();
      
      // Listen for wallet connection changes
      window.addEventListener('walletConnectionChanged', checkWalletStatus);
      
      return () => {
        window.removeEventListener('walletConnectionChanged', checkWalletStatus);
      };
    }
  }, []);
  
  // Helper function to get Phantom provider
  const getProvider = () => {
    if (typeof window !== 'undefined') {
      if ('phantom' in window) {
        const provider = window.phantom?.solana;
        if (provider?.isPhantom) {
          return provider;
        }
      }
      
      // Legacy location
      if ('solana' in window && window.solana?.isPhantom) {
        return window.solana;
      }
    }
    return null;
  };
  
  const copyToClipboard = () => {
    if (!roastData) return;
    
    navigator.clipboard.writeText(roastData.roast)
      .then(() => {
        setIsCopied(true);
        toast.success('Roast copied to clipboard!');
        setTimeout(() => setIsCopied(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast.error('Failed to copy text');
      });
  };
  
  const shareOnTwitter = () => {
    if (!roastData) return;
    
    const tweetText = encodeURIComponent(`I just got roasted by Presidential Roast! My score: ${roastData.score}/100\n\n"${roastData.roast.substring(0, 100)}..."\n\nTry it yourself at presidentialroast.app`);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  };
  
  const claimTokens = async () => {
    if (!roastData || !isWalletConnected || !provider) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (tokensClaimed) {
      toast.info('You have already claimed tokens for this roast');
      return;
    }
    
    setIsClaimingTokens(true);
    
    try {
      const tokenAmount = getTokenAmount(roastData.score);
      const claimResult = await claimRoastTokens(provider, tokenAmount);
      
      if (claimResult.success) {
        setTokensClaimed(true);
        toast.success(`Successfully claimed ${tokenAmount} ROAST tokens!`);
      } else {
        toast.error(claimResult.message || 'Failed to claim tokens');
      }
    } catch (error) {
      console.error('Error claiming tokens:', error);
      toast.error('An error occurred while claiming tokens');
    } finally {
      setIsClaimingTokens(false);
    }
  };
  
  const mintNFT = async () => {
    if (!roastData || !isWalletConnected || !provider) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (nftMinted) {
      toast.info('You have already minted this roast as an NFT');
      return;
    }
    
    setIsMintingNFT(true);
    
    try {
      const mintResult = await mintRoastNFT(provider, roastData.roast, roastData.score);
      
      if (mintResult.success) {
        setNftMinted(true);
        toast.success('Successfully minted your roast as an NFT!');
      } else {
        toast.error(mintResult.message || 'Failed to mint NFT');
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error('An error occurred while minting the NFT');
    } finally {
      setIsMintingNFT(false);
    }
  };
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(roastData?.roast || '');
    setIsCopied(true);
    toast.success('Roast copied to clipboard!');
    setTimeout(() => setIsCopied(false), 3000);
  };
  
  const handleShareOnTwitter = () => {
    const text = encodeURIComponent(`I just got roasted by Presidential Roast! My score: ${roastData?.score}/100\n\n"${roastData?.roast.substring(0, 100)}..."\n\nTry it yourself at presidentialroast.app`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };
  
  const connectWallet = async () => {
    try {
      const provider = getProvider();
      
      if (!provider) {
        toast.error('Phantom wallet not installed!', {
          icon: <FaExclamationTriangle className="text-yellow-500" />
        });
        window.open('https://phantom.app/', '_blank');
        return;
      }
      
      toast.info('Connecting to Phantom wallet...');
      
      try {
        // Connect and get public key
        const { publicKey } = await provider.connect();
        const address = publicKey.toString();
        
        // Update state and localStorage
        setWalletAddress(address);
        setIsWalletConnected(true);
        localStorage.setItem('walletAddress', address);
        
        // Dispatch event for other components
        window.dispatchEvent(new Event('walletConnectionChanged'));
        
        toast.success('Wallet connected successfully!');
      } catch (connectError: any) {
        // Handle connection errors
        console.error('Connection error:', connectError);
        
        if (connectError.message?.includes('User rejected')) {
          toast.error('Connection rejected by user');
        } else {
          toast.error(`Failed to connect: ${connectError.message || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error('Failed to connect wallet');
    }
  };
  
  // Format wallet address for display (first 4 and last 4 characters)
  const formatWalletAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };
  
  // Early checks for loading, error, or missing data
  if (typeof window !== 'undefined') {
    if (!roastData) {
      console.error("RoastResult received no roastData!");
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 gold-border text-center">
          <h2 className="text-2xl font-bold mb-4 trumpify text-[var(--maga-red)]">
            ERROR: MISSING ROAST DATA
          </h2>
          <p className="mb-4">
            The presidential roast could not be displayed. Please try again.
          </p>
          <button 
            onClick={onReset}
            className="trump-btn"
          >
            TRY AGAIN
          </button>
        </div>
      );
    }
  }
  
  if (!roastData) {
    console.error("RoastResult component rendered with no data!");
    return null;
  }
  
  const tokenAmount = getTokenAmount(roastData.score);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden max-w-3xl mx-auto mb-8 border-8 border-[var(--gold)]">
      {/* Official-looking header */}
      <div className="trump-gradient py-4 px-4 text-center">
        <h3 className="text-xl md:text-2xl trumpify text-white tracking-wide">THE OFFICIAL PRESIDENTIAL ROAST</h3>
        <p className="text-xs md:text-sm text-white font-bold">EXECUTIVE OFFICE OF THE 45TH PRESIDENT</p>
      </div>
      
      <div className="p-6 md:p-8">
        {/* Trump avatar and roast content */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="w-28 h-28 md:w-36 md:h-36 relative rounded-full overflow-hidden border-4 border-[var(--maga-red)] shadow-lg mb-3">
              {/* Trump avatar */}
              <Image 
                src="https://media.giphy.com/media/ZBythhSiZAoYea7qwL/giphy.gif" 
                alt="Trump" 
                width={144} 
                height={144} 
                className="object-cover"
              />
            </div>
            <div className="text-center">
              <div className="font-bold text-[var(--maga-red)] uppercase text-sm">Roast Rating</div>
              <div className="text-4xl font-bold trumpify">{roastData.score}/100</div>
            </div>
          </div>
          
          <div className="flex-grow">
            <div className="bg-gray-100 dark:bg-gray-700 p-5 rounded-lg mb-4 relative border-2 border-[var(--gold)]">
              {/* Quote marks */}
              <span className="absolute top-2 left-2 text-6xl text-[var(--maga-red)] opacity-20">
                "
              </span>
              <p className="italic text-lg relative z-10 whitespace-pre-line font-semibold pl-6 pr-6">{roastData.roast}</p>
              <span className="absolute bottom-2 right-2 text-6xl text-[var(--maga-red)] opacity-20">
                "
              </span>
            </div>
            
            <div className="flex justify-end">
              <div className={`px-5 py-2 rounded-lg text-white font-bold trumpify text-sm ${roastData.score >= 90 ? 'bg-green-600' : roastData.score >= 70 ? 'bg-blue-600' : roastData.score >= 50 ? 'bg-yellow-600' : 'bg-red-600'}`}>
                {roastData.score >= 90 ? '✅ APPROVED' : roastData.score >= 70 ? '✅ APPROVED' : roastData.score >= 50 ? '✅ APPROVED' : '❌ REJECTED'}
              </div>
            </div>
          </div>
        </div>
        
        {/* NFT Display if minted */}
        {nftMinted && nftData && (
          <div className="mb-8 p-5 border-2 border-[var(--gold)] rounded-lg bg-gray-50 dark:bg-gray-700">
            <h3 className="text-xl font-bold text-center mb-4 trumpify text-[var(--maga-red)]">YOUR ROAST NFT</h3>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-1/3">
                <div className="rounded-lg overflow-hidden border-4 border-[var(--gold)] shadow-xl">
                  <img 
                    src={nftData.imageUrl} 
                    alt="Roast NFT" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="w-full md:w-2/3">
                <div className="mb-3">
                  <div className="text-sm font-bold text-gray-500 dark:text-gray-400">NFT Mint Address:</div>
                  <div className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                    {nftData.mint}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-sm font-bold text-gray-500 dark:text-gray-400">Transaction ID:</div>
                  <div className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                    {nftData.txId}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => window.open(`https://solscan.io/tx/${nftData.txId}`, '_blank')}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                  >
                    View on Solscan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Token Claim and NFT Mint Section */}
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-xl font-bold mb-3">Blockchain Rewards</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Token Claim Card */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <FaCoins className="text-yellow-500 mr-2" size={20} />
                <h4 className="text-lg font-bold">ROAST Tokens</h4>
              </div>
              
              <p className="mb-4 text-sm">
                You've earned <span className="font-bold text-yellow-600">{tokenAmount} ROAST</span> tokens for this roast!
              </p>
              
              {tokensClaimed ? (
                <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-2 rounded text-center text-sm">
                  Tokens claimed successfully!
                </div>
              ) : (
                <button
                  onClick={claimTokens}
                  disabled={!isWalletConnected || isClaimingTokens}
                  className={`w-full py-2 px-4 rounded-full flex items-center justify-center space-x-2 
                    ${isWalletConnected 
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                    } transition-colors`}
                >
                  {isClaimingTokens ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Claiming...</span>
                    </>
                  ) : (
                    <>
                      {isWalletConnected ? <FaCoins /> : <FaWallet />}
                      <span>{isWalletConnected ? `Claim ${tokenAmount} ROAST Tokens` : 'Connect Wallet to Claim'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
            
            {/* NFT Mint Card */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <FaFileAlt className="text-purple-500 mr-2" size={20} />
                <h4 className="text-lg font-bold">Mint as NFT</h4>
              </div>
              
              <p className="mb-4 text-sm">
                Immortalize this roast by minting it as an NFT on the Solana blockchain!
              </p>
              
              {nftMinted ? (
                <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-2 rounded text-center text-sm">
                  NFT minted successfully!
                </div>
              ) : (
                <button
                  onClick={mintNFT}
                  disabled={!isWalletConnected || isMintingNFT}
                  className={`w-full py-2 px-4 rounded-full flex items-center justify-center space-x-2 
                    ${isWalletConnected 
                      ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                    } transition-colors`}
                >
                  {isMintingNFT ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Minting...</span>
                    </>
                  ) : (
                    <>
                      {isWalletConnected ? <FaFileAlt /> : <FaWallet />}
                      <span>{isWalletConnected ? 'Mint as NFT' : 'Connect Wallet to Mint'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Analysis Section */}
        {roastData.analysis && (
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-xl font-bold mb-2 trumpify">PRESIDENTIAL ANALYSIS</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              {roastData.analysis.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-gray-700 dark:text-gray-300 mb-3 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex flex-wrap gap-4 justify-center">
          <button 
            onClick={handleCopyToClipboard}
            className="flex items-center px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-bold"
          >
            {isCopied ? <FaCheck className="mr-2" /> : <FaCopy className="mr-2" />}
            {isCopied ? 'COPIED!' : 'COPY ROAST'}
          </button>
          
          <button 
            onClick={handleShareOnTwitter}
            className="flex items-center px-5 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-blue-500 transition-colors font-bold"
          >
            <FaTwitter className="mr-2" />
            SHARE ON TWITTER
          </button>
          
          {isWalletConnected ? (
            <div className="flex items-center px-5 py-2 bg-green-600 text-white rounded-lg font-bold">
              <FaCheck className="mr-2" />
              Wallet connected
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              className="trump-btn flex items-center px-5 py-2 font-bold"
            >
              <FaWallet className="mr-2" />
              CONNECT WALLET
            </button>
          )}
        </div>
        
        <div className="mt-6 text-center">
          {isWalletConnected ? (
            <div className="text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                Wallet connected: <span className="font-bold">{formatWalletAddress(walletAddress)}</span>
              </p>
              {!nftMinted && (
                <p className="text-xs text-[var(--gold)] font-bold mt-1">
                  Mint your roast as an NFT to receive 0.0001 SOL!
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Connect your wallet to mint this roast as an NFT and receive Solana tokens!
            </p>
          )}
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            This is a parody and not affiliated with any political figure or government entity.
          </p>
        </div>
      </div>
    </div>
  );
} 