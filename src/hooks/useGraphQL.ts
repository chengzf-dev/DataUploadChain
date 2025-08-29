import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import {
  GET_BLOCKS,
  GET_TRANSACTIONS,
  GET_ACCOUNT_TRANSACTIONS,
  GET_ACCOUNT_STATS,
} from '../apollo-client';
import {
  Block,
  Transaction,
  Account,
  PaginationParams,
  GetBlocksResponse,
  GetTransactionsResponse,
  GetAccountTransactionsResponse,
  GetAccountStatsResponse,
} from '../types';

// 获取区块数据的Hook
export const useBlocks = (pagination: PaginationParams) => {
  const { loading, error, data, refetch } = useQuery<GetBlocksResponse>(
    GET_BLOCKS,
    {
      variables: pagination,
      pollInterval: 30000, // 每30秒轮询一次
    }
  );

  return {
    blocks: data?.blocks || [],
    loading,
    error,
    refetch,
  };
};

// 获取交易数据的Hook
export const useTransactions = (pagination: PaginationParams) => {
  const { loading, error, data, refetch } = useQuery<GetTransactionsResponse>(
    GET_TRANSACTIONS,
    {
      variables: pagination,
      pollInterval: 30000, // 每30秒轮询一次
    }
  );

  return {
    transactions: data?.transactions || [],
    loading,
    error,
    refetch,
  };
};

// 获取特定账户交易数据的Hook
export const useAccountTransactions = (
  account: string,
  pagination: PaginationParams
) => {
  const { loading, error, data, refetch } = useQuery<GetAccountTransactionsResponse>(
    GET_ACCOUNT_TRANSACTIONS,
    {
      variables: { account: account.toLowerCase(), ...pagination },
      skip: !account,
      pollInterval: 30000,
    }
  );

  return {
    transactions: data?.transactions || [],
    loading,
    error,
    refetch,
  };
};

// 获取账户统计数据的Hook
export const useAccountStats = (account: string) => {
  const { loading, error, data, refetch } = useQuery<GetAccountStatsResponse>(
    GET_ACCOUNT_STATS,
    {
      variables: { account: account.toLowerCase() },
      skip: !account,
    }
  );

  return {
    accountStats: data?.account,
    loading,
    error,
    refetch,
  };
};

// 分页管理Hook
export const usePagination = (pageSize: number = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize_, setPageSize] = useState(pageSize);

  const pagination: PaginationParams = {
    first: pageSize_,
    skip: (currentPage - 1) * pageSize_,
  };

  const nextPage = () => setCurrentPage(prev => prev + 1);
  const prevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToPage = (page: number) => setCurrentPage(Math.max(1, page));
  const resetPage = () => setCurrentPage(1);

  return {
    currentPage,
    pageSize: pageSize_,
    pagination,
    nextPage,
    prevPage,
    goToPage,
    resetPage,
    setPageSize,
  };
};