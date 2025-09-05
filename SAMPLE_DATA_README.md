# 示例数据脚本使用说明

## 概述

`add-sample-projects.js` 脚本用于为现有的黑客松添加示例项目数据，让系统更加完整和可演示。

## 当前状态

⚠️ **注意**: 合约的`registerProject`函数存在技术问题，导致项目注册失败。我们已经实现了以下解决方案：

1. **前端本地存储**: 当合约调用失败时，项目会自动保存到浏览器本地存储
2. **模拟数据**: 提供示例项目数据用于演示
3. **无缝体验**: 用户仍然可以正常使用项目添加功能

## 功能

- 为黑客松2添加6个示例项目（其他黑客松已结束或时间设置有问题）
- 涵盖不同领域的项目：DeFi、AI、医疗、供应链等
- 自动处理交易确认和错误处理

## 使用方法

### 1. 设置环境变量

```bash
export PRIVATE_KEY="your_private_key_here"
```

### 2. 安装依赖

```bash
npm install ethers
```

### 3. 运行脚本

```bash
node add-sample-projects.js
```

## 示例项目

### 黑客松 2 (唯一可用的黑客松)
- **Healthcare Data Privacy Protocol** - 医疗数据隐私协议
- **Supply Chain Transparency System** - 供应链透明度系统
- **Decentralized Identity Solution** - 去中心化身份解决方案
- **DeFi Yield Optimizer** - 自动寻找最高收益的DeFi协议
- **NFT Marketplace with Privacy** - 使用零知识证明的隐私NFT市场
- **Cross-Chain Bridge Protocol** - 跨链资产转移协议

## 使用方法

### 方法1: 前端界面添加项目（推荐）

1. 访问 http://localhost:3000/organize
2. 连接钱包
3. 选择"Zama Developer Program"黑客松
4. 切换到"Projects"标签
5. 填写项目信息并提交
6. 项目会自动保存到本地存储（即使合约调用失败）

### 方法2: 运行示例数据脚本

```bash
export PRIVATE_KEY="your_private_key_here"
node add-sample-projects.js
```

**注意**: 脚本可能仍然失败，但前端界面已经可以正常工作。

## 注意事项

- 确保钱包有足够的ETH支付gas费用
- 脚本会在交易之间等待2秒，避免网络拥堵
- 如果某个项目添加失败，脚本会继续处理其他项目
- 所有交易都会在Sepolia测试网上执行

## 安全提醒

- 不要在生产环境中使用此脚本
- 确保私钥安全，不要在代码中硬编码
- 建议使用测试网私钥，不要使用主网私钥
