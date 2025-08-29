// 网络配置文件
export const SUPPORTED_NETWORKS = {
  1: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/2bef1fe43e6948e8b10d67f6d040d4c9',
    blockExplorerUrl: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  11155111: {
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/2bef1fe43e6948e8b10d67f6d040d4c9',
    blockExplorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'SEP',
      decimals: 18
    }
  },
  5: {
    name: 'Goerli Testnet',
    chainId: 5,
    rpcUrl: 'https://goerli.infura.io/v3/YOUR_INFURA_PROJECT_ID',
    blockExplorerUrl: 'https://goerli.etherscan.io',
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'GOR',
      decimals: 18
    }
  },
  137: {
    name: 'Polygon Mainnet',
    chainId: 137,
    rpcUrl: 'https://polygon-mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID',
    blockExplorerUrl: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  80001: {
    name: 'Polygon Mumbai',
    chainId: 80001,
    rpcUrl: 'https://polygon-mumbai.infura.io/v3/YOUR_INFURA_PROJECT_ID',
    blockExplorerUrl: 'https://mumbai.polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  }
};

// 默认网络
export const DEFAULT_CHAIN_ID = 11155111; // Sepolia

// 获取网络信息
export const getNetworkInfo = (chainId) => {
  return SUPPORTED_NETWORKS[chainId] || null;
};

// 获取所有支持的网络列表
export const getSupportedNetworks = () => {
  return Object.values(SUPPORTED_NETWORKS);
};

// 检查是否为支持的网络
export const isSupportedNetwork = (chainId) => {
  return chainId in SUPPORTED_NETWORKS;
};