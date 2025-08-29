# dataUploadSystem - 数据上链系统

## 项目简介

这是一个基于 React 和 TypeScript 的以太坊区块链数据上链系统，通过 MetaMask 钱包连接和智能合约交互，提供多种方式将数据写入区块链并查询历史记录。该系统支持 ETH 转账、智能合约调用、GraphQL 数据查询等功能。

## 核心组件：DataUploadSystem

`DataUploadSystem` 是系统的核心组件，位于 `src/components/DataUploadSystem.tsx`，提供了完整的区块链数据上链和查询功能。

## 功能特性

- 🔗 **钱包连接** - 支持 MetaMask 钱包连接和网络切换
- 💰 **ETH 转账** - 支持以太坊转账并记录交易详情
- 📝 **智能合约调用** - 通过合约写入讲师信息到区块链
- 🔍 **多维度查询** - 支持按 ID、年龄、年龄范围查询讲师记录
- 📊 **交易记录** - 实时显示交易详情和状态
- 🌐 **网络支持** - 支持 Sepolia 测试网络
- 📈 **数据可视化** - 直观展示区块链交易和合约数据

## 技术栈

- **React 19** - 现代化的前端框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **ethers.js v6** - 以太坊区块链交互库
- **Apollo Client** - GraphQL 客户端和状态管理
- **Ant Design** - UI 组件库
- **MetaMask** - 以太坊钱包集成

## 组件结构

```
src/components/
├── DataUploadSystem.tsx    # 主要数据上链系统组件
├── DataUploadSystem.css    # 组件样式文件
├── NetworkSwitcher.jsx     # 网络切换组件
└── NetworkSwitcher.css     # 网络切换样式
```

## 主要功能模块

### 1. 钱包连接管理

- **MetaMask 集成**：自动检测和连接 MetaMask 钱包
- **账户信息**：显示当前连接的钱包地址和余额
- **网络切换**：支持切换到 Sepolia 测试网络
- **连接状态**：实时显示钱包连接状态

```typescript
const connectMetaMask = async () => {
  if(window.ethereum) {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    // 切换到 Sepolia 网络
    await window.ethereum.request({ 
      method: 'wallet_switchEthereumChain', 
      params: [{ chainId: `0xaa36a7` }] 
    });
  }
};
```

### 2. ETH 转账功能

- **转账表单**：输入转账金额、收款地址和数据留言
- **交易执行**：通过 ethers.js 发送以太坊交易
- **交易跟踪**：实时显示交易哈希和确认状态
- **详情记录**：自动记录交易详情到本地表格

**主要特性：**
- 支持 ETH 转账
- 可附加数据留言
- 自动计算 Gas 费用
- Etherscan 链接查看

### 3. 智能合约交互

- **合约地址**：`0x5d66ac89CB632c4354bd205545c71f9DEfFB4384`
- **合约功能**：调用 `setInfo` 方法写入讲师信息
- **事件监听**：监听 `InstructorCreated` 事件
- **数据上链**：将姓名和年龄信息永久存储到区块链

```typescript
const contract = new ethers.Contract(INFO_CONTRACT_ADDRESS, INFO_CONTRACT_ABI, signer);
const tx = await contract.setInfo(name, age);
const receipt = await tx.wait();
```

### 4. GraphQL 数据查询

支持多种查询方式：

#### 查询所有讲师记录
```graphql
query GetInstructors($first: Int!, $orderBy: String!, $orderDirection: String!) {
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
```

#### 按 ID 查询讲师
```graphql
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
```

#### 按年龄查询讲师
```graphql
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
```

#### 按年龄范围查询讲师
```graphql
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
```

### 5. 交易记录表格

实时显示所有交易记录，包括：
- **交易哈希**：可点击跳转到 Etherscan
- **区块号**：交易所在区块
- **时间戳**：交易确认时间
- **发送方/接收方**：交易双方地址
- **金额**：转账金额（ETH）
- **Gas 信息**：Gas 用量、价格和费用
- **交易状态**：成功/失败状态显示

## 网络配置

### Sepolia 测试网络
- **网络名称**：Sepolia
- **RPC URL**：`https://sepolia.infura.io/v3/[API_KEY]`
- **Chain ID**：`0xaa36a7` (11155111)
- **区块浏览器**：https://sepolia.etherscan.io/

### 智能合约信息
- **合约地址**：`0x5d66ac89CB632c4354bd205545c71f9DEfFB4384`
- **网络**：Sepolia 测试网
- **主要方法**：`setInfo(string _name, uint256 _age)`
- **事件**：`InstructorCreated(uint256 indexed id, string name, uint256 indexed age)`

## 使用指南

