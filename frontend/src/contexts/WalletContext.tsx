"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
  account: string;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string>('');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask or another Web3 wallet');
      return;
    }

    setIsConnecting(true);
    try {
      // Clear any existing state first
      setAccount('');
      setProvider(null);
      setSigner(null);

      // Add a small delay to ensure ethereum is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        setAccount(account);

        try {
          // Create provider and signer with retry logic
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();

          setProvider(provider);
          setSigner(signer);

          // Set up event listeners only once
          if (!window.ethereum._listenersAdded) {
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
              if (accounts && accounts.length > 0) {
                setAccount(accounts[0]);
                // Refresh provider and signer
                const newProvider = new ethers.BrowserProvider(window.ethereum);
                newProvider.getSigner().then(newSigner => {
                  setProvider(newProvider);
                  setSigner(newSigner);
                }).catch(err => console.warn('Failed to refresh signer:', err));
              } else {
                setAccount('');
                setProvider(null);
                setSigner(null);
              }
            });

            window.ethereum.on('chainChanged', () => {
              // Instead of reloading, just refresh the connection
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            });

            window.ethereum._listenersAdded = true;
          }
        } catch (providerError) {
          console.warn('Provider initialization failed:', providerError);
          // Still set the account even if provider fails
        }
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      
      // Handle specific error cases
      if (error.code === 4001) {
        alert('Connection rejected by user');
      } else if (error.code === -32002) {
        alert('Connection request already pending');
      } else {
        alert('Failed to connect wallet. Please try again.');
      }
      
      // Clear any partial state
      setAccount('');
      setProvider(null);
      setSigner(null);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount('');
    setProvider(null);
    setSigner(null);
  };

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          // Add a small delay to ensure ethereum is fully loaded
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });
          
          if (accounts && accounts.length > 0) {
            const account = accounts[0];
            setAccount(account);
            
            try {
              const provider = new ethers.BrowserProvider(window.ethereum);
              const signer = await provider.getSigner();
              setProvider(provider);
              setSigner(signer);
            } catch (providerError) {
              console.warn('Provider initialization failed:', providerError);
              // Still set the account even if provider fails
            }
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
          // Clear any stale state
          setAccount('');
          setProvider(null);
          setSigner(null);
        }
      }
    };

    // Add a delay to ensure the page is fully loaded
    const timer = setTimeout(checkConnection, 500);
    return () => clearTimeout(timer);
  }, []);

  const value: WalletContextType = {
    account,
    provider,
    signer,
    connect,
    disconnect,
    isConnecting,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Add ethereum to window type
declare global {
  interface Window {
    ethereum?: any;
  }
}
