import React from 'react';
import { useWallet } from '../hooks/useWallet';
import './WalletConnect.css';

const WalletConnect: React.FC = () => {
  const {
    isConnected,
    account,
    chainId,
    isLoading,
    error,
    isMetaMaskInstalled,
    connectWallet,
    disconnectWallet,
    switchToMainnet,
  } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1:
        return '以太坊主网';
      case 3:
        return 'Ropsten 测试网';
      case 4:
        return 'Rinkeby 测试网';
      case 5:
        return 'Goerli 测试网';
      case 11155111:
        return 'Sepolia 测试网';
      default:
        return `未知网络 (${chainId})`;
    }
  };

  if (!isMetaMaskInstalled) {
    return (
      <div className="wallet-connect">
        <div className="wallet-status error">
          <span>❌ 未检测到 MetaMask</span>
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="install-link"
          >
            安装 MetaMask
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="wallet-connect">
        <div className="wallet-status loading">
          <span>🔄 连接中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wallet-connect">
        <div className="wallet-status error">
          <span>❌ {error}</span>
          <button onClick={connectWallet} className="connect-btn">
            重试连接
          </button>
        </div>
      </div>
    );
  }

  if (isConnected && account) {
    return (
      <div className="wallet-connect">
        <div className="wallet-status connected">
          <div className="wallet-info">
            <span className="status-indicator">🟢</span>
            <div className="account-info">
              <div className="account-address">{formatAddress(account)}</div>
              {chainId && (
                <div className="network-info">
                  {getNetworkName(chainId)}
                  {chainId !== 1 && (
                    <button 
                      onClick={switchToMainnet} 
                      className="switch-network-btn"
                      title="切换到以太坊主网"
                    >
                      切换主网
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <button onClick={disconnectWallet} className="disconnect-btn">
            断开连接
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      <div className="wallet-status disconnected">
        <span>🔴 钱包未连接</span>
        <button onClick={connectWallet} className="connect-btn">
          连接 MetaMask
        </button>
      </div>
    </div>
  );
};

export default WalletConnect;