"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { NETWORK_CONFIG } from "@/lib/contracts";

export default function WalletConnect() {
  const { account, connect, disconnect, isConnecting } = useWallet();
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  useEffect(() => {
    if (account && window.ethereum) {
      window.ethereum.request({ method: "eth_chainId" }).then((chainId: string) => {
        setIsWrongNetwork(chainId !== NETWORK_CONFIG.chainId);
      });
    }
  }, [account]);

  const switchNetwork = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: NETWORK_CONFIG.chainId }],
        });
        setIsWrongNetwork(false);
      } catch (error) {
        console.error("Failed to switch network:", error);
      }
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (account && !isWrongNetwork) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-black font-medium">
          <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
          {formatAddress(account)}
        </div>
        <button
          onClick={disconnect}
          className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Disconnect
        </button>
      </div>
    );
  }

  if (isWrongNetwork) {
    return (
      <button
        onClick={switchNetwork}
        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
      >
        Switch to Sepolia
      </button>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 text-black font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
    >
      {isConnecting ? (
        <>
          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          Connecting...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          Connect Wallet
        </>
      )}
    </button>
  );
}
