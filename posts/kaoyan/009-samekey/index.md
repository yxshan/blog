---
title: 找公共元素
date: 2026-07-23
tags:
  - 中等
  - 线性表
  - 顺序表
  - 公共元素
difficulty: 中等
leetcode:
updated: 2026-07-23
draft: false
---
# 找公共元素

讲解视频：[找公共元素](https://www.bilibili.com/video/BV1vwM3zFEhj?spm_id_from=333.788.videopod.sections&vd_source=5c0bcfe1efdcec850abdf100b7a15a09&p=10)

#中等 #线性表 #顺序表 #公共元素

## 题目信息

> 给定三个序列A，B，C，长度均为n，且均为无重复元素的递增元素，请设计一个时间尽可能高效的算法，逐行输出同时存在于这三个序列中的所有元素。

## 算法思路

使用三个指针从小到大遍历数组，当三个指针指向的元素相等时，输出并向前推进指针，否则仅移动小于最大元素的指针，直到某个指针移出数组范围，即可停止。

## 代码实现

```cpp
void samekey(int A[], int B[], int C[], int n) {
	int i = 0, j = 0, k = 0;
	while (i < n && j < n && k < n) {
		if (A[i] == B[j] && B[j] == C[k]) {
			printf("%d\n", A[i]);
			i++;
			j++;
			k++;
		} else {
			int maxNum = A[i];
            if (B[j] > maxNum) maxNum = B[j];
            if (C[k] > maxNum) maxNum = C[k];
            
			if (A[i] < maxNum) i++;
			if (B[j] < maxNum) j++;
			if (C[k] < maxNum) k++;
		}
	}
}
```

## 复杂度分析

- **时间复杂度：`O(n)`**  
    在每一轮循环中，至少有一个指针会向后移动一步（当找到公共元素时，三个指针同时移动）。三个指针总共最多移动 `3n` 次，因此循环执行的次数与 `n` 呈线性关系。 
- **空间复杂度：`O(1)`**  
	算法只使用了 `i`、`j`、`k`、`maxNum` 等几个整型辅助变量，没有使用额外数组或哈希表等辅助存储结构，空间复杂度为常数级。