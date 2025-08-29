# InfoContract 合约集成使用说明

## 概述

本文档说明如何在前端 React 组件中集成和调用 InfoContract 智能合约，实现数据上链功能。

## 合约信息

- **合约地址**: `0x5d66ac89CB632c4354bd205545c71f9DEfFB4384`
- **网络**: Sepolia 测试网
- **主要功能**: 存储和管理讲师信息

## 集成方案

### 1. 合约配置

在组件中添加了以下配置：

```typescript
// InfoContract 配置
const INFO_CONTRACT_ADDRESS = '0x5d66ac89CB632c4354bd205545c71f9DEfFB4384';
const INFO_CONTRACT_ABI = [
  // setInfo 函数 - 用于写入数据
  {
    "inputs": [
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "uint256", "name": "_age", "type": "uint256"}
    ],
    "name": "setInfo",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // InstructorCreated 事件 - 用于监听合约事件
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "id", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
      {"indexed": true, "internalType": "uint256", "name": "age", "type": "uint256"}
    ],
    "name": "InstructorCreated",
    "type": "event"
  }
];
```

### 2. 合约调用实现

#### 核心函数：`handleLogSubmit`

```typescript
const handleLogSubmit = async () => {
  // 1. 检查钱包连接状态
  if (!isConnected) {
    message.warning('请先连接MetaMask钱包!');
    return;
  }
  
  // 2. 验证输入数据
  if (!logForm.name || !logForm.age) {
    message.warning('请填写完整的日志信息!');
    return;
  }

  // 3. 确保 signer 存在
  await ensureProviderAndSigner();
  
  // 4. 创建合约实例
  const contract = new ethers.Contract(INFO_CONTRACT_ADDRESS, INFO_CONTRACT_ABI, signer);
  
  // 5. 调用合约函数
  const tx = await contract.setInfo(logForm.name, parseInt(logForm.age));
  
  // 6. 等待交易确认
  const receipt = await tx.wait();
  
  // 7. 解析事件日志
  const logs = receipt.logs;
  for (const log of logs) {
    const parsedLog = contract.interface.parseLog(log);
    if (parsedLog.name === 'InstructorCreated') {
      const { id, name, age } = parsedLog.args;
      // 处理事件数据
    }
  }
};
```

### 3. 用户界面

在"日志方式"标签页中添加了：

- **姓名输入框**: 用于输入讲师姓名
- **年龄输入框**: 用于输入讲师年龄（数字类型）
- **提交按钮**: 调用合约的 `setInfo` 函数

### 4. 功能特性

#### 4.1 数据验证
- 检查钱包连接状态
- 验证输入字段完整性
- 年龄字段类型转换

#### 4.2 交易处理
- 实时显示交易状态
- 交易哈希和区块号显示
- Gas 费用计算和显示

#### 4.3 事件监听
- 自动解析 `InstructorCreated` 事件
- 提取事件参数（id, name, age）
- 将事件数据添加到记录列表

#### 4.4 错误处理
- 网络错误处理
- 合约调用失败处理
- 用户友好的错误提示

## 使用步骤

### 1. 准备工作
1. 确保 MetaMask 已安装并连接到 Sepolia 测试网
2. 账户中有足够的 SepoliaETH 用于支付 Gas 费用
3. 点击"连接MetaMask"按钮连接钱包

### 2. 调用合约
1. 切换到"日志方式"标签页
2. 输入讲师姓名
3. 输入讲师年龄（必须是数字）
4. 点击"提交到合约"按钮
5. 在 MetaMask 中确认交易

### 3. 查看结果
1. 等待交易确认（通常几秒到几分钟）
2. 查看页面底部的"数据上链记录"表格
3. 新记录将显示交易详情和合约调用结果
4. 可以点击交易哈希链接在 Etherscan 上查看详情

## 技术要点

### 1. ethers.js 集成
- 使用 `ethers.Contract` 创建合约实例
- 通过 `signer` 进行交易签名
- 使用 `contract.interface.parseLog` 解析事件

### 2. 事件处理
- 监听 `InstructorCreated` 事件
- 从交易回执中提取事件日志
- 解析事件参数并显示给用户

### 3. 状态管理
- 使用 React hooks 管理表单状态
- 实时更新交易记录列表
- 错误状态和加载状态处理

## 扩展功能

### 1. 添加更多合约函数
可以根据需要添加其他合约函数，如：
- `getPersonById`: 根据 ID 查询讲师信息
- `getLatestPerson`: 获取最新添加的讲师
- `getPersonCount`: 获取讲师总数

### 2. 事件订阅
可以实现实时事件监听：
```typescript
const contract = new ethers.Contract(INFO_CONTRACT_ADDRESS, INFO_CONTRACT_ABI, provider);
contract.on('InstructorCreated', (id, name, age) => {
  console.log(`新讲师创建: ID=${id}, 姓名=${name}, 年龄=${age}`);
});
```

### 3. 子图查询集成
结合已部署的子图，可以查询历史数据：
```typescript
const query = `
  query {
    instructors(first: 10, orderBy: timestamp, orderDirection: desc) {
      id
      name
      age
      timestamp
      transactionHash
    }
  }
`;
```

## 注意事项

1. **网络配置**: 确保连接到正确的网络（Sepolia）
2. **Gas 费用**: 每次合约调用都需要支付 Gas 费用
3. **交易确认**: 等待交易被矿工确认后才能看到结果
4. **错误处理**: 注意处理网络错误和合约执行失败的情况
5. **安全性**: 不要在前端代码中暴露私钥或敏感信息

## 故障排除

### 常见问题

1. **MetaMask 连接失败**
   - 检查是否安装了 MetaMask
   - 确认网络设置为 Sepolia
   - 刷新页面重试

2. **交易失败**
   - 检查账户余额是否足够
   - 确认输入数据格式正确
   - 查看 MetaMask 中的错误信息

3. **合约调用失败**
   - 验证合约地址是否正确
   - 检查 ABI 配置是否完整
   - 确认合约在目标网络上已部署

通过以上集成方案，您可以在前端应用中成功调用 InfoContract 合约，实现数据上链功能。