import React, { useState, useEffect } from 'react';
import { Select, Button, Space, Typography, message } from 'antd';
import { WifiOutlined, DisconnectOutlined } from '@ant-design/icons';
import { SUPPORTED_NETWORKS, getNetworkInfo, getSupportedNetworks } from '../config/networks';
import './NetworkSwitcher.css';

const { Option } = Select;
const { Text } = Typography;

const NetworkSwitcher = () => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(chainId);
  const [connecting, setConnecting] = useState(false);

  // 检查钱包连接状态
  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setChainId(parseInt(chainId, 16));
          setIsConnected(true);
        }
      } catch (error) {
        console.error('检查连接状态失败:', error);
      }
    }
  };

  // 监听账户和网络变化
  useEffect(() => {
    checkConnection();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          setAccount(null);
          setIsConnected(false);
        }
      });
      
      window.ethereum.on('chainChanged', (chainId) => {
        setChainId(parseInt(chainId, 16));
      });
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // 当链ID变化时更新选中的网络
  useEffect(() => {
    if (chainId) {
      setSelectedNetwork(chainId);
    }
  }, [chainId]);

  // 连接钱包
  const connectWallet = async () => {
    if (!window.ethereum) {
      message.error('请安装 MetaMask!');
      return;
    }
    
    setConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(parseInt(chainId, 16));
        
        message.success('钱包连接成功!');
      }
    } catch (err) {
      console.error('连接钱包失败:', err);
      message.error('连接钱包失败: ' + (err.message || '未知错误'));
    } finally {
      setConnecting(false);
    }
  };

  // 断开钱包连接
  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setChainId(null);
    message.success('钱包已断开连接');
  };

  // 切换网络
  const switchNetwork = async (targetChainId) => {
    if (!isConnected || !window.ethereum) {
      message.warning('请先连接钱包');
      return;
    }

    const networkInfo = getNetworkInfo(targetChainId);
    if (!networkInfo) {
      message.error('不支持的网络');
      return;
    }

    try {
      // 尝试切换到目标网络
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      message.success(`已切换到 ${networkInfo.name}`);
    } catch (switchError) {
      // 如果网络不存在，尝试添加网络
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${targetChainId.toString(16)}`,
                chainName: networkInfo.name,
                rpcUrls: [networkInfo.rpcUrl],
                blockExplorerUrls: [networkInfo.blockExplorerUrl],
                nativeCurrency: networkInfo.nativeCurrency,
              },
            ],
          });
          message.success(`已添加并切换到 ${networkInfo.name}`);
        } catch (addError) {
          console.error('添加网络失败:', addError);
          message.error('添加网络失败: ' + (addError.message || '未知错误'));
        }
      } else {
        console.error('切换网络失败:', switchError);
        message.error('切换网络失败: ' + (switchError.message || '未知错误'));
      }
    }
  };

  // 处理网络选择变化
  const handleNetworkChange = (value) => {
    setSelectedNetwork(value);
    switchNetwork(value);
  };

  // 格式化账户地址
  const formatAccount = (account) => {
    if (!account) return '';
    return `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
  };

  // 获取当前网络信息
  const currentNetwork = chainId ? getNetworkInfo(chainId) : null;
  const supportedNetworks = getSupportedNetworks();

  return (
    <div className="network-switcher">
      <Space size="middle">
        {/* 连接状态显示 */}
        <div className="connection-status">
          {isConnected ? (
            <Space size="small">
              <WifiOutlined style={{ color: '#52c41a' }} />
              <Text strong style={{ color: '#52c41a' }}>已连接</Text>
              {account && (
                <Text code className="account-address">
                  {formatAccount(account)}
                </Text>
              )}
            </Space>
          ) : (
            <Space size="small">
              <DisconnectOutlined style={{ color: '#ff4d4f' }} />
              <Text style={{ color: '#ff4d4f' }}>未连接</Text>
            </Space>
          )}
        </div>

        {/* 网络选择器 */}
        <div className="network-selector">
          <Space size="small">
            <Text strong>网络:</Text>
            <Select
              value={selectedNetwork}
              onChange={handleNetworkChange}
              style={{ width: 180 }}
              placeholder="选择网络"
              disabled={!isConnected}
          >
            {supportedNetworks.map((network) => (
              <Option key={network.chainId} value={network.chainId}>
                <Space>
                  <span>{network.name}</span>
                  {chainId === network.chainId && (
                    <WifiOutlined style={{ color: '#52c41a' }} />
                  )}
                </Space>
              </Option>
            ))}
          </Select>
          </Space>
        </div>

        {/* 连接/断开按钮 */}
        <div className="connection-buttons">
          {!isConnected ? (
            <Button
              type="primary"
              onClick={connectWallet}
              loading={connecting}
              icon={<WifiOutlined />}
              size="small"
            >
              连接钱包
            </Button>
          ) : (
            <Button
              danger
              onClick={disconnectWallet}
              icon={<DisconnectOutlined />}
              size="small"
            >
              断开
            </Button>
          )}
        </div>


      </Space>
      
      {/* 当前网络信息 */}
      {currentNetwork && (
        <div className="current-network">
          <Text type="secondary">
            当前网络: {currentNetwork.name} (Chain ID: {chainId})
          </Text>
        </div>
      )}
    </div>
  );
};

export default NetworkSwitcher;