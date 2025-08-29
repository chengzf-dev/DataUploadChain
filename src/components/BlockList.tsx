import React from 'react';
import { useBlocks, usePagination } from '../hooks/useGraphQL';
import { Block } from '../types';
import './BlockList.css';

const BlockList: React.FC = () => {
  const { currentPage, pageSize, pagination, nextPage, prevPage } = usePagination(15);
  const { blocks, loading, error, refetch } = useBlocks(pagination);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString('zh-CN');
  };

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const formatGasUsed = (gasUsed: string, gasLimit: string) => {
    const used = parseInt(gasUsed);
    const limit = parseInt(gasLimit);
    const percentage = ((used / limit) * 100).toFixed(1);
    return {
      used: used.toLocaleString(),
      limit: limit.toLocaleString(),
      percentage
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const blockTime = parseInt(timestamp) * 1000;
    const diffSeconds = Math.floor((now - blockTime) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}秒前`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}分钟前`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}小时前`;
    return `${Math.floor(diffSeconds / 86400)}天前`;
  };

  if (loading && blocks.length === 0) {
    return (
      <div className="block-list">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>加载区块数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="block-list">
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
    <div className="block-list">
      <div className="list-header">
        <h2>最新区块</h2>
        <div className="list-controls">
          <button onClick={() => refetch()} className="refresh-btn" disabled={loading}>
            {loading ? '🔄' : '↻'} 刷新
          </button>
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="empty-state">
          <p>暂无区块数据</p>
        </div>
      ) : (
        <>
          <div className="block-grid">
            {blocks.map((block: Block) => {
              const gasInfo = formatGasUsed(block.gasUsed, block.gasLimit);
              return (
                <div key={block.id} className="block-card">
                  <div className="block-header">
                    <div className="block-number">
                      <span className="label">区块</span>
                      <span className="value">#{block.number}</span>
                    </div>
                    <div className="block-time">
                      <span className="time-ago">{getTimeAgo(block.timestamp)}</span>
                      <span className="timestamp">{formatTimestamp(block.timestamp)}</span>
                    </div>
                  </div>
                  
                  <div className="block-content">
                    <div className="block-info-row">
                      <div className="info-item">
                        <span className="label">区块哈希</span>
                        <span 
                          className="value hash-value"
                          onClick={() => copyToClipboard(block.hash)}
                          title="点击复制完整哈希"
                        >
                          {formatHash(block.hash)}
                        </span>
                      </div>
                    </div>
                    

                    
                    <div className="block-stats">
                      <div className="stat-item">
                        <span className="stat-label">交易数量</span>
                        <span className="stat-value transaction-count">
                          {block.transactionCount}
                        </span>
                      </div>
                      
                      <div className="stat-item">
                        <span className="stat-label">Gas 使用率</span>
                        <div className="gas-usage">
                          <div className="gas-bar">
                            <div 
                              className="gas-fill" 
                              style={{ width: `${gasInfo.percentage}%` }}
                            ></div>
                          </div>
                          <span className="gas-text">
                            {gasInfo.percentage}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="stat-item gas-details">
                        <span className="stat-label">Gas 详情</span>
                        <div className="gas-info">
                          <span className="gas-used">{gasInfo.used}</span>
                          <span className="gas-separator">/</span>
                          <span className="gas-limit">{gasInfo.limit}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
              disabled={blocks.length < pageSize}
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

export default BlockList;