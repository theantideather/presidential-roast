# Presidential Roast Solana Smart Contracts

This directory contains the Solana smart contracts for the Presidential Roast application, including:
- ROAST token contract (SPL Token)
- NFT minting program for Presidential Roast NFTs

## Development Setup

1. Install Solana CLI tools:
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
```

2. Install Anchor Framework:
```bash
npm install -g @coral-xyz/anchor-cli
```

3. Configure Solana CLI for development:
```bash
solana config set --url devnet
```

4. Generate a development wallet:
```bash
solana-keygen new -o ./id.json
```

5. Request airdrop for development:
```bash
solana airdrop 2 $(solana-keygen pubkey ./id.json)
```

## Project Structure

- `token/` - ROAST token contract
- `nft/` - Presidential Roast NFT minting program
- `scripts/` - Deployment and testing scripts
- `tests/` - Test scripts

## Development Workflow

1. Build the programs:
```bash
anchor build
```

2. Test the programs:
```bash
anchor test
```

3. Deploy to devnet:
```bash
anchor deploy --provider.cluster devnet
```

## Contracts Overview

### ROAST Token Contract

- Standard SPL token with custom metadata
- Initial supply: 1,000,000 ROAST
- Decimals: 9 (standard for Solana tokens)
- Minting authority: Treasury wallet

### NFT Minting Program

- Mints unique NFTs based on roast content
- Stores metadata on-chain
- Awards ROAST tokens based on roast score
- Executive Order NFTs for high-scoring roasts 