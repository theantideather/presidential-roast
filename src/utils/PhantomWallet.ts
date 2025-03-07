"use client";

import { toast } from 'react-toastify';
import { PublicKey, Connection } from '@solana/web3.js';

// Define valid Solana addresses for development
const ROAST_TOKEN_MINT = 'So11111111111111111111111111111111111111112'; // Using SOL as placeholder

// Define types for better integration
export type PhantomEvent = "connect" | "disconnect" | "accountChanged";

export interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: any) => Promise<any>;
  signAllTransactions: (transactions: any[]) => Promise<any[]>;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: any, params: any) => Promise<any>;
}

// Get the provider from window
export const getPhantomProvider = (): PhantomProvider | null => {
  if (typeof window !== 'undefined') {
    // First try the new location in window.phantom
    if ('phantom' in window) {
      const provider = window.phantom?.solana;
      if (provider?.isPhantom) {
        return provider as unknown as PhantomProvider;
      }
    }
    
    // Try legacy location
    if ('solana' in window && window.solana?.isPhantom) {
      return window.solana as unknown as PhantomProvider;
    }
  }
  return null;
};

// Connect to Phantom wallet
export const connectPhantomWallet = async (): Promise<{ success: boolean, address?: string, message?: string }> => {
  try {
    const provider = getPhantomProvider();
    
    if (!provider) {
      toast.error('Phantom wallet not installed!');
      window.open('https://phantom.app/', '_blank');
      return { success: false, message: 'Phantom wallet not installed' };
    }
    
    toast.info('Connecting to Phantom wallet...', { autoClose: 2000 });
    
    try {
      const { publicKey } = await provider.connect();
      const address = publicKey.toString();
      
      // Store the address in localStorage for persistence
      localStorage.setItem('walletAddress', address);
      
      toast.success('Wallet connected successfully!');
      return { success: true, address };
    } catch (error: any) {
      if (error.message?.includes('User rejected')) {
        toast.error('Connection rejected by user');
      } else {
        toast.error(`Failed to connect: ${error.message || 'Unknown error'}`);
      }
      return { success: false, message: error.message || 'Unknown error' };
    }
  } catch (error: any) {
    console.error('Wallet connection error:', error);
    toast.error('Failed to connect wallet');
    return { success: false, message: error.message || 'Unknown error' };
  }
};

// Disconnect from Phantom wallet
export const disconnectPhantomWallet = async (): Promise<boolean> => {
  try {
    const provider = getPhantomProvider();
    
    if (provider) {
      await provider.disconnect();
    }
    
    // Clean up stored data
    localStorage.removeItem('walletAddress');
    
    toast.info('Wallet disconnected');
    return true;
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
    toast.error('Failed to disconnect wallet');
    return false;
  }
};

// Get ROAST token balance
export const getRoastTokenBalance = async (address: string): Promise<number> => {
  try {
    if (!address) return 0;
    
    // In real implementation, we would fetch actual token balance
    // For demonstration, we'll return a random number
    // This would be replaced with actual token balance logic
    
    // Simulating API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return a random balance between 0 and 100
    return Math.floor(Math.random() * 100);
  } catch (error) {
    console.error('Error getting token balance:', error);
    return 0;
  }
};

// Mint an NFT for a roast
export const mintRoastNFT = async (
  wallet: PhantomProvider | null,
  roastContent: string,
  roastScore: number
): Promise<{ success: boolean, signature?: string, message?: string }> => {
  try {
    if (!wallet || !wallet.publicKey) {
      return { success: false, message: 'Wallet not connected' };
    }
    
    toast.info('Preparing to mint your roast as an NFT...', { autoClose: 3000 });
    
    // In a real implementation, this would mint an actual NFT on Solana
    // For demonstration, we'll simulate the process
    
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a mock signature
    const mockSignature = `mockNFTsig${Date.now()}`;
    
    toast.success('NFT minted successfully!');
    
    return { 
      success: true, 
      signature: mockSignature
    };
  } catch (error: any) {
    console.error('Error minting NFT:', error);
    toast.error(`Failed to mint NFT: ${error.message || 'Unknown error'}`);
    return { success: false, message: error.message || 'Unknown error' };
  }
};

// Claim ROAST tokens
export const claimRoastTokens = async (
  wallet: PhantomProvider | null,
  amount: number
): Promise<{ success: boolean, signature?: string, message?: string }> => {
  try {
    if (!wallet || !wallet.publicKey) {
      return { success: false, message: 'Wallet not connected' };
    }
    
    toast.info(`Claiming ${amount} ROAST tokens...`, { autoClose: 3000 });
    
    // In a real implementation, this would transfer tokens to the user
    // For demonstration, we'll simulate the process
    
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create a mock signature
    const mockSignature = `mockTokenClaim${Date.now()}`;
    
    toast.success(`${amount} ROAST tokens claimed successfully!`);
    
    return { 
      success: true, 
      signature: mockSignature
    };
  } catch (error: any) {
    console.error('Error claiming tokens:', error);
    toast.error(`Failed to claim tokens: ${error.message || 'Unknown error'}`);
    return { success: false, message: error.message || 'Unknown error' };
  }
};

// Define TypeScript interface for window to include Phantom provider
declare global {
  interface Window {
    phantom?: {
      solana?: any;
    };
    solana?: any;
  }
} 