# The Graph Demo - 前端应用

## 项目简介

这是一个基于 React 和 TypeScript 的以太坊区块链数据查询前端应用，通过 GraphQL 和 ethers.js 提供多种方式来查询和展示以太坊网络上的区块、交易和账户信息。该应用支持连接钱包、查询历史数据，并提供直观的用户界面。

## 功能特性

- 🔗 **钱包连接** - 支持 MetaMask 等以太坊钱包连接
- 📊 **区块浏览** - 实时查看最新区块信息和统计数据
- 💰 **交易查询** - 支持多种方式查询交易记录
- 🔍 **地址搜索** - 根据钱包地址查询相关交易
- 📈 **数据可视化** - 直观展示区块链数据和统计信息
- ⚡ **实时更新** - 自动获取最新的区块链数据
- 🎨 **响应式设计** - 适配不同设备和屏幕尺寸

## 技术栈

- **React 19** - 现代化的前端框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Apollo Client** - GraphQL 客户端和状态管理
- **ethers.js** - 以太坊区块链交互库
- **CSS3** - 现代化的样式设计
- **React Hooks** - 函数式组件状态管理

## 项目结构

```
src/
├── components/          # React 组件
│   ├── BlockList.tsx   # 区块列表组件
│   ├── TransactionList.tsx  # 交易列表组件
│   ├── TransactionQuery.tsx # 交易查询组件
│   └── WalletConnect.tsx    # 钱包连接组件
├── hooks/              # 自定义 Hooks
│   ├── useGraphQL.ts   # GraphQL 查询 Hook
│   └── useWallet.ts    # 钱包连接 Hook
├── types/              # TypeScript 类型定义
│   └── index.ts        # 通用类型定义
├── apollo-client.ts    # Apollo Client 配置
├── App.tsx            # 主应用组件
└── index.tsx          # 应用入口点
```

## 安装和设置

### 前置要求

- Node.js (v16 或更高版本)
- npm 或 yarn
- 现代化的 Web 浏览器
- MetaMask 或其他以太坊钱包 (可选)

### 安装依赖

```bash
npm install
```

### 环境配置

创建 `.env` 文件并配置必要的环境变量：

```env
REACT_APP_GRAPHQL_ENDPOINT=your_graphql_endpoint
REACT_APP_ETHEREUM_RPC_URL=https://ethereum.publicnode.com
```

## 使用说明

### 启动开发服务器

```bash
npm start
```

应用将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
npm run build
```

### 运行测试

```bash
npm test
```

## 主要功能模块

### 1. 钱包连接 (WalletConnect)

- 支持 MetaMask 钱包连接
- 显示当前连接的账户地址
- 获取账户余额信息
- 网络状态检测

**使用方式：**
```typescript
const { account, balance, connectWallet, disconnect } = useWallet();
```

### 2. 区块列表 (BlockList)

- 展示最新的区块信息
- 包含区块号、哈希、时间戳
- 显示交易数量和 Gas 使用情况
- 支持分页浏览

**主要功能：**
- 实时获取最新区块
- 区块详情展示
- 时间格式化显示
- 点击复制区块哈希

### 3. 交易列表 (TransactionList)

- 显示交易详细信息
- 支持按地址过滤交易
- 展示发送方、接收方、金额
- Gas 费用和交易状态

**查询功能：**
- 最新交易列表
- 特定地址的交易记录
- 交易状态筛选
- 金额范围过滤

### 4. 交易查询 (TransactionQuery)

- 多种查询方式支持
- 按区块号查询交易
- 按钱包地址过滤
- 实时以太坊数据获取

**查询选项：**
- 钱包地址查询
- 区块号范围查询
- 交易哈希搜索
- 时间范围筛选

## GraphQL 查询示例

### 查询区块信息

```graphql
query GetBlocks($first: Int!) {
  blocks(first: $first, orderBy: number, orderDirection: desc) {
    id
    number
    hash
    timestamp
    transactionCount
    gasUsed
    gasLimit
  }
}
```

### 查询交易记录

```graphql
query GetTransactions($first: Int!, $where: Transaction_filter) {
  transactions(first: $first, where: $where, orderBy: timestamp, orderDirection: desc) {
    id
    hash
    from {
      address
    }
    to {
      address
    }
    value
    gasPrice
    gasUsed
    status
    timestamp
  }
}
```

### 查询账户信息

```graphql
query GetAccount($id: ID!) {
  account(id: $id) {
    address
    transactionCount
    totalValueSent
    totalValueReceived
    sentTransactions(first: 10) {
      hash
      value
      timestamp
    }
    receivedTransactions(first: 10) {
      hash
      value
      timestamp
    }
  }
}
```

## 自定义 Hooks

### useWallet Hook

```typescript
const {
  account,        // 当前连接的账户地址
  balance,        // 账户余额
  isConnected,    // 连接状态
  connectWallet,  // 连接钱包函数
  disconnect      // 断开连接函数
} = useWallet();
```

### useGraphQL Hook

```typescript
const {
  data,           // 查询结果数据
  loading,        // 加载状态
  error,          // 错误信息
  refetch         // 重新查询函数
} = useGraphQL(query, variables);
```

## 样式和主题

### CSS 模块化

每个组件都有对应的 CSS 文件：
- `BlockList.css` - 区块列表样式
- `TransactionList.css` - 交易列表样式
- `TransactionQuery.css` - 查询界面样式
- `WalletConnect.css` - 钱包连接样式

### 响应式设计

- 移动端适配
- 平板设备优化
- 桌面端完整功能
- 暗色主题支持 (计划中)

## 部署指南

### Vercel 部署

1. 连接 GitHub 仓库
2. 配置环境变量
3. 自动部署

### Netlify 部署

1. 构建项目：`npm run build`
2. 上传 `build` 文件夹
3. 配置重定向规则

### Docker 部署

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 开发指南

### 添加新组件

1. 在 `src/components/` 创建组件文件
2. 添加对应的 CSS 样式文件
3. 在 `App.tsx` 中引入和使用
4. 添加 TypeScript 类型定义

### 自定义 GraphQL 查询

1. 在 `hooks/useGraphQL.ts` 中定义查询
2. 创建对应的 TypeScript 接口
3. 在组件中使用自定义 Hook

### 添加新的钱包支持

1. 扩展 `useWallet.ts` Hook
2. 添加钱包检测逻辑
3. 更新 `WalletConnect` 组件

## 故障排除

### 常见问题

1. **钱包连接失败**
   - 检查 MetaMask 是否已安装
   - 确认网络配置正确
   - 清除浏览器缓存

2. **GraphQL 查询错误**
   - 验证 GraphQL 端点配置
   - 检查查询语法
   - 确认网络连接

3. **交易查询超时**
   - 使用更稳定的 RPC 端点
   - 减少查询数据量
   - 添加重试机制

### 调试技巧

- 使用浏览器开发者工具
- 检查 Network 标签页的请求
- 查看 Console 中的错误信息
- 使用 React Developer Tools

## 性能优化

- 使用 React.memo 优化组件渲染
- 实现虚拟滚动处理大量数据
- 添加数据缓存机制
- 懒加载非关键组件

## 贡献指南

1. Fork 项目仓库
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -m 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证。详情请参阅 LICENSE 文件。

## 相关链接

- [React 官方文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Apollo Client 文档](https://www.apollographql.com/docs/react/)
- [ethers.js 文档](https://docs.ethers.org/)
- [MetaMask 开发者文档](https://docs.metamask.io/)
