import React, { useState } from 'react';
import { Tabs, Input, Button, Progress, Table, message } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import NetworkSwitcher from './NetworkSwitcher';
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_INSTRUCTORS, GET_INSTRUCTOR_BY_ID, GET_INSTRUCTORS_BY_AGE, GET_INSTRUCTORS_BY_AGE_RANGE, instructorClient } from '../graphql/instructorClient';
import './DataUploadSystem.css';
import { ethers } from 'ethers';

const { TabPane } = Tabs;
const { TextArea } = Input;

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

const DataUploadSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('transfer');
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [progress, setProgress] = useState(0);
  const [dataRecords, setDataRecords] = useState<DataRecord[]>([]);

  const { data: instructorsData, loading, error, refetch } = useQuery(GET_INSTRUCTORS, {
    variables: { first: 100, orderBy: 'blockTimestamp', orderDirection: 'desc' },
    client: instructorClient
  });
  const [getInstructorById, { data: instructorByIdData, loading: instructorByIdLoading, error: instructorByIdError }] = useLazyQuery(GET_INSTRUCTOR_BY_ID, {
    client: instructorClient,
    onCompleted: (data) => {
      console.log('按ID查询结果:', data);
      if (data.instructors && data.instructors.length > 0) {
        message.success(`找到 ${data.instructors.length} 条匹配记录`);
      } else {
        message.info('未找到匹配的记录');
      }
    },
    onError: (error) => {
      console.error('按ID查询错误:', error);
      message.error('查询失败: ' + error.message);
    }
  });
  const [getInstructorsByAge, { data: instructorsByAgeData, loading: instructorsByAgeLoading, error: instructorsByAgeError }] = useLazyQuery(GET_INSTRUCTORS_BY_AGE, {
    client: instructorClient,
    onCompleted: (data) => {
      console.log('按年龄查询结果:', data);
      if (data.instructors && data.instructors.length > 0) {
        message.success(`找到 ${data.instructors.length} 条匹配记录`);
      } else {
        message.info('未找到匹配的记录');
      }
    },
    onError: (error) => {
      console.error('按年龄查询错误:', error);
      message.error('查询失败: ' + error.message);
    }
  });
  const [getInstructorsByAgeRange, { data: instructorsByAgeRangeData, loading: instructorsByAgeRangeLoading, error: instructorsByAgeRangeError }] = useLazyQuery(GET_INSTRUCTORS_BY_AGE_RANGE, {
    client: instructorClient,
    onCompleted: (data) => {
      console.log('按年龄范围查询结果:', data);
      if (data.instructors && data.instructors.length > 0) {
        message.success(`找到 ${data.instructors.length} 条匹配记录`);
      } else {
        message.info('未找到匹配的记录');
      }
    },
    onError: (error) => {
      console.error('按年龄范围查询错误:', error);
      message.error('查询失败: ' + error.message);
    }
  });
  
  // 配置参数
  const INFURA_API_KEY = '2bef1fe43e6948e8b10d67f6d040d4c9';
  const NETWORK = 'sepolia'; // 或 'goerli'
  const provider = new ethers.JsonRpcProvider(`https://${NETWORK}.infura.io/v3/${INFURA_API_KEY}`);
   // InfoContract 配置
  const INFO_CONTRACT_ADDRESS = '0x5d66ac89CB632c4354bd205545c71f9DEfFB4384';
  const INFO_CONTRACT_ABI = [
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
  // 全局变量 - 使用 useState 保持状态
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [signer, setSigner] = useState<any>(null);
  const [browserProvider, setBrowserProvider] = useState<any>(null);
  
  // 转账方式表单数据
  const [transferForm, setTransferForm] = useState({
    amount: '',
    recipient: '',
    message: ''
  });
  
  // 日志方式表单数据
  const [logForm, setLogForm] = useState({
    name: '',
    age: ''
  });
  
  // 发送USDT表单数据
  const [usdtForm, setUsdtForm] = useState({
    amount: '',
    recipient: '',
    memo: ''
  });
  
  // 查询表单数据
  const [queryForm, setQueryForm] = useState({
    searchId: '',
    searchAge: '',
    minAge: '',
    maxAge: ''
  });
  
  // 跟踪最后执行的查询类型
  const [lastQueryType, setLastQueryType] = useState<string>('all');

  // 连接MetaMask
  const connectMetaMask = async () => {
    if(window.ethereum) {
      try {
        // 请求账户访问
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setCurrentAccount(accounts[0]);
        // 设置网络
        await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: `0xaa36a7` }] });
        // 创建MetaMask provider和签名者
        const newBrowserProvider = new ethers.BrowserProvider(window.ethereum);
        setBrowserProvider(newBrowserProvider);
        const newSigner = await newBrowserProvider.getSigner();
        setSigner(newSigner);
        console.log('signer', newSigner);
        
        setIsConnected(true);
        setWalletAddress(accounts[0]);
        const balance = await newBrowserProvider.getBalance(accounts[0]);
        setBalance(ethers.formatEther(balance));
        message.success('MetaMask钱包已连接!');
      } catch(error) {
        message.error('连接MetaMask失败!');
      }
    } else {
      message.error('请先安装MetaMask插件!');
    }
  };

  // 断开连接
  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    setBalance('');
    message.info('已断开钱包连接');
  };

  // 初始化或确保 provider 和 signer 存在
  const ensureProviderAndSigner = async () => {
    if (!window.ethereum) {
      throw new Error('请安装MetaMask!');
    }
    
    let currentBrowserProvider = browserProvider;
    if (!currentBrowserProvider) {
      currentBrowserProvider = new ethers.BrowserProvider(window.ethereum);
      setBrowserProvider(currentBrowserProvider);
    }
    
    let currentSigner = signer;
    if (!currentSigner) {
      currentSigner = await currentBrowserProvider.getSigner();
      setSigner(currentSigner);
    }
  };

  // 根据 ID 查询讲师
  const handleSearchById = () => {
    if (!queryForm.searchId.trim()) {
      message.warning('请输入要查询的讲师 ID!');
      return;
    }
    console.log('查询讲师 ID:', queryForm.searchId.trim());
    setLastQueryType('byId');
    getInstructorById({ variables: { instructorId: queryForm.searchId.trim() } });
    message.info('正在查询讲师信息...');
  };

  // 根据年龄查询讲师
  const handleSearchByAge = () => {
    if (!queryForm.searchAge.trim()) {
      message.warning('请输入要查询的年龄!');
      return;
    }
    const ageValue = parseInt(queryForm.searchAge.trim());
    if (isNaN(ageValue)) {
      message.warning('请输入有效的年龄数字!');
      return;
    }
    console.log('查询年龄:', ageValue.toString());
    setLastQueryType('byAge');
    getInstructorsByAge({ variables: { age: ageValue.toString() } });
    message.info('正在按年龄查询讲师信息...');
  };

  // 根据年龄范围查询讲师
  const handleSearchByAgeRange = () => {
    if (!queryForm.minAge.trim() || !queryForm.maxAge.trim()) {
      message.warning('请输入完整的年龄范围!');
      return;
    }
    const minAgeValue = parseInt(queryForm.minAge.trim());
    const maxAgeValue = parseInt(queryForm.maxAge.trim());
    if (isNaN(minAgeValue) || isNaN(maxAgeValue)) {
      message.warning('请输入有效的年龄数字!');
      return;
    }
    if (minAgeValue > maxAgeValue) {
      message.warning('最小年龄不能大于最大年龄!');
      return;
    }
    console.log('查询年龄范围:', minAgeValue.toString(), '到', maxAgeValue.toString());
    setLastQueryType('byAgeRange');
    getInstructorsByAgeRange({ 
      variables: { 
        minAge: minAgeValue.toString(), 
        maxAge: maxAgeValue.toString() 
      } 
    });
    message.info('正在按年龄范围查询讲师信息...');
  };

  // 提交转账
  const handleTransferSubmit = async () => {
    if (!isConnected) {
      message.warning('请先连接MetaMask钱包!');
      return;
    }
    
    if (!transferForm.amount || !transferForm.recipient) {
      message.warning('请填写完整的转账信息!');
      return;
    }

    // 确保 signer 和 browserProvider 存在
    try {
      await ensureProviderAndSigner();
    } catch (error) {
      message.error('获取签名者失败!');
      return;
    }

    try {
      const tx = {
        to: transferForm.recipient,
        value: ethers.parseEther(transferForm.amount),
        data: ethers.hexlify(ethers.toUtf8Bytes(transferForm.message || ''))
      };

      const txResponse = await signer.sendTransaction(tx);
      message.info(`交易已发送! 哈希: ${txResponse.hash}`);
      
      const receipt = await txResponse.wait();
      message.info(`交易已确认! 区块号: ${receipt.blockNumber}`);

      // 显示交易详情
      await displayTransactionDetails(txResponse.hash);
      
      // 重置表单
      setTransferForm({ amount: '', recipient: '', message: '' });
    } catch (error) {
      console.error('交易失败:', error);
      message.error(`交易失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 获取并显示交易详情
  const displayTransactionDetails = async (txHash: string) => {
    try {
      // 确保 browserProvider 存在
      let currentBrowserProvider = browserProvider;
      if (!currentBrowserProvider) {
        if (!window.ethereum) {
          throw new Error('请安装MetaMask!');
        }
        currentBrowserProvider = new ethers.BrowserProvider(window.ethereum);
        setBrowserProvider(currentBrowserProvider);
      }
      
      // 获取交易详情
      const tx = await currentBrowserProvider.getTransaction(txHash);
      const receipt = await currentBrowserProvider.getTransactionReceipt(txHash);
      
      if (!tx || !receipt) {
        throw new Error('无法获取交易详情');
      }
      
      const block = await currentBrowserProvider.getBlock(receipt.blockNumber);
      
      if (!block) {
        throw new Error('无法获取区块信息');
      }
      
      // 计算交易费用
      const transactionFee = ethers.formatEther(tx.gasPrice * receipt.gasUsed);
      
      // 创建新的数据记录
      const newRecord: DataRecord = {
        id: Date.now().toString(),
        txHash: txHash,
        blockNumber: receipt.blockNumber.toString(),
        timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
        sender: tx.from,
        recipient: tx.to || '-',
        amount: ethers.formatEther(tx.value),
        message: transferForm.message || '-',
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: ethers.formatUnits(tx.gasPrice, 'gwei'),
        transactionFee: transactionFee,
        status: receipt.status === 1 ? '成功' : '失败',
        etherscanUrl: `https://${NETWORK}.etherscan.io/tx/${txHash}`
      };
      
      // 添加到记录列表
      setDataRecords(prev => [newRecord, ...prev]);
      
      // 显示详细信息
      const detailsHtml = `
        <p><strong>交易哈希:</strong> ${txHash}</p>
        <p><strong>区块号:</strong> ${receipt.blockNumber}</p>
        <p><strong>时间戳:</strong> ${new Date(Number(block.timestamp) * 1000).toLocaleString()}</p>
        <p><strong>发送方:</strong> ${tx.from}</p>
        <p><strong>接收方:</strong> ${tx.to}</p>
        <p><strong>金额:</strong> ${ethers.formatEther(tx.value)} ETH</p>
        <p><strong>Gas 用量:</strong> ${receipt.gasUsed.toString()}</p>
        <p><strong>Gas 价格:</strong> ${ethers.formatUnits(tx.gasPrice, 'gwei')} Gwei</p>
        <p><strong>交易费用:</strong> ${transactionFee} ETH</p>
        <p><strong>状态:</strong> ${receipt.status === 1 ? '成功' : '失败'}</p>
        <p><a href="https://${NETWORK}.etherscan.io/tx/${txHash}" target="_blank">在Etherscan上查看</a></p>
      `;
      
      // 使用简单的message显示成功信息
      message.success('交易详情已获取并记录!');
      
    } catch (error) {
      console.error('获取交易详情失败:', error);
      message.error('获取交易详情失败!');
    }
  };

  // 提交日志
  const handleLogSubmit = async () => {
    if (!isConnected) {
      message.warning('请先连接MetaMask钱包!');
      return;
    }

    if(!logForm.name && !logForm.age) {
      message.warning('请填写完整的日志信息!');
      return;
    }
    try {
      await ensureProviderAndSigner();
    } catch (error) {
      message.error('获取签名者失败!');
      return;
    }
    try {
      // 创建合约实例
      const contract = new ethers.Contract(INFO_CONTRACT_ADDRESS, INFO_CONTRACT_ABI, signer);
      message.info('正在调用合约写入日志...');
      const tx = await contract.setInfo(logForm.name, logForm.age);
      message.info(`交易已发送! 哈希: ${tx.hash}`);
      // 等待交易确认
      const receipt = await tx.wait();
      message.success(`日志写入成功! 区块号: ${receipt.blockNumber}`);
       // 解析事件日志
      const logs = receipt.logs;
      for (const log of logs) {
          try {
            const parsedLog = contract.interface.parseLog(log);
            if (parsedLog?.name === 'InstructorCreated') {
              const { id, name, age } = parsedLog.args;
              message.success(`创建了新的讲师记录: ID=${id}, 姓名=${name}, 年龄=${age}`);
              // 添加到记录列表
              const newRecord: DataRecord = {
                id: Date.now().toString(),
                txHash: tx.hash,
                blockNumber: receipt.blockNumber.toString(),
                timestamp: new Date().toLocaleString(),
                sender: tx.from,
                recipient: INFO_CONTRACT_ADDRESS,
                message: `创建讲师: ${name}, 年龄: ${age}`,
                gasUsed: receipt.gasUsed.toString(),
                gasPrice: ethers.formatUnits(tx.gasPrice, 'gwei'),
                transactionFee: ethers.formatEther(tx.gasPrice * receipt.gasUsed),
                status: receipt.status === 1 ? '成功' : '失败',
                etherscanUrl: `https://${NETWORK}.etherscan.io/tx/${tx.hash}`
              };
              setDataRecords(prev => [newRecord, ...prev]);
              break;
            }
          } catch (parseError) {
               console.log('解析日志失败:', parseError);
          }
      }
        // 重置表单
      setLogForm({ name: '', age: '' });
    } catch (error) {
      console.error('调用合约失败:', error);
      message.error(`调用合约失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
   };

  // 提交USDT
  const handleUsdtSubmit = async () => {
    if (!isConnected) {
      message.warning('请先连接MetaMask钱包!');
      return;
    }
    
    if (!usdtForm.amount || !usdtForm.recipient) {
      message.warning('请填写完整的USDT信息!');
      return;
    }

    // setProgress(0);
    // const interval = setInterval(() => {
    //   setProgress(prev => {
    //     if (prev >= 100) {
    //       clearInterval(interval);
    //       const newRecord: DataRecord = {
    //         id: Date.now().toString(),
    //         type: 'USDT转账',
    //         amount: usdtForm.amount + ' USDT',
    //         recipient: usdtForm.recipient,
    //         message: usdtForm.memo,
    //         timestamp: new Date().toLocaleString(),
    //         status: '已完成'
    //       };
    //       setDataRecords(prev => [newRecord, ...prev]);
    //       message.success('USDT转账数据上链成功!');
    //       setUsdtForm({ amount: '', recipient: '', memo: '' });
    //       return 100;
    //     }
    //     return prev + 10;
    //   });
    // }, 200);
  };

  
  // 表格列定义
  const columns = [
    {
      title: '交易哈希',
      dataIndex: 'txHash',
      key: 'txHash',
      width: 150,
      ellipsis: true,
      render: (text: string, record: DataRecord) => {
        if (text && record.etherscanUrl) {
          return (
            <a href={record.etherscanUrl} target="_blank" rel="noopener noreferrer">
              {text.slice(0, 10)}...{text.slice(-8)}
            </a>
          );
        }
        return text ? `${text.slice(0, 10)}...${text.slice(-8)}` : '-';
      },
    },
    {
      title: '区块号',
      dataIndex: 'blockNumber',
      key: 'blockNumber',
      width: 100,
    },
     {
      title: '时间戳',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
    },
    {
      title: '发送方',
      dataIndex: 'sender',
      key: 'sender',
      width: 150,
      ellipsis: true,
      render: (text: string) => text ? `${text.slice(0, 6)}...${text.slice(-4)}` : '-',
    },
    {
      title: '接收方',
      dataIndex: 'recipient',
      key: 'recipient',
      width: 150,
      ellipsis: true,
      render: (text: string) => text ? `${text.slice(0, 6)}...${text.slice(-4)}` : '-',
    },
     {
      title: '金额(ETH)',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
    },
     {
      title: 'Gas用量',
      dataIndex: 'gasUsed',
      key: 'gasUsed',
      width: 120,
    },
    {
      title: 'Gas价格(Gwei)',
      dataIndex: 'gasPrice',
      key: 'gasPrice',
      width: 130,
    },
    {
      title: 'Gas费用(ETH)',
      dataIndex: 'transactionFee',
      key: 'transactionFee',
      width: 130,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (text: string) => {
        const color = text === '成功' ? 'green' : text === '失败' ? 'red' : 'orange';
        return <span style={{ color }}>{text}</span>;
      },
    },
  ];

  return (
    <div className="data-upload-system">
      <div className="system-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h1>数据上链系统</h1>
          <NetworkSwitcher />
        </div>
      </div>
      
      <div className="system-content">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
        >
          <TabPane tab="转账方式" key="transfer">
            <div className="tab-content">
              <div className="form-section">
                <div className="form-row">
                  <label>转账金额:</label>
                  <Input
                    placeholder="请输入转账金额"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <label>收款账户:</label>
                  <Input
                    placeholder="请输入收款账户地址"
                    value={transferForm.recipient}
                    onChange={(e) => setTransferForm({...transferForm, recipient: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <label>数据留言:</label>
                  <TextArea
                    placeholder="请输入数据留言"
                    rows={3}
                    value={transferForm.message}
                    onChange={(e) => setTransferForm({...transferForm, message: e.target.value})}
                  />
                </div>
              </div>
              <div className="submit-section">
                <Button 
                  type="primary" 
                  size="large"
                  onClick={handleTransferSubmit}
                  disabled={!isConnected}
                >
                  提交
                </Button>
              </div>
            </div>
          </TabPane>
          
          <TabPane tab="日志方式" key="log">
            <div className="tab-content">
              <div className="form-section">
                <div className="form-row">
                  <label>姓名:</label>
                  <Input
                    placeholder="请输入姓名"
                    value={logForm.name}
                    onChange={(e) => setLogForm({...logForm, name: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <label>年龄:</label>
                  <Input
                    placeholder="请输入年龄"
                    type="number"
                    value={logForm.age}
                    onChange={(e) => setLogForm({...logForm, age: e.target.value})}
                  />
                </div>
              </div>
              <div className="submit-section">
                <Button 
                  type="primary" 
                  size="large"
                  onClick={handleLogSubmit}
                  disabled={!isConnected}
                >
                  提交到合约
                </Button>
              </div>
            </div>
          </TabPane>
          
          <TabPane tab="发送USDT的方式" key="usdt">
            <div className="tab-content">
              <div className="form-section">
                <div className="form-row">
                  <label>USDT金额:</label>
                  <Input
                    placeholder="请输入USDT金额"
                    value={usdtForm.amount}
                    onChange={(e) => setUsdtForm({...usdtForm, amount: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <label>收款账户:</label>
                  <Input
                    placeholder="请输入收款账户地址"
                    value={usdtForm.recipient}
                    onChange={(e) => setUsdtForm({...usdtForm, recipient: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <label>备注信息:</label>
                  <TextArea
                    placeholder="请输入备注信息"
                    rows={3}
                    value={usdtForm.memo}
                    onChange={(e) => setUsdtForm({...usdtForm, memo: e.target.value})}
                  />
                </div>
              </div>
              <div className="submit-section">
                <Button 
                  type="primary" 
                  size="large"
                  onClick={handleUsdtSubmit}
                  disabled={!isConnected}
                >
                  提交
                </Button>
              </div>
            </div>
          </TabPane>
        </Tabs>
        
        <div className="progress-section">
          <Progress 
            percent={progress} 
            status={progress === 100 ? 'success' : 'active'}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
        </div>
        
        <div className="records-section">
          <h2>数据上链记录</h2>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <Table
              columns={columns}
              dataSource={dataRecords}
              rowKey="id"
              scroll={{ x: 1500 }} 
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              locale={{
                emptyText: '暂无数据记录'
              }}
            />
          </div>
        </div>
        
        {/* GraphQL 区块链数据查询区域 */}
        <div className="graphql-section">
          <h2>GraphQL 区块链数据查询</h2>
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f0f8ff', border: '1px solid #d1ecf1', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#0c5460' }}>
              <strong>说明：</strong>系统ID是The Graph自动生成的复合ID（交易哈希+日志索引），讲师ID是合约中定义的数字ID。查询时请使用讲师ID。
            </p>
          </div>
          
          {/* 查询控制区域 */}
          <div className="graphql-controls">
            <div style={{ marginBottom: '16px' }}>
              <Button 
                type="primary" 
                onClick={() => {
                  setLastQueryType('all');
                  refetch();
                }}
                loading={loading}
                style={{ marginRight: '8px' }}
              >
                刷新所有数据
              </Button>
            </div>
            
            {/* 基于索引的查询 */}
            <div className="index-queries" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
              {/* 根据 ID 查询 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Input
                  placeholder="输入讲师ID（数字）"
                  value={queryForm.searchId}
                  onChange={(e) => setQueryForm({...queryForm, searchId: e.target.value})}
                  style={{ width: '120px' }}
                />
                <Button 
                  onClick={handleSearchById}
                  loading={instructorByIdLoading}
                >
                  按讲师ID查询
                </Button>
              </div>
              
              {/* 根据年龄查询 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Input
                  placeholder="输入年龄"
                  type="number"
                  value={queryForm.searchAge}
                  onChange={(e) => setQueryForm({...queryForm, searchAge: e.target.value})}
                  style={{ width: '100px' }}
                />
                <Button 
                  onClick={handleSearchByAge}
                  loading={instructorsByAgeLoading}
                >
                  按年龄查询
                </Button>
              </div>
              
              {/* 根据年龄范围查询 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Input
                  placeholder="最小年龄"
                  type="number"
                  value={queryForm.minAge}
                  onChange={(e) => setQueryForm({...queryForm, minAge: e.target.value})}
                  style={{ width: '80px' }}
                />
                <span>-</span>
                <Input
                  placeholder="最大年龄"
                  type="number"
                  value={queryForm.maxAge}
                  onChange={(e) => setQueryForm({...queryForm, maxAge: e.target.value})}
                  style={{ width: '80px' }}
                />
                <Button 
                  onClick={handleSearchByAgeRange}
                  loading={instructorsByAgeRangeLoading}
                >
                  按年龄范围查询
                </Button>
              </div>
            </div>
          </div>
          
          {/* 查询状态显示 */}
          {loading && <div>正在查询区块链数据...</div>}
          {error && <div style={{color: 'red'}}>查询错误: {error.message}</div>}
          
          {/* 统一的讲师记录列表 */}
          {(() => {
            // 根据最后执行的查询类型和查询状态确定显示哪个结果
            let allInstructors: any[] = [];
            let resultTitle = "讲师记录";
            
            // 检查是否有正在进行的查询
            if (instructorsByAgeRangeLoading) {
              return <div>正在按年龄范围查询...</div>;
            } else if (instructorsByAgeLoading) {
              return <div>正在按年龄查询...</div>;
            } else if (instructorByIdLoading) {
              return <div>正在按讲师ID查询...</div>;
            }
            
            // 根据最后执行的查询类型显示对应的结果
            switch (lastQueryType) {
              case 'byAgeRange':
                if (instructorsByAgeRangeData?.instructors) {
                  allInstructors = instructorsByAgeRangeData.instructors;
                  resultTitle = "按年龄范围查询结果";
                }
                break;
              case 'byAge':
                if (instructorsByAgeData?.instructors) {
                  allInstructors = instructorsByAgeData.instructors;
                  resultTitle = "按年龄查询结果";
                }
                break;
              case 'byId':
                if (instructorByIdData?.instructors) {
                  allInstructors = instructorByIdData.instructors;
                  resultTitle = "按讲师ID查询结果";
                }
                break;
              default:
                if (instructorsData?.instructors) {
                  allInstructors = instructorsData.instructors;
                  resultTitle = "所有讲师记录";
                }
                break;
            }
            
            if (allInstructors.length === 0) {
              return <div>暂无数据</div>;
            }
            
            return (
              <div className="query-results">
                <h3>{resultTitle} (共 {allInstructors.length} 条)</h3>
                {allInstructors.map((instructor: any) => (
                  <div key={instructor.id} className="instructor-item">
                    <p><strong>系统ID:</strong> {instructor.id}</p>
                    <p><strong>讲师ID:</strong> {instructor.instructorId}</p>
                    <p><strong>姓名:</strong> {instructor.name}</p>
                    <p><strong>年龄:</strong> {instructor.age}</p>
                    <p><strong>区块号:</strong> {instructor.blockNumber}</p>
                    <p><strong>时间:</strong> {new Date(instructor.blockTimestamp * 1000).toLocaleString()}</p>
                    <p><strong>交易哈希:</strong> 
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${instructor.transactionHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {instructor.transactionHash}
                      </a>
                    </p>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default DataUploadSystem;