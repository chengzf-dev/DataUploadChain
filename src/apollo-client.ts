import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';

// The Graph子图端点 - 使用 Studio 部署的真实端点
const SUBGRAPH_URL = 'https://api.studio.thegraph.com/query/119297/chengzf/v0.0.1';

// Create HTTP link
const httpLink = createHttpLink({
  uri: SUBGRAPH_URL,
});

// 创建Apollo Client实例
export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'ignore',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// GraphQL查询定义
export const GET_BLOCKS = gql`
  query GetBlocks($first: Int!, $skip: Int!) {
    blocks(first: $first, skip: $skip, orderBy: timestamp, orderDirection: desc) {
      id
      number
      timestamp
      hash
      gasUsed
      gasLimit
      transactionCount
    }
  }
`;

export const GET_TRANSACTIONS = gql`
  query GetTransactions($first: Int!, $skip: Int!) {
    transactions(first: $first, skip: $skip, orderBy: timestamp, orderDirection: desc) {
      id
      hash
      from {
        id
      }
      to {
        id
      }
      value
      gasPrice
      gasUsed
      timestamp
      block {
        id
        number
      }
    }
  }
`;

export const GET_ACCOUNT_TRANSACTIONS = gql`
  query GetAccountTransactions($account: String!, $first: Int!, $skip: Int!) {
    transactions(
      where: { or: [{ from: $account }, { to: $account }] }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      hash
      from {
        id
      }
      to {
        id
      }
      value
      gasPrice
      gasUsed
      timestamp
      block {
        id
        number
      }
    }
  }
`;

export const GET_ACCOUNT_STATS = gql`
  query GetAccountStats($account: String!) {
    account(id: $account) {
      id
      transactionCount
      totalValueSent
      totalValueReceived
    }
  }
`;