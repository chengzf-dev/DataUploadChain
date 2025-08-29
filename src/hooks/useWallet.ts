import { useState, useEffect, useCallback } from 'react';
import { WalletState } from '../types';

// 声明window.ethereum类型
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (data: any) => void) => void;
      removeListener: (event: string, callback: (data: any) => void) => void;
    };
  }
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    account: null,
    chainId: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 检查MetaMask是否已安装
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window !== 'undefined' && Boolean(window.ethereum?.isMetaMask);
  }, []);

  // 连接钱包
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setError('请安装MetaMask钱包');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 请求账户访问权限
      const accounts = await window.ethereum!.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        // 获取链ID
        const chainId = await window.ethereum!.request({
          method: 'eth_chainId',
        });

        setWalletState({
          isConnected: true,
          account: accounts[0],
          chainId: parseInt(chainId, 16),
        });
      }
    } catch (err: any) {
      console.error('连接钱包失败:', err);
      setError(err.message || '连接钱包失败');
    } finally {
      setIsLoading(false);
    }
  }, [isMetaMaskInstalled]);

  // 断开钱包连接
  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      account: null,
      chainId: null,
    });
    setError(null);
  }, []);

  // 切换到以太坊主网
  const switchToMainnet = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }], // 以太坊主网
      });
    } catch (err: any) {
      console.error('切换网络失败:', err);
      setError('切换网络失败');
    }
  }, []);

  // 监听账户变化
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // 用户断开了所有账户
        disconnectWallet();
      } else {
        // 用户切换了账户
        setWalletState(prev => ({
          ...prev,
          account: accounts[0],
        }));
      }
    };

    const handleChainChanged = (chainId: string) => {
      setWalletState(prev => ({
        ...prev,
        chainId: parseInt(chainId, 16),
      }));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnectWallet]);

  // 检查是否已连接
  useEffect(() => {
    const checkConnection = async () => {
      if (!isMetaMaskInstalled()) return;

      try {
        const accounts = await window.ethereum!.request({
          method: 'eth_accounts',
        });

        if (accounts.length > 0) {
          const chainId = await window.ethereum!.request({
            method: 'eth_chainId',
          });

          setWalletState({
            isConnected: true,
            account: accounts[0],
            chainId: parseInt(chainId, 16),
          });
        }
      } catch (err) {
        console.error('检查钱包连接状态失败:', err);
      }
    };

    checkConnection();
  }, [isMetaMaskInstalled]);

  return {
    ...walletState,
    isLoading,
    error,
    isMetaMaskInstalled: isMetaMaskInstalled(),
    connectWallet,
    disconnectWallet,
    switchToMainnet,
  };
};