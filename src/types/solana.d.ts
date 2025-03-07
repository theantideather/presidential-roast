// Type definitions for Solana/Phantom wallet integration
// Based on https://docs.phantom.com/

interface PhantomProvider {
  isPhantom: boolean;
  publicKey: { toString(): string } | null;
  isConnected: boolean;
  signMessage(message: Uint8Array, encoding: string): Promise<{ signature: Uint8Array }>;
  signTransaction(transaction: any): Promise<any>;
  signAllTransactions(transactions: any[]): Promise<any[]>;
  connect(options?: { onlyIfTrusted?: boolean }): Promise<{
    publicKey: {
      toString(): string;
    };
  }>;
  disconnect(): Promise<void>;
  on(event: string, callback: (args: any) => void): void;
  request(method: any, params: any): Promise<any>;
}

interface Window {
  solana?: PhantomProvider;
  phantom?: {
    solana?: PhantomProvider;
  };
} 