"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaTwitter, FaWallet, FaBars, FaTimes, FaExclamationTriangle, FaCoins } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getPhantomProvider, connectPhantomWallet, disconnectPhantomWallet, getRoastTokenBalance, PhantomProvider } from '../../utils/PhantomWallet';

export default function Header() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [phantomInstalled, setPhantomInstalled] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [provider, setProvider] = useState<PhantomProvider | null>(null);
  
  useEffect(() => {
    const checkForPhantom = async () => {
      // Phantom injects the provider into window.phantom
      const phantomProvider = getPhantomProvider();
      
      if (phantomProvider) {
        console.log("Phantom wallet detected!");
        setPhantomInstalled(true);
        setProvider(phantomProvider);
        
        // Set up connection change event listeners
        phantomProvider.on('connect', async (publicKey: any) => {
          console.log(`Connected to ${publicKey.toString()}`);
          const address = publicKey.toString();
          setWalletAddress(address);
          setIsWalletConnected(true);
          localStorage.setItem('walletAddress', address);
          
          // Get token balance when wallet is connected
          try {
            const balance = await getRoastTokenBalance(address);
            setTokenBalance(balance);
          } catch (err) {
            console.error("Error fetching token balance:", err);
          }
          
          window.dispatchEvent(new Event('walletConnectionChanged'));
        });
        
        phantomProvider.on('disconnect', () => {
          console.log("Disconnected from wallet");
          setWalletAddress('');
          setIsWalletConnected(false);
          setTokenBalance(0);
          localStorage.removeItem('walletAddress');
          window.dispatchEvent(new Event('walletConnectionChanged'));
        });
        
        phantomProvider.on('accountChanged', async (publicKey: any) => {
          if (publicKey) {
            // User switched accounts
            const address = publicKey.toString();
            console.log(`Switched to account ${address}`);
            setWalletAddress(address);
            localStorage.setItem('walletAddress', address);
            
            // Update token balance for the new account
            try {
              const balance = await getRoastTokenBalance(address);
              setTokenBalance(balance);
            } catch (err) {
              console.error("Error fetching token balance for new account:", err);
            }
            
            window.dispatchEvent(new Event('walletConnectionChanged'));
          } else {
            // User disconnected
            setWalletAddress('');
            setIsWalletConnected(false);
            setTokenBalance(0);
            localStorage.removeItem('walletAddress');
            window.dispatchEvent(new Event('walletConnectionChanged'));
          }
        });
        
        // Check if already connected
        if (phantomProvider.isConnected) {
          try {
            setIsWalletConnected(true);
            if (phantomProvider.publicKey) {
              const address = phantomProvider.publicKey.toString();
              setWalletAddress(address);
              localStorage.setItem('walletAddress', address);
              
              // Get token balance for already connected wallet
              const balance = await getRoastTokenBalance(address);
              setTokenBalance(balance);
            }
          } catch (err) {
            console.error("Error with existing connection:", err);
          }
        } else {
          // Try to recover from localStorage
          const savedWalletAddress = localStorage.getItem('walletAddress');
          if (savedWalletAddress) {
            try {
              // Attempt to reconnect if we have a saved address
              await connectWallet();
            } catch (err) {
              console.error("Error reconnecting with saved address:", err);
              // Clear invalid saved data
              localStorage.removeItem('walletAddress');
            }
          }
        }
      } else {
        console.log("Phantom wallet not detected");
        setPhantomInstalled(false);
      }
    };
    
    // Check for Phantom wallet only on client side
    if (typeof window !== 'undefined') {
      // Wait for window to be fully loaded
      window.addEventListener('load', checkForPhantom);
      
      // Also check immediately in case window is already loaded
      if (document.readyState === 'complete') {
        checkForPhantom();
      }
      
      return () => {
        window.removeEventListener('load', checkForPhantom);
      };
    }
  }, []);
  
  const connectWallet = async () => {
    try {
      const result = await connectPhantomWallet();
      
      if (result.success && result.address) {
        setWalletAddress(result.address);
        setIsWalletConnected(true);
        
        // Get token balance
        const balance = await getRoastTokenBalance(result.address);
        setTokenBalance(balance);
        
        // Dispatch event for other components
        window.dispatchEvent(new Event('walletConnectionChanged'));
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error in connectWallet:', error);
      return false;
    }
  };
  
  const disconnectWallet = async () => {
    try {
      const success = await disconnectPhantomWallet();
      
      if (success) {
        setIsWalletConnected(false);
        setWalletAddress('');
        setTokenBalance(0);
        
        // Dispatch event for other components
        window.dispatchEvent(new Event('walletConnectionChanged'));
      }
    } catch (error) {
      console.error('Error in disconnectWallet:', error);
    }
  };
  
  const formatWalletAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };
  
  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/trump-logo.png" 
              alt="Presidential Roast Logo" 
              width={40} 
              height={40} 
              className="rounded-full"
            />
            <h1 className="text-white font-bold text-xl md:text-2xl">Presidential Roast</h1>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Add Twitter link */}
            <a href="https://twitter.com/presidentialroast" target="_blank" rel="noopener noreferrer" 
              className="text-blue-400 hover:text-blue-300 transition-colors">
              <FaTwitter size={24} />
            </a>
            
            {/* Token Balance - Only show when connected */}
            {isWalletConnected && (
              <div className="flex items-center gap-2 bg-gray-800 rounded-full py-1 px-3 text-sm">
                <FaCoins className="text-yellow-500" />
                <span className="text-yellow-500 font-medium">{tokenBalance}</span>
                <span className="text-gray-300">ROAST</span>
              </div>
            )}
            
            {/* Wallet Connect/Disconnect Button */}
            {isWalletConnected ? (
              <button 
                onClick={disconnectWallet} 
                className="flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white font-medium rounded-full py-1.5 px-4 transition-colors"
              >
                <FaWallet />
                <span>{formatWalletAddress(walletAddress)}</span>
              </button>
            ) : (
              <button 
                onClick={connectWallet} 
                className={`flex items-center gap-2 bg-purple-700 hover:bg-purple-600 text-white font-medium rounded-full py-1.5 px-4 transition-colors ${!phantomInstalled ? 'opacity-80' : ''}`}
                disabled={!phantomInstalled}
              >
                <FaWallet />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-4">
            {/* Token Balance - Only show when connected */}
            {isWalletConnected && (
              <div className="flex items-center justify-center gap-2 bg-gray-700 rounded-full py-2 px-4">
                <FaCoins className="text-yellow-500" />
                <span className="text-yellow-500 font-medium">{tokenBalance}</span>
                <span className="text-gray-300">ROAST</span>
              </div>
            )}
            
            {/* Wallet Connect/Disconnect Button */}
            {isWalletConnected ? (
              <button 
                onClick={disconnectWallet} 
                className="flex items-center justify-center gap-2 bg-red-700 hover:bg-red-600 text-white font-medium rounded-full py-2 px-4 transition-colors"
              >
                <FaWallet />
                <span>{formatWalletAddress(walletAddress)}</span>
              </button>
            ) : (
              <button 
                onClick={connectWallet} 
                className={`flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-600 text-white font-medium rounded-full py-2 px-4 transition-colors ${!phantomInstalled ? 'opacity-80' : ''}`}
                disabled={!phantomInstalled}
              >
                <FaWallet />
                <span>Connect Wallet</span>
              </button>
            )}
            
            {/* Add Twitter link */}
            <a 
              href="https://twitter.com/presidentialroast" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 transition-colors py-2"
            >
              <FaTwitter size={20} />
              <span>Follow us on Twitter</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

// Define TypeScript interface for window to include Phantom provider
declare global {
  interface Window {
    phantom?: {
      solana?: any;
    };
    solana?: any;
  }
} 