### 1. 环境准备

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start
```

### 2. 钱包设置

1. 安装 MetaMask 浏览器插件
2. 创建或导入钱包
3. 添加 Sepolia 测试网络
4. 获取测试 ETH（通过水龙头）

### 3. 功能使用

#### 连接钱包
1. 点击页面右上角的网络切换器
2. 点击"连接 MetaMask"按钮
3. 在 MetaMask 中确认连接
4. 系统会自动切换到 Sepolia 网络

#### ETH 转账
1. 切换到"转账方式"标签页
2. 输入转账金额（ETH）
3. 输入收款账户地址
4. 可选：输入数据留言
5. 点击"提交转账"按钮
6. 在 MetaMask 中确认交易

#### 写入合约数据
1. 切换到"日志方式"标签页
2. 输入讲师姓名
3. 输入讲师年龄
4. 点击"提交日志"按钮
5. 在 MetaMask 中确认交易
6. 等待交易确认和事件触发

#### 查询数据
1. 切换到"查询数据"标签页
2. 选择查询方式：
   - 按讲师 ID 查询
   - 按年龄查询
   - 按年龄范围查询
3. 输入查询条件
4. 点击对应的查询按钮
5. 查看查询结果

## 数据结构

### DataRecord 接口
```typescript
interface DataRecord {
  id: string;
  txHash?: string;
  blockNumber?: string;
  amount?: string;
  sender?: string;
  recipient?: string;
  message?: string;
  gasUsed?: string;
  gasPrice?: string;
  transactionFee?: string;
  timestamp: string;
  status: string;
  etherscanUrl?: string;
}
```

### 讲师记录结构
```typescript
interface Instructor {
  id: string;
  instructorId: string;
  name: string;
  age: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}
```

## 样式设计

组件采用现代化的 CSS 设计，包括：
- **响应式布局**：适配不同屏幕尺寸
- **标签页设计**：清晰的功能分区
- **表格展示**：专业的数据展示界面
- **状态指示**：直观的连接和交易状态
- **交互反馈**：丰富的用户操作反馈

## 错误处理

系统包含完善的错误处理机制：
- **钱包连接错误**：检测 MetaMask 安装和连接状态
- **网络错误**：自动切换到正确的测试网络
- **交易错误**：显示详细的交易失败原因
- **查询错误**：GraphQL 查询异常处理
- **合约调用错误**：智能合约交互异常处理

## 性能优化

- **懒加载查询**：使用 `useLazyQuery` 按需查询数据
- **状态管理**：合理的组件状态设计
- **内存管理**：及时清理事件监听器
- **缓存机制**：Apollo Client 自动缓存查询结果

## 安全考虑

- **私钥安全**：不存储用户私钥，完全依赖 MetaMask
- **交易确认**：所有交易都需要用户在 MetaMask 中确认
- **网络验证**：确保连接到正确的测试网络
- **输入验证**：对用户输入进行基本验证

## 开发指南

### 添加新的查询功能

1. 在 GraphQL 客户端中定义新的查询
2. 在组件中添加对应的 `useLazyQuery` Hook
3. 创建查询表单和处理函数
4. 更新查询结果显示逻辑

### 扩展智能合约功能

1. 更新合约 ABI 定义
2. 添加新的合约方法调用
3. 处理新的合约事件
4. 更新交易记录结构

### 自定义样式

修改 `DataUploadSystem.css` 文件来自定义组件样式：
- `.data-upload-system` - 主容器样式
- `.system-header` - 头部样式
- `.tab-content` - 标签页内容样式
- `.form-section` - 表单区域样式
- `.query-results` - 查询结果样式

## 故障排除

### 常见问题

1. **MetaMask 连接失败**
   - 检查 MetaMask 是否已安装
   - 确认浏览器允许弹窗
   - 重新刷新页面重试

2. **网络切换失败**
   - 手动在 MetaMask 中切换到 Sepolia 网络
   - 检查网络配置是否正确

3. **交易失败**
   - 检查账户余额是否足够
   - 确认 Gas 费用设置
   - 查看 MetaMask 错误信息

4. **查询无结果**
   - 确认 GraphQL 端点可访问
   - 检查查询参数是否正确
   - 查看浏览器控制台错误信息

### 调试技巧

- 使用浏览器开发者工具查看网络请求
- 检查 MetaMask 控制台日志
- 在 Etherscan 上验证交易状态
- 使用 GraphQL Playground 测试查询

## 许可证

本项目采用 MIT 许可证。详情请参阅 LICENSE 文件。

## 相关链接

- [React 官方文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [ethers.js 文档](https://docs.ethers.org/)
- [Apollo Client 文档](https://www.apollographql.com/docs/react/)
- [Ant Design 文档](https://ant.design/)
- [MetaMask 开发者文档](https://docs.metamask.io/)
- [Sepolia 测试网络](https://sepolia.dev/)
- [Etherscan Sepolia](https://sepolia.etherscan.io/)
