import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';

// Info Contract 子图端点
const INFO_SUBGRAPH_URL = 'https://api.studio.thegraph.com/query/119297/info-contract-subgraph/version/latest';

// Create HTTP link for info contract subgraph
const infoHttpLink = createHttpLink({
  uri: INFO_SUBGRAPH_URL,
});

// 创建专门用于 Info Contract 的 Apollo Client 实例
export const instructorClient = new ApolloClient({
  link: infoHttpLink,
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

// GraphQL 查询定义
export const GET_INSTRUCTORS = gql`
  query GetInstructors($first: Int, $orderBy: String, $orderDirection: String) {
    instructors(first: $first, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      instructorId
      name
      age
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// 根据讲师ID查询讲师（使用索引字段instructorId）
export const GET_INSTRUCTOR_BY_ID = gql`
  query GetInstructorById($instructorId: String!) {
    instructors(where: { instructorId: $instructorId }) {
      id
      instructorId
      name
      age
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// 根据年龄查询讲师（使用索引字段）
export const GET_INSTRUCTORS_BY_AGE = gql`
  query GetInstructorsByAge($age: String!) {
    instructors(where: { age: $age }) {
      id
      instructorId
      name
      age
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

// 根据年龄范围查询讲师
export const GET_INSTRUCTORS_BY_AGE_RANGE = gql`
  query GetInstructorsByAgeRange($minAge: String!, $maxAge: String!) {
    instructors(where: { age_gte: $minAge, age_lte: $maxAge }) {
      id
      instructorId
      name
      age
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

export default instructorClient;