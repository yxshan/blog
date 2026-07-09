---
title: 元素逆置
date: 2026-07-06
tags:
  - 简单
  - 线性表
  - 顺序表
  - 反转
difficulty: 简单
leetcode:
updated: 2026-07-06
draft: false
---
# 元素逆置

讲解视频：[元素逆置](https://www.bilibili.com/video/BV1vwM3zFEhj?spm_id_from=333.788.videopod.sections&vd_source=5c0bcfe1efdcec850abdf100b7a15a09&p=4)

#简单 #线性表 #顺序表 #反转 

## 题目信息

> 设计一个高效算法，将顺序表L到所有元素逆置，要求算法的空间复杂度为$O(1)$

## 解题思路

1. **双指针法（首尾交换）**  
   - 设置两个指针（或下标），分别指向顺序表的第一个元素和最后一个元素。

2. **循环交换元素**  
   - 交换两个指针所指的元素，然后左指针右移一位，右指针左移一位。

3. **循环终止条件**  
   - 当左指针 >= 右指针时，说明所有元素都已交换完毕，逆置完成。

4. **空间复杂度保证**  
   - 整个过程中只使用了固定的几个辅助变量（如指针、临时交换变量），不随表长增加而额外申请空间，因此空间复杂度为 O(1)。

5. **时间复杂度**  
   - 交换次数为元素个数的一半，即约 n/2 次，时间复杂度为 O(n)。

## 代码实现

```c
void Reverse(SqList &L) {
	ElemType temp;
	for (int i = 0; i < L.length / 2; i++) {
		temp = L.data[i];
		L.data[i] = L.data[L.length - i - 1];
		L.data[L.length - i - 1] = temp;
	}
}
```

时间复杂度：$O(n)$
空间复杂度：$O(1)$

