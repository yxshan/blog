---
title: 查找-交换-插入
date: 2026-07-23
tags:
  - 中等
  - 线性表
  - 顺序表
  - 查找
  - 插入
difficulty: 中等
leetcode:
updated: 2026-07-23
draft: false
---
# 查找-交换-插入

讲解视频：[查找-交换-插入](https://www.bilibili.com/video/BV1vwM3zFEhj?spm_id_from=333.788.videopod.sections&vd_source=5c0bcfe1efdcec850abdf100b7a15a09&p=9)

#中等 #线性表 #顺序表 #查找 #插入 

## 题目信息

> 线性表中的元素递增有序且按顺序存储于计算机中，要求设计一个算法完成用最少时间在表中查找数值为x的元素，若找到，则将其与后继元素交换位置，若找不到，则将其插入表中并使表中元素仍然递增有序。

## 算法思路

用最少时间在表中查找数值为x的元素，使用折半查找。

## 代码实现

```cpp
void SearchExchangeInsert(ElemType A[], int n, ElemType x) {
    int low = 0, high = n - 1, mid;
    
    // 折半查找
    while (low <= high) {
        mid = (low + high) / 2;
        if (A[mid] == x)
            break;
        else if (A[mid] < x)
            low = mid + 1;
        else
            high = mid - 1;
    }
    
    // 情况1：查找成功 → 与后继交换（若非最后一个元素）
    if (low <= high) {                     // 查找成功
        if (mid != n - 1) {                // 不是最后一个元素
            ElemType temp = A[mid];
            A[mid] = A[mid + 1];
            A[mid + 1] = temp;
        }
    } 
    // 情况2：查找失败 → 插入元素
    else {                                 // low > high，查找失败
        // 插入位置为 high + 1
        for (int i = n - 1; i > high; i--) {
            A[i + 1] = A[i];               // 元素后移
        }
        A[high + 1] = x;                   // 插入x
    }
}
```

## 复杂度分析

- **时间复杂度**：折半查找为 `O(log n)`，插入时元素移动为 `O(n)`，整体为 **`O(n)`**。
- **空间复杂度**：仅使用了常数个辅助变量，**`O(1)`**。