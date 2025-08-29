// 区块数据类型
export interface Block {
  id: string;
  number: string;
  timestamp: string;
  hash: string;
  gasUsed: string;
  gasLimit: string;
  transactionCount: number;
}

// 账户数据类型
export interface Account {
  id: string;
  transactionCount?: number;
  totalValueSent?: string;
  totalValueReceived?: string;
}

// 交易数据类型
export interface Transaction {
  id: string;
  hash: string;
  from: Account;
  to: Account;
  value: string;
  gasPrice: string;
  gasUsed: string;
  timestamp: string;
  block: {
    id: string;
    number: string;
  };
}

// GraphQL查询响应类型
export interface GetBlocksResponse {
  blocks: Block[];
}

export interface GetTransactionsResponse {
  transactions: Transaction[];
}

export interface GetAccountTransactionsResponse {
  transactions: Transaction[];
}

export interface GetAccountStatsResponse {
  account: Account | null;
}

// 分页参数类型
export interface PaginationParams {
  first: number;
  skip: number;
}

// 钱包连接状态类型
export interface WalletState {
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
}