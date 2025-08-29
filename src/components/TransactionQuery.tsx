import React, { useState } from 'react';
import { ethers } from 'ethers';
import './TransactionQuery.css';

interface TransactionQueryProps {
  onTransactionFound?: (transaction: any) => void;
}

interface BlockInfo {
  number: number;
  hash: string;
  timestamp: number;
  gasLimit: string;
  gasUsed: string;
  miner: string;
  difficulty: string;
  totalDifficulty: string;
  size: number;
  transactionCount: number;
}

interface TransactionInfo {
  hash: string;
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
  gasUsed: string;
  nonce: number;
  data: string;
  timestamp: number;
  status: number;
}

const TransactionQuery: React.FC<TransactionQueryProps> = ({ onTransactionFound }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [blockNumber, setBlockNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockInfo, setBlockInfo] = useState<BlockInfo | null>(null);
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);

  // 初始化以太坊提供者
  const initProvider = () => {
    if (!provider) {
      // 配置以太坊提供者 - 使用公共RPC端点避免限流
      const newProvider = new ethers.JsonRpcProvider('https://ethereum.publicnode.com');
      setProvider(newProvider);
      return newProvider;
    }
    return provider;
  };

  const formatValue = (value: string) => {
    const ethValue = parseFloat(ethers.formatEther(value));
    return ethValue.toFixed(6);
  };

  const formatGasPrice = (gasPrice: string) => {
    const gwei = parseFloat(ethers.formatUnits(gasPrice, 'gwei'));
    return gwei.toFixed(2);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('zh-CN');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // 可以添加一个临时的提示
  };

  const queryTransactions = async () => {
    if (!blockNumber) {
      setError('请输入区块号');
      return;
    }

    setLoading(true);
    setError(null);
    setBlockInfo(null);
    setTransactions([]);

    try {
      const ethProvider = initProvider();
      const blockNum = parseInt(blockNumber);
      
      // 获取区块信息
      const block = await ethProvider.getBlock(blockNum, true);
      
      if (!block) {
        throw new Error('区块不存在');
      }

      // 设置区块信息
      const blockData: BlockInfo = {
        number: block.number,
        hash: block.hash || '',
        timestamp: block.timestamp,
        gasLimit: block.gasLimit.toString(),
        gasUsed: block.gasUsed.toString(),
        miner: block.miner,
        difficulty: block.difficulty.toString(),
        totalDifficulty: '0', // block.totalDifficulty?.toString() || '0',
        size: block.length || 0,
        transactionCount: block.transactions.length
      };
      setBlockInfo(blockData);

      // 获取交易详情
      const txPromises = block.transactions.map(async (txHash) => {
        const tx = await ethProvider.getTransaction(txHash);
        const receipt = await ethProvider.getTransactionReceipt(txHash);
        
        if (tx) {
          return {
            hash: tx.hash,
            blockNumber: tx.blockNumber || 0,
            blockHash: tx.blockHash || '',
            transactionIndex: tx.index || 0,
            from: tx.from,
            to: tx.to || '',
            value: tx.value.toString(),
            gasPrice: tx.gasPrice?.toString() || '0',
            gasLimit: tx.gasLimit.toString(),
            gasUsed: receipt?.gasUsed.toString() || '0',
            nonce: tx.nonce,
            data: tx.data,
            timestamp: block.timestamp,
            status: receipt?.status || 0
          } as TransactionInfo;
        }
        return null;
      });

      const txResults = await Promise.all(txPromises);
      const validTxs = txResults.filter((tx): tx is TransactionInfo => tx !== null);
      
      // 如果指定了钱包地址，则过滤交易
      let filteredTxs = validTxs;
      if (walletAddress.trim()) {
        const address = walletAddress.toLowerCase();
        filteredTxs = validTxs.filter(tx => 
          tx.from.toLowerCase() === address || 
          tx.to.toLowerCase() === address
        );
      }
      
      setTransactions(filteredTxs);
      
      if (onTransactionFound && filteredTxs.length > 0) {
        onTransactionFound(filteredTxs);
      }
      
    } catch (err: any) {
      console.error('查询交易失败:', err);
      setError(err.message || '查询失败，请检查网络连接或稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    queryTransactions();
  };

  return (
    <div className="transaction-query">
      <div className="query-form">
        <h2>以太坊交易查询</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="walletAddress">钱包地址 (可选)</label>
            <input
              type="text"
              id="walletAddress"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="输入钱包地址以过滤交易 (可选)"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="blockNumber">区块号 *</label>
            <input
              type="number"
              id="blockNumber"
              value={blockNumber}
              onChange={(e) => setBlockNumber(e.target.value)}
              placeholder="输入区块号"
              className="form-input"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="query-btn"
            disabled={loading}
          >
            {loading ? '查询中...' : '查询交易'}
          </button>
        </form>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      {blockInfo && (
        <div className="block-info">
          <h3>区块信息</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">区块号:</span>
              <span className="value">#{blockInfo.number}</span>
            </div>
            <div className="info-item">
              <span className="label">区块哈希:</span>
              <span 
                className="value hash-link"
                onClick={() => copyToClipboard(blockInfo.hash)}
                title="点击复制"
              >
                {formatAddress(blockInfo.hash)}
              </span>
            </div>
            <div className="info-item">
              <span className="label">时间戳:</span>
              <span className="value">{formatTimestamp(blockInfo.timestamp)}</span>
            </div>
            <div className="info-item">
              <span className="label">矿工:</span>
              <span 
                className="value hash-link"
                onClick={() => copyToClipboard(blockInfo.miner)}
                title="点击复制"
              >
                {formatAddress(blockInfo.miner)}
              </span>
            </div>
            <div className="info-item">
              <span className="label">交易数量:</span>
              <span className="value">{blockInfo.transactionCount}</span>
            </div>
            <div className="info-item">
              <span className="label">Gas使用:</span>
              <span className="value">
                {parseInt(blockInfo.gasUsed).toLocaleString()} / {parseInt(blockInfo.gasLimit).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="transactions-result">
          <h3>
            {walletAddress ? `相关交易 (${transactions.length})` : `区块交易 (${transactions.length})`}
          </h3>
          <div className="transaction-table">
            <div className="table-header">
              <div className="col-hash">交易哈希</div>
              <div className="col-from">发送方</div>
              <div className="col-to">接收方</div>
              <div className="col-value">金额 (ETH)</div>
              <div className="col-gas">Gas费用</div>
              <div className="col-status">状态</div>
            </div>
            
            {transactions.map((tx) => (
              <div key={tx.hash} className="table-row">
                <div className="col-hash">
                  <span 
                    className="hash-link" 
                    onClick={() => copyToClipboard(tx.hash)}
                    title="点击复制完整哈希"
                  >
                    {formatAddress(tx.hash)}
                  </span>
                </div>
                <div className="col-from">
                  <span 
                    className="address-link"
                    onClick={() => copyToClipboard(tx.from)}
                    title="点击复制地址"
                  >
                    {formatAddress(tx.from)}
                  </span>
                </div>
                <div className="col-to">
                  <span 
                    className="address-link"
                    onClick={() => copyToClipboard(tx.to)}
                    title="点击复制地址"
                  >
                    {tx.to ? formatAddress(tx.to) : '合约创建'}
                  </span>
                </div>
                <div className="col-value">
                  <span className="eth-value">
                    {formatValue(tx.value)}
                  </span>
                </div>
                <div className="col-gas">
                  <div className="gas-info">
                    <div className="gas-price">{formatGasPrice(tx.gasPrice)} Gwei</div>
                    <div className="gas-used">{parseInt(tx.gasUsed || '0').toLocaleString()}</div>
                  </div>
                </div>
                <div className="col-status">
                  <span className={`status ${tx.status === 1 ? 'success' : 'failed'}`}>
                    {tx.status === 1 ? '成功' : '失败'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {blockInfo && transactions.length === 0 && !loading && (
        <div className="empty-state">
          <p>{walletAddress ? '该钱包地址在此区块中没有相关交易' : '该区块中没有交易'}</p>
        </div>
      )}
    </div>
  );
};

export default TransactionQuery;