---
title: 删除所有x
date: 2026-07-07
tags:
  - 简单
  - 线性表
  - 删除
difficulty: 简单
leetcode:
updated: 2026-07-07
draft: false
---
# 删除所有x

讲解视频：[删除所有x](https://www.bilibili.com/video/BV1vwM3zFEhj?spm_id_from=333.788.videopod.sections&vd_source=5c0bcfe1efdcec850abdf100b7a15a09&p=5)

#简单 #线性表 #删除

## 题目信息

> 对长度为n对顺序表L，编写一个时间复杂度为$O(n)$，空间复杂度为$O(1)$的算法，该算法删除顺序表中所有值为x的数据元素。

## 解题思路

### 解法1

用k记录顺序表L中不等于x的元素个数（需要保存的元素个数），扫描时将不等于x的元素移动到下标k的位置，并更新k值。扫描结束后修改L到长度。

### 解法2

用k记录顺序表L中等于x的元素个数，一边扫描L，一边统计k，并将不等于x的元素前移k个位置。扫描结束后修改L的长度。

## 代码实现

### 解法1

```c
void del_x(SqList &L, ElemType x) {
	int k = 0, i;
	for (i = 0; i < L.length; i++) {
		if (L.data[i] != x) {
			L.data[k] = L.data[i];
			k++;
		}
	}
	L.length = k;
}
```

时间复杂度：$O(n)$
空间复杂度：$O(1)$
## 解法2

```c
void del_x(SqList &L, ElemType x) {
	int k = 0, i = 0;
	while (i < L.length) {
		if (L.data[i] == x) {
			k++;
		} else {
			L.data[i - k] = L.data[i];
		}
		i++;
	}
	L.length = L.length - k;
}
```

时间复杂度：$O(n)$
空间复杂度：$O(1)$