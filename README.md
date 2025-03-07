# Presidential Roast

A fun application that lets users roast presidents and earn tokens through blockchain integration.

## Local Development

To run this project locally:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000` (or another port if 3000 is in use).

## Deployment to Netlify

### Option 1: Deploy with the Netlify CLI

1. Install the Netlify CLI globally:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to your Netlify account:
   ```bash
   netlify login
   ```

3. Build and deploy:
   ```bash
   npm run build
   netlify deploy --prod
   ```

### Option 2: Deploy via Netlify Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Log in to [Netlify](https://app.netlify.com/)

3. Click "New site from Git"

4. Select your repository and configure the deployment settings:
   - Build command: `npm run build`
   - Publish directory: `.next`

5. Click "Deploy site"

### Environment Variables

Configure these environment variables in the Netlify dashboard:

- `NEXT_PUBLIC_SOLANA_RPC_URL`: Solana RPC URL (for Solana wallet integration)
- `NEXT_PUBLIC_SOLANA_NETWORK`: Solana network (e.g., mainnet, devnet)
- `NEXT_PUBLIC_ROAST_PROGRAM_ID`: Your Solana program ID
- `NEXT_PUBLIC_TOKEN_MINT_ADDRESS`: Token mint address
- `NEXT_PUBLIC_TREASURY_ADDRESS`: Treasury address
- `NEXT_PUBLIC_FANTOM_RPC_URL`: Fantom RPC URL (for Fantom integration)
- `NEXT_PUBLIC_FANTOM_CHAIN_ID`: Fantom chain ID (4002 for testnet, 250 for mainnet)
- `OPENAI_API_KEY`: Your OpenAI API key

## Features

- AI-powered presidential roasting system
- Blockchain integration for token rewards
- Wallet connection for Solana and Fantom
- Interactive UI with real-time responses

## Technology Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **AI**: OpenAI API for generating roasts
- **Blockchain**: Solana Web3.js for wallet connections and token transactions
- **API Routes**: Next.js API routes for backend functionality

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Phantom Wallet (for Solana blockchain interaction)
- OpenAI API key (for AI-generated roasts)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/presidential-roast.git
   cd presidential-roast
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up your `.env.local` file with your API keys:
   ```
   # OpenAI API Key (Required for AI roasts)
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Solana Configuration (Required for NFT minting)
   SOLANA_RPC_URL=https://api.devnet.solana.com
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   
   # Only needed for server-side NFT minting
   SOLANA_PRIVATE_KEY=your_private_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Setting Up API Keys

### OpenAI API Key
1. Create an account at [OpenAI](https://openai.com)
2. Go to your API settings and create a new API key
3. Copy the key and add it to your `.env.local` file:
   ```
   OPENAI_API_KEY=your_key_here
   ```

### Solana Wallet Setup
1. Install the [Phantom Wallet](https://phantom.app/) browser extension
2. Create a new wallet or import an existing one
3. Make sure you're connected to Devnet (for testing) or Mainnet (for production)
4. The app will automatically detect your Phantom wallet and allow you to connect

### Twitter Integration (Optional)
The Twitter integration is currently mocked in the app. For real Twitter integration, you would need to:
1. Apply for a Twitter Developer account
2. Create a new Twitter App
3. Add your Twitter API keys to the `.env.local` file

## Usage

1. Select your roast type (idea, resume, or Twitter)
2. Input your content or upload a file
3. Click "ROAST ME BIGLY!" and wait for the AI to generate a Trump-style roast
4. Connect your Solana wallet to claim ROAST tokens
5. Optionally mint your roast as an NFT
6. Share your roast on social media

## Solana Blockchain Features

The application interacts with the Solana blockchain in several ways:

1. **Wallet Connection**: Connect your Phantom wallet to verify ownership
2. **NFT Minting**: Turn your favorite roasts into unique NFTs stored on Solana
3. **Token Rewards**: Receive ROAST tokens when you mint an NFT
4. **Blockchain Verification**: View your NFT transactions on Solana Explorer

Note: The Solana integration uses Devnet by default, which is perfect for testing without real SOL tokens. When you're ready to use real SOL, change the network to Mainnet in your `.env.local` file.

## Development Notes

### Blockchain Integration

For development without a Solana wallet:
1. The app will run with mock data if no wallet is connected
2. Use the "Connect Wallet" button to simulate the connection
3. Mock NFT minting will still work without a real wallet

For production:
1. Deploy with real API keys using environment variables
2. Create your custom Solana token for rewards
3. Implement proper error handling for network issues
4. Consider adding additional security measures

### AI Integration

The OpenAI integration can be customized:
1. Edit the prompts in `src/app/api/roast/route.ts` to change the style of roasts
2. Adjust the temperature parameter to control creativity vs. predictability
3. Set token limits to manage cost and response length

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This application is a parody and not affiliated with any political figure or government entity. The content generated is for entertainment purposes only.
