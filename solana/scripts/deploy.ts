import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { 
  PublicKey, 
  Keypair, 
  Connection, 
  SystemProgram,
  SYSVAR_RENT_PUBKEY
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import { 
  PROGRAM_ID as METADATA_PROGRAM_ID 
} from '@metaplex-foundation/mpl-token-metadata';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// Constants
const ROAST_TOKEN_PROGRAM_ID = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
const ROAST_NFT_PROGRAM_ID = new PublicKey("RoaStnFttMhnLXVxY5Lz2RXRxUWzjXtjuYP3oTNro4R");

// Setup
async function main() {
  // Configure the client
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  // Load programs
  const tokenProgram = await Program.at(ROAST_TOKEN_PROGRAM_ID, provider);
  const nftProgram = await Program.at(ROAST_NFT_PROGRAM_ID, provider);
  
  console.log("Deploying with wallet:", provider.wallet.publicKey.toString());

  // Deploy ROAST token
  const tokenMint = await deployRoastToken(provider, tokenProgram);
  
  // Save deployment info
  const deploymentInfo = {
    network: provider.connection.rpcEndpoint,
    tokenMint: tokenMint.toString(),
    tokenProgramId: ROAST_TOKEN_PROGRAM_ID.toString(),
    nftProgramId: ROAST_NFT_PROGRAM_ID.toString(),
    deployedAt: new Date().toISOString(),
  };
  
  fs.writeFileSync(
    path.join(__dirname, '..', 'deployment.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("Deployment completed successfully!");
  console.log("Token mint address:", tokenMint.toString());
}

// Deploy the ROAST token
async function deployRoastToken(provider: anchor.AnchorProvider, program: Program) {
  console.log("Deploying ROAST token...");
  
  // Generate a new keypair for the token mint
  const tokenMint = Keypair.generate();
  
  // Calculate metadata PDA
  const [metadataAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), tokenMint.publicKey.toBytes()],
    program.programId
  );
  
  // Initialize the token
  const tokenName = "Presidential Roast Token";
  const tokenSymbol = "ROAST";
  const tokenUri = "https://presidentialroast.app/token-metadata.json";
  const decimals = 9;
  
  await program.methods
    .initializeToken(
      tokenName,
      tokenSymbol,
      tokenUri,
      decimals
    )
    .accounts({
      mintAuthority: provider.wallet.publicKey,
      metadata: metadataAccount,
      tokenMint: tokenMint.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .signers([tokenMint])
    .rpc();
  
  console.log("ROAST token deployed successfully!");
  
  return tokenMint.publicKey;
}

// Run the deployment
main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
); 