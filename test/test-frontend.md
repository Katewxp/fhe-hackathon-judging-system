# 前端项目添加功能测试指南

## 问题分析

用户反馈在organize页面点击"manage hackathon"后点击"projects"没有看到添加项目的功能。

## 正确的操作流程

1. **访问organize页面**: http://localhost:3000/organize
2. **连接钱包**: 确保钱包已连接
3. **选择黑客松**: 在Dashboard或Hackathons标签中点击"Manage Hackathon"按钮
4. **切换到Projects标签**: 点击顶部的"Projects"标签
5. **查看项目添加表单**: 应该能看到项目添加表单

## 可能的问题

### 1. 没有选择黑客松
- 如果没有选择黑客松，会显示"Select a Hackathon"的提示
- 需要先点击"Manage Hackathon"按钮选择黑客松

### 2. 黑客松状态问题
- 只有活跃的黑客松才能添加项目
- 已结束或已完成的黑客松可能不允许添加项目

### 3. 权限问题
- 只有黑客松的组织者才能添加项目
- 需要确保当前钱包地址是黑客松的组织者

## 调试步骤

1. 检查浏览器控制台是否有错误
2. 确认钱包已连接
3. 确认选择了正确的黑客松
4. 检查黑客松状态是否允许添加项目

## 代码位置

项目添加功能在以下位置：
- 文件: `frontend/src/app/organize/page.tsx`
- 行数: 726-852 (projects标签内容)
- 函数: `addProject()` (行282-348)
