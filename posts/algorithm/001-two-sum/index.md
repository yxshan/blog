---
title: 两数之和
date: 2026-07-01
tags: [简单, 哈希表, 数组]
leetcode: https://leetcode.cn/problems/two-sum/
difficulty: 简单
---

# [1] 两数之和

## 题目信息

[题目链接](https://leetcode.cn/problems/two-sum/)

#简单 #哈希表 #数组

> 给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。
>
> 数据范围：2 <= nums.length <= 10^4
> 要求：时间复杂度 O(n)，空间复杂度 O(n)

## 解题思路

### 方法一：哈希表

1. **核心思想**：遍历数组，用哈希表存储已访问元素的值和下标。
   - 要点1：检查 target - nums[i] 是否在表中
   - 要点2：若存在则返回 [map.get(target - nums[i]), i]

2. **步骤图解**：
   ```
   遍历 i=0..n-1
      -> 计算 complement = target - nums[i]
      -> 查询哈希表
         - 存在 -> 返回结果
         - 不存在 -> 将 (nums[i], i) 存入哈希表
   ```

3. **关键点**：
   - 哈希表查询 O(1) 是性能关键
   - 一次遍历完成，避免二次循环

4. **边界处理**：
   - 数组长度为2的最小情况 → 直接返回两个下标
   - 存在多组解时只需返回第一组

## 代码实现

### 方法一

```c
/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // 假设哈希表已实现
    int* result = (int*)malloc(2 * sizeof(int));
    // ... 哈希表操作
    return result;
}
```

时间复杂度：O(n)
空间复杂度：O(n)

## 易错点

| 序号 | 易错点 | 正确做法 |
|------|--------|----------|
| 1    | 忘记处理返回数组内存分配 | 需使用 malloc 分配，并设置 returnSize |
| 2    | 哈希表未处理冲突 | 使用链地址法或开放寻址法 |

## 总结

- 核心思想：空间换时间，用哈希表将查找时间从 O(n) 降为 O(1)
- 方法对比：暴力法 O(n^2)  vs  哈希表法 O(n)
- 题目独立，不跨题总结
