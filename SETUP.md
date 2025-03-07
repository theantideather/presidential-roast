# Setup Instructions for Presidential Roast

To get the Presidential Roast app fully working with real APIs and Solana integration, follow these steps:

## 1. Environment Variables Setup

Create a `.env.local` file in the root directory with the following content:

```
# OpenAI API Key - Add your key here to enable AI roasts
OPENAI_API_KEY=your_openai_api_key_here

# Solana Configuration - Set to devnet for testing without real SOL
SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# This is exposed to the browser to enable OpenAI calls
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# For server-side NFT minting (if you have a private key)
# Format: comma-separated bytes (e.g., 11,22,33,...)
# SOLANA_PRIVATE_KEY=
```

## 2. OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or log in
3. Generate a new API key
4. Copy the key and paste it in your `.env.local` file for both `OPENAI_API_KEY` and `NEXT_PUBLIC_OPENAI_API_KEY`

## 3. Phantom Wallet Setup

To use the Solana blockchain features:

1. Install the [Phantom Wallet](https://phantom.app/) browser extension
2. Create a new wallet or import an existing one
3. Switch to "Devnet" for testing:
   - Open Phantom wallet
   - Click the gear icon (Settings)
   - Go to "Change Network"
   - Select "Devnet"
4. Get some devnet SOL for testing:
   - Go to [Solana Faucet](https://faucet.solana.com/)
   - Enter your wallet address
   - Request devnet SOL

## 4. (Optional) Server-Side Solana Private Key Setup

For server-side NFT minting and token transfers:

1. Generate a Solana keypair:
   ```bash
   # Install Solana CLI tools if you haven't already
   sh -c "$(curl -sSfL https://release.solana.com/v1.9.4/install)"
   
   # Generate a new keypair
   solana-keygen new --no-passphrase -o server-keypair.json
   
   # View the private key bytes
   xxd -p server-keypair.json | tr -d '\n' | head -c 64
   ```

2. Fund your server keypair with devnet SOL:
   - Get the public key: `solana-keygen pubkey server-keypair.json`
   - Go to [Solana Faucet](https://faucet.solana.com/)
   - Request devnet SOL for this public key

3. Add the private key to your `.env.local` file:
   - Format: comma-separated bytes (e.g., `11,22,33,...`)
   - Keep this secure and never commit it to Git!

## 5. Running the App

After setting up the environment variables:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit http://localhost:3000 to use the app.

## Troubleshooting

### OpenAI API Issues

- If you see "Mock roast used" in the console, check that your OpenAI API key is correct
- Ensure you have billing set up on your OpenAI account

### Phantom Wallet Connection Issues

- Make sure you're on the same network (Devnet) in both Phantom and the app
- Try refreshing the page if the wallet doesn't connect
- Check browser console for errors

### Solana Transaction Errors

- Ensure your wallet has enough SOL for transactions
- For server-side transactions, make sure the server wallet is funded
- Check transaction status on [Solana Explorer](https://explorer.solana.com/?cluster=devnet)

## Production Deployment

For production:

1. Use environment variables on your hosting platform (Vercel, Netlify, etc.)
2. Switch to Mainnet network in the environment variables
3. Set up proper security for API keys and private keys
4. Consider using a more robust NFT minting approach with proper metadata 