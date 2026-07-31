const n=`---
title: 表位置互换
date: 2026-07-23
tags:
  - 简单
  - 线性表
  - 顺序表
  - 反转
difficulty: 简单
leetcode:
updated: 2026-07-23
draft: false
---
# 表位置互换

讲解视频：[表位置互换](https://www.bilibili.com/video/BV1vwM3zFEhj?spm_id_from=333.788.videopod.sections&vd_source=5c0bcfe1efdcec850abdf100b7a15a09&p=8)

#简单 #线性表 #顺序表 #反转 

## 题目信息

> 已知在一维数组A\\[m+n\\]中依次存放两个线性表$(a_1,a_2,a_3,...,a_m)$和$(b_1,b_2,b_3,...,b_n)$。编写一个函数，将数组中两个顺序表的位置互换，即将$(b_1,b_2,b_3,...,b_n)$放在$(a_1,a_2,a_3,...,a_m)$的前面。

## 算法思想

1. 首先将数组A\\[m+n\\]中的全部元素原地逆置
2. 然后对前n个元素和后m个元素分别使用逆置算法

## 代码实现

\`\`\`cpp
void Reverse(ElemType A[], int left, int right, int arraySize) {
	if (left >= right || right >= arraySize) return;
	int mid = (left + right) / 2;
	for (int i = 0; i <= mid - left; i++) {
		ElemType temp = A[left + i];
		A[left + i] = A[right - i];
		A[right - i] = temp;
	}
}

void Exchange(Elemtype A[], int m, int n, int arraySize) {
	Reverse(A, 0, m + n - 1, arraySize);
	Reverse(A, 0, n - 1, arraySize);
	Reverse(A, n, m + n - 1, arraySize);
}
\`\`\`

## 复杂度分析

- **时间复杂度**：O(m+n)。每次逆置操作的时间复杂度都是线性的，三次操作的总时间与数组总长度成正比。
- **空间复杂度**：O(1)。算法只在\`Reverse\`函数中使用了常数个临时变量，实现了“原地”互换。`;export{n as default};
