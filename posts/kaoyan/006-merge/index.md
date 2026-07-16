---
title: 表合并
date: 2026-07-16
tags:
  - 简单
  - 线性表
  - 顺序表
  - 合并
difficulty: 简单
leetcode:
updated: 2026-07-16
draft: false
---
# 表合并

讲解视频：[表合并](https://www.bilibili.com/video/BV1vwM3zFEhj?spm_id_from=333.788.videopod.sections&vd_source=5c0bcfe1efdcec850abdf100b7a15a09&p=7)

#简单 #线性表 #顺序表 #合并 

## 题目信息

> 将两个有序顺序表合并为一个新的有序顺序表，并由函数返回结果顺序表。

## 算法思想

1. 首先，按顺序不断取下两个顺序表表头较小的节点存入新的顺序表中
2. 然后，看哪个表还有剩余，将剩下的部分加到新的顺序表后面

## 代码实现

```cpp
bool Merge(SeqList A, SeqList B, SeqList &C) {
	if (A.length + B.length > C.maxsize) return false;
	int i = 0, j = 0, k = 0;
	while (i < A.length && j < B.length) {
		if (A.data[i] <= B.data[j]) {
			C.data[k++] = A.data[i++];
		} else {
			C.data[k++] = B.data[j++];
		}
	}
	while (i < A.length) {
		C.data[k++] = A.data[i++];
	}
	while (j < B.length) {
		C.data[k++] = B.data[j++];
	}
	C.length = k;
	return true;
}
```

## 复杂度分析

- **时间复杂度**：`O(A.length + B.length)`（即 `O(n + m)`）。每个表中的每个元素均被访问一次并复制一次，比较次数也约为 `n + m` 次。
- **空间复杂度**：**`O(1)`**（不计 `C` 本身占用的空间）。算法仅使用了 `i, j, k` 三个辅助整型变量，并未申请额外数组空间。注意：虽然 `C` 需要存储结果，但该空间由调用者分配，不算入算法的额外辅助空间。