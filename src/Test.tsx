import React, { useState } from 'react';
import { ApolloProvider } from '@apollo/client';
import { App as AntdApp } from 'antd';
import { client } from './apollo-client';
import { useWallet } from './hooks/useWallet';

import TransactionList from './components/TransactionList';
import BlockList from './components/BlockList';
import TransactionQuery from './components/TransactionQuery';
import WalletConnect from './components/WalletConnect';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'blocks' | 'query'>('transactions');
  const { isConnected, account } = useWallet();

  return (
    <ApolloProvider client={client}>
      <AntdApp>
        <div className="App">
          <header className="App-header">
            <h1>以太坊交易浏览器</h1>
            <p>基于 The Graph 的去中心化数据查询</p>
            <WalletConnect />
          </header>
          
          <main className="App-main">
            <nav className="tab-nav">
              <button 
                className={activeTab === 'transactions' ? 'active' : ''}
                onClick={() => setActiveTab('transactions')}
              >
                数据
              </button>
              <button 
                className={activeTab === 'blocks' ? 'active' : ''}
                onClick={() => setActiveTab('blocks')}
              >
                区块列表
              </button>
              <button 
                className={activeTab === 'query' ? 'active' : ''}
                onClick={() => setActiveTab('query')}
              >
                交易查询
              </button>
            </nav>
            
            <div className="tab-content">
              {activeTab === 'transactions' && (
                <TransactionList 
                  filterAccount={isConnected ? account : null} 
                />
              )}
              {activeTab === 'blocks' && <BlockList />}
              {activeTab === 'query' && <TransactionQuery />}
            </div>
          </main>
        </div>
      </AntdApp>
    </ApolloProvider>
   );
}

export default App;
