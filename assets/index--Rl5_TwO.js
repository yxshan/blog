const n=`---
title: 2010真题
date: 2026-07-28
tags:
  - 中等
  - 线性表
  - 顺序表
  - 反转
difficulty: 中等
leetcode:
updated: 2026-07-28
draft: false
---
# 2010真题

讲解视频：[2010真题](https://www.bilibili.com/video/BV1vwM3zFEhj?spm_id_from=333.788.videopod.sections&vd_source=5c0bcfe1efdcec850abdf100b7a15a09&p=12)

#中等 #线性表 #顺序表 #反转 

## 题目信息

![题目信息](./010-converse.png)

## 算法思路

可将问题视为把数组$ab$转换为数组$ba$（$a$代表数组的前$p$个元素，$b$代表数组中余下的$n-p$个元素），先把$a$逆置得到$a^{-1}b$，再将$b$逆置得到$a^{-1}b^{-1}$，最后将整个$a^{-1}b^{-1}$逆置得到$(a^{-1}b^{-1})^{-1}=ba$。

## 代码实现

\`\`\`cpp
void Reverse(int R[], int from, int to) {
	int i, temp;
	for (i = 0; i < (to - from + 1) / 2); i++) {
		temp = R[from + i];
		R[from + i] = R[to - i];
		R[to - i] = temp;
	}
}

void Converse(int R[], int n, int p) {
	Reverse(R, 0, p - 1);
	Reverse(R, p, n - 1);
	Reverse(R, 0, n - 1);
}
\`\`\`

## 复杂度分析

- **时间复杂度：\`O(n)\`**  
- **空间复杂度：\`O(1)\`**  `;export{n as default};
