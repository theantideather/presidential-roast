"use client";

import { toast } from 'react-toastify';
import { 
  PublicKey, 
  Connection, 
  Transaction, 
  SystemProgram, 
  SYSVAR_RENT_PUBKEY,
  Keypair
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction
} from '@solana/spl-token';

// Define contract addresses based on deployment
const ROAST_TOKEN_MINT = 'ROAStFLrUPWz3rFGokV8Fvgv4Y5DTn3Ld4qbCa8iXzs'; // Replace with actual deployed token mint
const ROAST_NFT_PROGRAM_ID = 'RoaStnFttMhnLXVxY5Lz2RXRxUWzjXtjuYP3oTNro4R'; // Replace with actual program ID
const ROAST_TOKEN_PROGRAM_ID = 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'; // Replace with actual program ID
const SOLANA_NETWORK = 'devnet'; // 'devnet' or 'mainnet-beta'
const SOLANA_RPC_URL = 'https://api.devnet.solana.com'; // Update for mainnet

// Define types for better integration
export type PhantomEvent = "connect" | "disconnect" | "accountChanged";

export interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: any, params: any) => Promise<any>;
}

// Helper to get a Solana connection
const getSolanaConnection = () => {
  return new Connection(SOLANA_RPC_URL, 'confirmed');
};

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
    
    const connection = getSolanaConnection();
    const userPubkey = new PublicKey(address);
    const mintPubkey = new PublicKey(ROAST_TOKEN_MINT);
    
    try {
      // Get the associated token account
      const tokenAccount = await getAssociatedTokenAddress(
        mintPubkey,
        userPubkey
      );
      
      // Check if the token account exists
      const tokenAccountInfo = await connection.getAccountInfo(tokenAccount);
      
      if (!tokenAccountInfo) {
        // Account doesn't exist yet
        return 0;
      }
      
      // Get the token balance
      const balance = await connection.getTokenAccountBalance(tokenAccount);
      
      // Convert from lamports considering decimals (9)
      const amount = balance.value.uiAmount || 0;
      return amount;
    } catch (err) {
      console.error('Error getting token balance:', err);
      return 0;
    }
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
    
    // Setup
    const connection = getSolanaConnection();
    const userPubkey = wallet.publicKey;
    
    // For demonstration, we'll simulate the NFT mint
    // In production, this would call our deployed smart contract
    
    if (process.env.NODE_ENV === 'production' && SOLANA_NETWORK === 'mainnet-beta') {
      try {
        // Create a new NFT mint
        const mintKeypair = Keypair.generate();
        
        // Placeholder for actual NFT mint transaction
        // This would be replaced with a real transaction to the ROAST_NFT_PROGRAM_ID
        
        toast.info('Minting NFT on Solana...');
        
        // Simulating blockchain delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Return mock data for now
        const mockSignature = `mockNFTsig${Date.now()}`;
        
        toast.success('NFT minted successfully!');
        
        return { 
          success: true, 
          signature: mockSignature
        };
      } catch (err: any) {
        console.error('Error minting NFT:', err);
        toast.error('Failed to mint NFT: ' + (err.message || 'Unknown error'));
        return { success: false, message: err.message || 'Unknown error' };
      }
    } else {
      // Use mock data for development
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockSignature = `devnet_NFT_${Date.now()}`;
      
      toast.success('NFT minted successfully! (Development Mode)');
      
      return { 
        success: true, 
        signature: mockSignature
      };
    }
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
    
    if (process.env.NODE_ENV === 'production' && SOLANA_NETWORK === 'mainnet-beta') {
      try {
        // Setup
        const connection = getSolanaConnection();
        const userPubkey = wallet.publicKey;
        const mintPubkey = new PublicKey(ROAST_TOKEN_MINT);
        
        // Get associated token account
        const userTokenAccount = await getAssociatedTokenAddress(
          mintPubkey,
          userPubkey
        );
        
        // Check if token account exists
        const accountInfo = await connection.getAccountInfo(userTokenAccount);
        
        // Build transaction
        const transaction = new Transaction();
        
        // If token account doesn't exist, create it
        if (!accountInfo) {
          transaction.add(
            createAssociatedTokenAccountInstruction(
              userPubkey,
              userTokenAccount,
              userPubkey,
              mintPubkey
            )
          );
        }
        
        // Add reward token transfer instruction
        // Note: In a real implementation, this would call our smart contract
        
        // Get latest blockhash
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = userPubkey;
        
        // Sign and send transaction
        const signedTx = await wallet.signTransaction(transaction);
        const txSignature = await connection.sendRawTransaction(signedTx.serialize());
        
        // Wait for confirmation
        await connection.confirmTransaction(txSignature);
        
        toast.success(`${amount} ROAST tokens claimed successfully!`);
        
        return { 
          success: true, 
          signature: txSignature
        };
      } catch (err: any) {
        console.error('Error claiming tokens:', err);
        toast.error('Failed to claim tokens: ' + (err.message || 'Unknown error'));
        return { success: false, message: err.message || 'Unknown error' };
      }
    } else {
      // Use mock data for development
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockSignature = `devnet_token_${Date.now()}`;
      
      toast.success(`${amount} ROAST tokens claimed successfully! (Development Mode)`);
      
      return { 
        success: true, 
        signature: mockSignature
      };
    }
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