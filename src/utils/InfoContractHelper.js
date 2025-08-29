// InfoContract 合约调用辅助工具
import { ethers } from 'ethers';

// 合约配置
export const INFO_CONTRACT_ADDRESS = '0x5d66ac89CB632c4354bd205545c71f9DEfFB4384';
export const NETWORK = 'sepolia';

// 完整的合约 ABI
export const INFO_CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_initialName", "type": "string"},
      {"internalType": "uint256", "name": "_initialAge", "type": "uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
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
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_id", "type": "uint256"}],
    "name": "getPersonById",
    "outputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "uint256", "name": "age", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getLatestPerson",
    "outputs": [
      {"internalType": "string", "name": "", "type": "string"},
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPersonCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextId",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "people",
    "outputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "uint256", "name": "age", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "sayHi",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "uint256", "name": "_age", "type": "uint256"}
    ],
    "name": "setInfo",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

/**
 * InfoContract 辅助类
 */
export class InfoContractHelper {
  constructor(signer) {
    this.signer = signer;
    this.contract = new ethers.Contract(INFO_CONTRACT_ADDRESS, INFO_CONTRACT_ABI, signer);
  }

  /**
   * 创建新的讲师记录
   * @param {string} name - 讲师姓名
   * @param {number} age - 讲师年龄
   * @returns {Promise<Object>} 交易结果
   */
  async createInstructor(name, age) {
    try {
      console.log(`正在创建讲师: ${name}, 年龄: ${age}`);
      
      // 调用合约函数
      const tx = await this.contract.setInfo(name, age);
      console.log(`交易已发送: ${tx.hash}`);
      
      // 等待交易确认
      const receipt = await tx.wait();
      console.log(`交易已确认: 区块号 ${receipt.blockNumber}`);
      
      // 解析事件
      const events = this.parseInstructorCreatedEvents(receipt);
      
      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        events: events,
        etherscanUrl: `https://${NETWORK}.etherscan.io/tx/${tx.hash}`
      };
    } catch (error) {
      console.error('创建讲师失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 根据 ID 获取讲师信息
   * @param {number} id - 讲师 ID
   * @returns {Promise<Object>} 讲师信息
   */
  async getInstructorById(id) {
    try {
      const [name, age] = await this.contract.getPersonById(id);
      return {
        success: true,
        data: { id, name, age: age.toString() }
      };
    } catch (error) {
      console.error('获取讲师信息失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 获取最新的讲师信息
   * @returns {Promise<Object>} 最新讲师信息
   */
  async getLatestInstructor() {
    try {
      const [name, age] = await this.contract.getLatestPerson();
      return {
        success: true,
        data: { name, age: age.toString() }
      };
    } catch (error) {
      console.error('获取最新讲师信息失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 获取讲师总数
   * @returns {Promise<Object>} 讲师总数
   */
  async getInstructorCount() {
    try {
      const count = await this.contract.getPersonCount();
      return {
        success: true,
        data: { count: count.toString() }
      };
    } catch (error) {
      console.error('获取讲师总数失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 获取下一个 ID
   * @returns {Promise<Object>} 下一个 ID
   */
  async getNextId() {
    try {
      const nextId = await this.contract.nextId();
      return {
        success: true,
        data: { nextId: nextId.toString() }
      };
    } catch (error) {
      console.error('获取下一个ID失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 调用 sayHi 函数
   * @returns {Promise<Object>} 问候语
   */
  async sayHi() {
    try {
      const greeting = await this.contract.sayHi();
      return {
        success: true,
        data: { greeting }
      };
    } catch (error) {
      console.error('调用sayHi失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 解析 InstructorCreated 事件
   * @param {Object} receipt - 交易回执
   * @returns {Array} 解析后的事件数组
   */
  parseInstructorCreatedEvents(receipt) {
    const events = [];
    
    for (const log of receipt.logs) {
      try {
        const parsedLog = this.contract.interface.parseLog(log);
        if (parsedLog.name === 'InstructorCreated') {
          events.push({
            name: 'InstructorCreated',
            args: {
              id: parsedLog.args.id.toString(),
              name: parsedLog.args.name,
              age: parsedLog.args.age.toString()
            }
          });
        }
      } catch (parseError) {
        console.log('解析事件失败:', parseError);
      }
    }
    
    return events;
  }

  /**
   * 监听 InstructorCreated 事件
   * @param {Function} callback - 事件回调函数
   */
  onInstructorCreated(callback) {
    this.contract.on('InstructorCreated', (id, name, age, event) => {
      callback({
        id: id.toString(),
        name,
        age: age.toString(),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash
      });
    });
  }

  /**
   * 停止监听事件
   */
  removeAllListeners() {
    this.contract.removeAllListeners('InstructorCreated');
  }
}

/**
 * 创建 InfoContractHelper 实例的工厂函数
 * @param {Object} signer - ethers.js signer 对象
 * @returns {InfoContractHelper} InfoContractHelper 实例
 */
export function createInfoContractHelper(signer) {
  return new InfoContractHelper(signer);
}

/**
 * 使用示例
 */
export const USAGE_EXAMPLES = {
  // 基本使用
  basic: `
// 1. 创建 helper 实例
const helper = createInfoContractHelper(signer);

// 2. 创建讲师
const result = await helper.createInstructor('张三', 30);
if (result.success) {
  console.log('创建成功:', result.events);
} else {
  console.error('创建失败:', result.error);
}

// 3. 查询讲师
const instructor = await helper.getInstructorById(1);
if (instructor.success) {
  console.log('讲师信息:', instructor.data);
}
  `,
  
  // 事件监听
  eventListening: `
// 监听新讲师创建事件
helper.onInstructorCreated((event) => {
  console.log('新讲师创建:', event);
});

// 停止监听
helper.removeAllListeners();
  `,
  
  // 在 React 组件中使用
  reactUsage: `
import { createInfoContractHelper } from './utils/InfoContractHelper';

function MyComponent() {
  const [helper, setHelper] = useState(null);
  
  useEffect(() => {
    if (signer) {
      setHelper(createInfoContractHelper(signer));
    }
  }, [signer]);
  
  const handleCreateInstructor = async () => {
    if (helper) {
      const result = await helper.createInstructor(name, age);
      // 处理结果
    }
  };
  
  return (
    // JSX 内容
  );
}
  `
};

export default InfoContractHelper;