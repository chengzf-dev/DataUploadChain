import { InjectedConnector } from '@web3-react/injected-connector';
import { NetworkConnector } from '@web3-react/network-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { SUPPORTED_NETWORKS } from './networks';

// 获取支持的链ID列表
const supportedChainIds = Object.keys(SUPPORTED_NETWORKS).map(id => parseInt(id));

// MetaMask 连接器
export const injected = new InjectedConnector({
  supportedChainIds
});

// 网络连接器
export const network = new NetworkConnector({
  urls: Object.fromEntries(
    Object.entries(SUPPORTED_NETWORKS).map(([chainId, config]) => [
      parseInt(chainId),
      config.rpcUrl
    ])
  ),
  defaultChainId: 11155111 // Sepolia
});

// WalletConnect 连接器
export const walletconnect = new WalletConnectConnector({
  rpc: Object.fromEntries(
    Object.entries(SUPPORTED_NETWORKS).map(([chainId, config]) => [
      parseInt(chainId),
      config.rpcUrl
    ])
  ),
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: 12000
});

// 连接器映射
export const connectorsByName = {
  Injected: injected,
  Network: network,
  WalletConnect: walletconnect
};

// 获取连接器名称
export const getConnectorName = (connector) => {
  return Object.keys(connectorsByName).find(
    name => connectorsByName[name] === connector
  );
};