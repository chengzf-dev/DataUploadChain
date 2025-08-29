import React from 'react';
import { useTransactions, useAccountTransactions, usePagination } from '../hooks/useGraphQL';
import { Transaction } from '../types';
import './TransactionList.css';

interface TransactionListProps {
  filterAccount?: string | null;
}

const TransactionList: React.FC<TransactionListProps> = ({ filterAccount }) => {
  const { currentPage, pageSize, pagination, nextPage, prevPage, goToPage } = usePagination(20);
  
  // 始终调用两个Hooks以遵循React Hooks规则
  const allTransactionsQuery = useTransactions({ first: pageSize, skip: (currentPage - 1) * pageSize });
  const accountTransactionsQuery = useAccountTransactions(
    filterAccount || '',
    { first: pageSize, skip: (currentPage - 1) * pageSize }
  );
  
  // 根据是否有筛选账户选择使用哪个查询结果
  const { transactions, loading, error, refetch } = filterAccount 
    ? accountTransactionsQuery 
    : allTransactionsQuery;

  const formatValue = (value: string) => {
    const ethValue = parseFloat(value) / Math.pow(10, 18);
    return ethValue.toFixed(6);
  };

  const formatGasPrice = (gasPrice: string) => {
    const gwei = parseFloat(gasPrice) / Math.pow(10, 9);
    return gwei.toFixed(2);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString('zh-CN');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="transaction-list">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>加载交易数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transaction-list">
        <div className="error-container">
          <p>❌ 加载失败: {error.message}</p>
          <button onClick={() => refetch()} className="retry-btn">
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      <div className="list-header">
        <h2>
          {filterAccount ? `账户交易记录` : '最新交易'}
          {filterAccount && (
            <span className="account-filter">
              ({formatAddress(filterAccount)})
            </span>
          )}
        </h2>
        <div className="list-controls">
          <button onClick={() => refetch()} className="refresh-btn" disabled={loading}>
            {loading ? '🔄' : '↻'} 刷新
          </button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-state">
          <p>暂无交易数据</p>
        </div>
      ) : (
        <>
          <div className="transaction-table">
            <div className="table-header">
              <div className="col-hash">交易哈希</div>
              <div className="col-block">区块</div>
              <div className="col-from">发送方</div>
              <div className="col-to">接收方</div>
              <div className="col-value">金额 (ETH)</div>
              <div className="col-gas">Gas费用</div>
              <div className="col-time">时间</div>
            </div>
            
            {transactions.map((tx: Transaction) => (
              <div key={tx.id} className="table-row">
                <div className="col-hash">
                  <span 
                    className="hash-link" 
                    onClick={() => copyToClipboard(tx.hash)}
                    title="点击复制完整哈希"
                  >
                    {formatAddress(tx.hash)}
                  </span>
                </div>
                <div className="col-block">
                  <span className="block-number">
                    #{tx.block.number}
                  </span>
                </div>
                <div className="col-from">
                  <span 
                    className="address-link"
                    onClick={() => copyToClipboard(tx.from.id)}
                    title="点击复制地址"
                  >
                    {formatAddress(tx.from.id)}
                  </span>
                </div>
                <div className="col-to">
                  <span 
                    className="address-link"
                    onClick={() => copyToClipboard(tx.to.id)}
                    title="点击复制地址"
                  >
                    {formatAddress(tx.to.id)}
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
                    <div className="gas-used">{parseInt(tx.gasUsed).toLocaleString()}</div>
                  </div>
                </div>
                <div className="col-time">
                  <span className="timestamp">
                    {formatTimestamp(tx.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button 
              onClick={prevPage} 
              disabled={currentPage === 1}
              className="page-btn"
            >
              上一页
            </button>
            <span className="page-info">
                第 {currentPage} 页
              </span>
              <button 
                onClick={nextPage} 
                disabled={transactions.length < pageSize}
                className="page-btn"
            >
              下一页
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TransactionList;