const { ApolloClient, InMemoryCache, gql } = require('@apollo/client');
require('cross-fetch/polyfill');

// 创建Apollo Client实例
const client = new ApolloClient({
  uri: 'https://api.studio.thegraph.com/query/119297/chengzf/v0.0.1',
  cache: new InMemoryCache()
});

// 测试查询
const GET_BLOCKS = gql`
  query GetBlocks {
    blocks(first: 5, skip: 0) {
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

// 执行测试
async function testGraphQLConnection() {
  console.log('\n测试GraphQL连接到子图端点...');
  console.log('端点URL:', 'http://localhost:8000/subgraphs/name/chengzf');
  
  try {
    const result = await client.query({
      query: GET_BLOCKS,
      fetchPolicy: 'network-only'
    });
    
    console.log('✅ GraphQL连接成功!');
    console.log('查询结果:', JSON.stringify(result.data, null, 2));
    
    if (result.data.blocks && result.data.blocks.length > 0) {
      console.log(`📊 成功获取 ${result.data.blocks.length} 个区块数据`);
    } else {
      console.log('⚠️  查询成功但没有返回区块数据，可能子图还没有索引到数据');
    }
    
  } catch (error) {
    console.log('❌ GraphQL连接失败:');
    console.error('错误详情:', error.message);
    
    if (error.networkError) {
      console.error('网络错误:', error.networkError.message);
    }
    
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      console.error('GraphQL错误:', error.graphQLErrors);
    }
  }
}

// 运行测试
testGraphQLConnection();