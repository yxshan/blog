const t=`---
title: 删除s-t的值
date: 2026-07-09
tags:
  - 简单
  - 线性表
  - 顺序表
  - 删除
difficulty: 简单
leetcode:
updated: 2026-07-09
draft: false
---
# 删除s-t的值

讲解视频：[删除s-t的值](https://www.bilibili.com/video/BV1vwM3zFEhj?spm_id_from=333.788.videopod.sections&vd_source=5c0bcfe1efdcec850abdf100b7a15a09)

#简单 #线性表 #顺序表 #删除 

## 题目信息

> 从顺序表中删除其值在给定值s和t之间（包含s和t，要求$s<t$）的所有元素，若s或t不合理或顺序表为空，则显示出错信息并退出运行。

## 解题思路

从前向后扫描顺序表L，用k记录值在s和t之间的元素个数（初始时k=0）。
对于当前扫描的元素，若其值不在s和t之间，则前移k个位置；否则执行k++。
每个不在s和t之间的元素仅移动一次。

## 代码实现

\`\`\`c
bool Del_s_t(SqList &L, ElemType s, ElemType t) {
	int i, k = 0;
	if (L.length == 0 || s>= t) return false;
	for (i = 0; i < L.length; i++) {
		if (L.data[i] >= s && L.data[i] <= t) {
			k++;
		} else {
			L.data[i - k] = L.data[i];
		}
	}
	L.length -= k;
	return true;
}
\`\`\``;export{t as default};
