---
title: 删除最小值
date: 2026-07-06
tags:
  - 简单
  - 线性表
  - 顺序表
  - 删除
difficulty: 简单
leetcode:
updated: 2026-07-06
draft: false
---
# 删除最小值

讲解视频：[删除最小值](https://www.bilibili.com/video/BV1vwM3zFEhj/?p=3&spm_id_from=333.1007.top_right_bar_window_history.content.click&vd_source=5c0bcfe1efdcec850abdf100b7a15a09)

#简单 #线性表 #顺序表 #删除
## 题目信息

> 从顺序表中删除具有最小值的元素（假设唯一）并由函数返回被删元素的值。空出的位置由最后一个元素填补。若顺序表为空，则显示出错信息并退出运行。

## 解题思路

1. **检查顺序表是否为空**  
   - 若为空，则输出错误信息，并终止程序运行（或返回特殊标识）。

2. **遍历顺序表，找到最小值及其位置**  
   - 从第一个元素开始，依次比较，记录当前最小值及其下标（或指针）。

3. **用最后一个元素填补被删元素的位置**  
   - 将顺序表中最后一个元素的值赋给刚才找到的最小值所在位置。

4. **删除最后一个元素（表长减1）**  
   - 因为最后一个元素已被前移，所以逻辑上顺序表长度减少1。

5. **返回被删的最小值**  
   - 将步骤2中保存的最小值作为函数返回值返回。

## 代码实现

```c
bool Delete_min(SqList &L, int& value) {
	if(L.length == 0) return false;
	value = L.data[0];
	int pos = 0;
	for (int i = 1; i < L.length; i++) {
		if (L.data[i] < value) {
			value = data[i];
			pos = i;
		} 
	}
	L.data[pos] = L.data[L.Length - 1];
	L.length--;
	return true;
}
```

时间复杂度：$O(n)$
空间复杂度：$O(1)$

