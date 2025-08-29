const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const cors = require('cors');

// GraphQL Schema
const typeDefs = buildSchema(`
  enum Block_orderBy {
    id
    number
    timestamp
    hash
    gasUsed
    gasLimit
    transactionCount
  }

  enum Transaction_orderBy {
    id
    hash
    value
    gasPrice
    gasUsed
    timestamp
  }

  enum OrderDirection {
    asc
    desc
  }

  type Block {
    id: ID!
    number: String!
    timestamp: String!
    hash: String!
    gasUsed: String!
    gasLimit: String!
    transactionCount: Int!
  }

  type Account {
    id: ID!
    transactionCount: String!
    totalValueSent: String!
    totalValueReceived: String!
  }

  type Transaction {
    id: ID!
    hash: String!
    from: Account!
    to: Account!
    value: String!
    gasPrice: String!
    gasUsed: String!
    timestamp: String!
    block: Block!
  }

  type Query {
    blocks(first: Int!, skip: Int!, orderBy: Block_orderBy, orderDirection: OrderDirection): [Block!]!
    transactions(first: Int!, skip: Int!, account: String, orderBy: Transaction_orderBy, orderDirection: OrderDirection): [Transaction!]!
    account(id: String!): Account
  }
`);

// 模拟数据
const mockBlocks = [
  {
    id: '23169030',
    number: '23169030',
    timestamp: '1734567890',
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    gasUsed: '15000000',
    gasLimit: '30000000',
    transactionCount: 3
  }
];

const mockAccounts = {
  '0xa0b86a33e6842ca7f50e75e1056a5a725df85b2b': {
    id: '0xa0b86a33e6842ca7f50e75e1056a5a725df85b2b',
    transactionCount: '1',
    totalValueSent: '1000000000000000000',
    totalValueReceived: '0'
  },
  '0x742d35cc6634c0532925a3b8d4c0b4c8b4e4c8b4': {
    id: '0x742d35cc6634c0532925a3b8d4c0b4c8b4e4c8b4',
    transactionCount: '1',
    totalValueSent: '0',
    totalValueReceived: '1000000000000000000'
  },
  '0x8ba1f109551bd432803012645hac136c4c5c8b4': {
    id: '0x8ba1f109551bd432803012645hac136c4c5c8b4',
    transactionCount: '2',
    totalValueSent: '2000000000000000000',
    totalValueReceived: '500000000000000000'
  }
};

const mockTransactions = [
  {
    id: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
    hash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
    from: mockAccounts['0xa0b86a33e6842ca7f50e75e1056a5a725df85b2b'],
    to: mockAccounts['0x742d35cc6634c0532925a3b8d4c0b4c8b4e4c8b4'],
    value: '1000000000000000000', // 1 ETH
    gasPrice: '20000000000', // 20 Gwei
    gasUsed: '21000',
    timestamp: '1734567890',
    block: mockBlocks[0]
  },
  {
    id: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab',
    hash: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab',
    from: mockAccounts['0x8ba1f109551bd432803012645hac136c4c5c8b4'],
    to: mockAccounts['0xa0b86a33e6842ca7f50e75e1056a5a725df85b2b'],
    value: '500000000000000000', // 0.5 ETH
    gasPrice: '25000000000', // 25 Gwei
    gasUsed: '21000',
    timestamp: '1734567880',
    block: mockBlocks[0]
  },
  {
    id: '0x3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
    hash: '0x3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
    from: mockAccounts['0x8ba1f109551bd432803012645hac136c4c5c8b4'],
    to: mockAccounts['0x742d35cc6634c0532925a3b8d4c0b4c8b4e4c8b4'],
    value: '1500000000000000000', // 1.5 ETH
    gasPrice: '30000000000', // 30 Gwei
    gasUsed: '21000',
    timestamp: '1734567870',
    block: mockBlocks[0]
  }
];

// Resolvers
const root = {
  blocks: ({ first, skip, orderBy, orderDirection }) => {
    let sortedBlocks = [...mockBlocks];
    
    // 简单的排序实现
    if (orderBy && orderDirection) {
      sortedBlocks.sort((a, b) => {
        const aVal = orderBy === 'timestamp' ? parseInt(a.timestamp) : parseInt(a.number);
        const bVal = orderBy === 'timestamp' ? parseInt(b.timestamp) : parseInt(b.number);
        return orderDirection === 'desc' ? bVal - aVal : aVal - bVal;
      });
    }
    
    return sortedBlocks.slice(skip, skip + first);
  },
  transactions: ({ first, skip, account, orderBy, orderDirection }) => {
    let filteredTransactions = mockTransactions;
    
    // 如果提供了account参数，过滤交易
    if (account) {
      const accountLower = account.toLowerCase();
      filteredTransactions = mockTransactions.filter(tx => 
        tx.from.id.toLowerCase() === accountLower || 
        tx.to.id.toLowerCase() === accountLower
      );
    }
    
    // 简单的排序实现
    if (orderBy && orderDirection) {
      filteredTransactions.sort((a, b) => {
        const aVal = parseInt(a.timestamp);
        const bVal = parseInt(b.timestamp);
        return orderDirection === 'desc' ? bVal - aVal : aVal - bVal;
      });
    }
    
    return filteredTransactions.slice(skip, skip + first);
  },
  account: ({ id }) => {
    return mockAccounts[id.toLowerCase()] || null;
  }
};

// 创建Express应用
const app = express();

// 启用CORS
app.use(cors());

// GraphQL端点
app.use('/subgraphs/name/ethereum-transactions', graphqlHTTP({
  schema: typeDefs,
  rootValue: root,
  graphiql: true, // 启用GraphiQL界面用于测试
}));

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`🚀 模拟GraphQL服务器运行在 http://localhost:${PORT}/subgraphs/name/ethereum-transactions`);
  console.log(`📊 GraphiQL界面: http://localhost:${PORT}/subgraphs/name/ethereum-transactions`);
});