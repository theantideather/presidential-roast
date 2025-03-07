import { RoastContract } from './RoastContract';

// Create contract instance
const roastContract = new RoastContract();

// Check if ABI is working properly
export const isABIWorking = (): boolean => {
  return roastContract.isABIWorking();
};

// Submit a roast to the blockchain
export const submitRoast = async (
  wallet: any,
  presidentId: number,
  roastContent: string
): Promise<string> => {
  try {
    return await roastContract.submitRoast(wallet, presidentId, roastContent);
  } catch (error) {
    console.error('Error submitting roast:', error);
    throw error;
  }
};

// Vote on a roast
export const voteOnRoast = async (
  wallet: any,
  roastAccountId: string,
  isUpvote: boolean
): Promise<string> => {
  try {
    return await roastContract.voteOnRoast(wallet, roastAccountId, isUpvote);
  } catch (error) {
    console.error('Error voting on roast:', error);
    throw error;
  }
};

// Claim rewards
export const claimRewards = async (wallet: any): Promise<string> => {
  try {
    return await roastContract.claimRewards(wallet);
  } catch (error) {
    console.error('Error claiming rewards:', error);
    throw error;
  }
};

// Get user token balance
export const getUserTokenBalance = async (
  wallet: any
): Promise<number> => {
  try {
    if (!wallet.publicKey) {
      return 0;
    }

    // Simulate a token balance for demonstration
    // In a real implementation, this would query the blockchain
    return Math.floor(Math.random() * 100);
  } catch (error) {
    console.error('Error getting token balance:', error);
    return 0;
  }
}; 