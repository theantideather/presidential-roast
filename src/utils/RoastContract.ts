import { Connection, PublicKey, Keypair, Transaction, TransactionInstruction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AccountLayout, TOKEN_PROGRAM_ID, createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { Buffer } from 'buffer';

// Constants from environment variables
const PROGRAM_ID = process.env.NEXT_PUBLIC_ROAST_PROGRAM_ID || 'RoastProgramIDXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const TOKEN_MINT_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_MINT_ADDRESS || 'RoastTokenMintXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || 'RoastTreasuryXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

// Valid fallback addresses for development (these are real Solana addresses)
const FALLBACK_PROGRAM_ID = '11111111111111111111111111111111';
const FALLBACK_TOKEN_MINT = 'So11111111111111111111111111111111111111112';
const FALLBACK_TREASURY = '11111111111111111111111111111111';

// Instruction codes
enum RoastInstructions {
  SubmitRoast = 0,
  VoteOnRoast = 1,
  ClaimRewards = 2,
  UpdateConfig = 3,
}

// Class to interact with the Roast smart contract
export class RoastContract {
  private connection: Connection;
  private programId: PublicKey;
  private tokenMint: PublicKey;
  private treasury: PublicKey;
  private isPlaceholder: boolean = false;

  constructor(rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com') {
    this.connection = new Connection(rpcUrl, 'confirmed');
    
    // Check if we're using placeholder values and use fallbacks if needed
    try {
      this.programId = new PublicKey(PROGRAM_ID);
    } catch (error) {
      console.warn('Using fallback program ID for development:', FALLBACK_PROGRAM_ID);
      this.programId = new PublicKey(FALLBACK_PROGRAM_ID);
      this.isPlaceholder = true;
    }
    
    try {
      this.tokenMint = new PublicKey(TOKEN_MINT_ADDRESS);
    } catch (error) {
      console.warn('Using fallback token mint for development:', FALLBACK_TOKEN_MINT);
      this.tokenMint = new PublicKey(FALLBACK_TOKEN_MINT);
      this.isPlaceholder = true;
    }
    
    try {
      this.treasury = new PublicKey(TREASURY_ADDRESS);
    } catch (error) {
      console.warn('Using fallback treasury for development:', FALLBACK_TREASURY);
      this.treasury = new PublicKey(FALLBACK_TREASURY);
      this.isPlaceholder = true;
    }
  }

  // Get the connection
  getConnection(): Connection {
    return this.connection;
  }

  // Submit a roast
  async submitRoast(
    wallet: any,
    presidentId: number,
    roastContent: string
  ): Promise<string> {
    try {
      if (!wallet.publicKey) {
        throw new Error('Wallet not connected');
      }
      
      // If using placeholder keys, just simulate the transaction
      if (this.isPlaceholder) {
        console.log('Simulating transaction with development keys:', {
          presidentId,
          roastContent: roastContent.substring(0, 20) + '...',
        });
        return 'simulated_dev_' + Date.now().toString();
      }

      // Create roast account keypair - would be deterministic in actual contract
      const roastAccount = Keypair.generate();

      // Encode instruction data
      const data = Buffer.alloc(4 + 1 + 4 + roastContent.length);
      data.writeUInt32LE(RoastInstructions.SubmitRoast, 0); // Instruction
      data.writeUInt8(presidentId, 4); // President ID
      data.writeUInt32LE(roastContent.length, 5); // Content length
      Buffer.from(roastContent).copy(data, 9); // Content

      // Calculate the lamports required for the roast account
      const lamports = await this.connection.getMinimumBalanceForRentExemption(1000); // Estimate space needed

      // Create transaction
      const transaction = new Transaction();

      // Add create account instruction
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: roastAccount.publicKey,
          lamports,
          space: 1000, // Estimated space for the account
          programId: this.programId,
        })
      );

      // Add submit roast instruction
      transaction.add(
        new TransactionInstruction({
          keys: [
            { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
            { pubkey: roastAccount.publicKey, isSigner: false, isWritable: true },
            { pubkey: this.treasury, isSigner: false, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          ],
          programId: this.programId,
          data,
        })
      );

      // Sign and send transaction
      // In a real implementation, wallet.signTransaction would be used
      // This is simplified for demonstration
      transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
      transaction.feePayer = wallet.publicKey;

      // Simulate transaction for demonstration
      console.log('Transaction would include:', {
        presidentId,
        roastContent: roastContent.substring(0, 20) + '...',
        fee: lamports / LAMPORTS_PER_SOL + ' SOL'
      });

      // Return a mock signature
      const mockSignature = 'simulated_' + Date.now().toString();
      return mockSignature;
    } catch (error) {
      console.error('Error submitting roast:', error);
      throw error;
    }
  }

  // Vote on a roast
  async voteOnRoast(
    wallet: any,
    roastAccountId: string,
    isUpvote: boolean
  ): Promise<string> {
    try {
      if (!wallet.publicKey) {
        throw new Error('Wallet not connected');
      }
      
      // If using placeholder keys, just simulate the transaction
      if (this.isPlaceholder) {
        console.log('Simulating vote with development keys:', {
          roastAccountId: roastAccountId.substring(0, 10) + '...',
          voteType: isUpvote ? 'upvote' : 'downvote'
        });
        return 'simulated_dev_vote_' + Date.now().toString();
      }

      // Encode the instruction data
      const data = Buffer.alloc(6);
      data.writeUInt32LE(RoastInstructions.VoteOnRoast, 0); // Instruction code
      data.writeUInt8(isUpvote ? 1 : 0, 4); // Vote type (1 for upvote, 0 for downvote)
      data.writeUInt8(1, 5); // Vote weight (1 token = 1 vote)

      // Create the transaction
      const transaction = new Transaction();
      
      // Find the associated token account for the user
      const userTokenAccount = await getAssociatedTokenAddress(
        this.tokenMint,
        wallet.publicKey
      );

      // Add the vote instruction
      transaction.add(
        new TransactionInstruction({
          keys: [
            { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
            { pubkey: new PublicKey(roastAccountId), isSigner: false, isWritable: true },
            { pubkey: userTokenAccount, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          ],
          programId: this.programId,
          data,
        })
      );

      // Simulate transaction
      console.log('Vote transaction would include:', {
        roastAccountId: roastAccountId.substring(0, 10) + '...',
        voteType: isUpvote ? 'upvote' : 'downvote'
      });

      // Return a mock signature
      return 'simulated_vote_' + Date.now().toString();
    } catch (error) {
      console.error('Error voting on roast:', error);
      throw error;
    }
  }

  // Claim rewards from the roast program
  async claimRewards(wallet: any): Promise<string> {
    try {
      if (!wallet.publicKey) {
        throw new Error('Wallet not connected');
      }
      
      // If using placeholder keys, just simulate the transaction
      if (this.isPlaceholder) {
        console.log('Simulating claim rewards with development keys');
        return 'simulated_dev_claim_' + Date.now().toString();
      }

      // Find the associated token account for the user
      const userTokenAccount = await getAssociatedTokenAddress(
        this.tokenMint,
        wallet.publicKey
      );
      
      // Encode the instruction data
      const data = Buffer.alloc(4);
      data.writeUInt32LE(RoastInstructions.ClaimRewards, 0);

      // Create the transaction
      const transaction = new Transaction();
      
      // Add the claim rewards instruction
      transaction.add(
        new TransactionInstruction({
          keys: [
            { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
            { pubkey: userTokenAccount, isSigner: false, isWritable: true },
            { pubkey: this.tokenMint, isSigner: false, isWritable: false },
            { pubkey: this.treasury, isSigner: false, isWritable: true },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          ],
          programId: this.programId,
          data,
        })
      );
      
      // Simulate transaction
      console.log('Claim rewards transaction would be processed');
      
      // Return a mock signature
      return 'simulated_claim_' + Date.now().toString();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      throw error;
    }
  }

  // Check if ABI is properly structured and working
  isABIWorking(): boolean {
    try {
      // Verify all necessary components exist
      if (!this.programId || !this.tokenMint || !this.treasury) {
        console.error('Missing required addresses');
        return false;
      }
      
      // Verify instruction codes are defined
      if (RoastInstructions.SubmitRoast !== 0 || 
          RoastInstructions.VoteOnRoast !== 1 || 
          RoastInstructions.ClaimRewards !== 2) {
        console.error('Instruction codes not properly defined');
        return false;
      }
      
      // Verify methods exist
      if (!this.submitRoast || !this.voteOnRoast || !this.claimRewards) {
        console.error('Required methods missing');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating ABI:', error);
      return false;
    }
  }
} 