---
title: 反转链表
date: 2026-07-01
tags:
  - 简单
  - 链表
  - 反转
difficulty: 简单
leetcode: https://www.nowcoder.com/practice/75e878df47f24fdc9dc3e400ec6058ca?tpId=295&tqId=23286&sourceUrl=%2Fexam%2Foj%3FquestionJobId%3D166%26subTabName%3Donline_coding_page
updated: 2026-07-03
draft: false
---
# 反转链表

## 题目信息

[BM1 反转链表](https://www.nowcoder.com/practice/75e878df47f24fdc9dc3e400ec6058ca?tpId=295&tqId=23286&sourceUrl=%2Fexam%2Foj%3FquestionJobId%3D166%26subTabName%3Donline_coding_page)

#简单 #链表 #反转

> 给定一个单链表的头结点pHead(该头节点是有值的，比如在下图，它的val是1)，长度为n，反转该链表后，返回新链表的表头。
> 
> 数据范围： 0≤n≤1000
> 要求：空间复杂度 O(1)，时间复杂度 O(n) 。

## 解题思路

### 三指针迭代法（标准解法）

1. **核心思想**：遍历原链表，逐个改变指针方向
   - 用 `pre` 指向已反转部分的头（初始为 NULL）
   - 用 `cur` 指向当前处理的节点（初始为 head）
   - 用 `tmp` 暂存 `cur->next`，防止断链

2. **步骤图解**：
   ```
   原始：head → 1 → 2 → 3 → NULL
                         pre=NULL  cur=1
   第一步：tmp=2, 1→NULL, pre=1, cur=2
   第二步：tmp=3, 2→1, pre=2, cur=3
   第三步：tmp=NULL, 3→2, pre=3, cur=NULL
   结束：return pre → 3 → 2 → 1 → NULL
   ```

3. **关键点**：
   - 必须先保存 `cur->next`，否则转向后丢失后续节点
   - 返回的是 `pre`（反转后的新头），不是 `cur`（此时为 NULL）

4. **边界处理**：
   - 链表为空：直接返回 NULL
   - 单节点链表：循环不执行，`pre` 指向唯一节点，正确

### 递归法（理解用）

递归到尾节点后逐层反转。空间复杂度 O(n)（递归栈），不满足题目 O(1) 要求，仅作理解。

## 代码实现

```c
/**
* struct ListNode {
* int val;
* struct ListNode *next;
* };
*/

struct ListNode* ReverseList(struct ListNode* head) {
	// 空链表直接返回
	if (head == NULL) {
		return NULL;
	}

	struct ListNode* pre = NULL;   // 已反转部分的头节点
	struct ListNode* cur = head;   // 当前处理的节点
	
	while (cur != NULL) {
		struct ListNode* tmp = cur->next;  // ★ 先暂存后继，防止断链
		cur->next = pre;                   // 反转指针方向
		pre = cur;                         // pre 前移
		cur = tmp;                         // cur 前移
	}
	
	return pre;  // pre 即为新链表的头（cur 此时为 NULL）
}
```

时间复杂度：O(n)
空间复杂度：O(1)

## 易错点

| 序号 | 易错点 | 正确做法 |
|------|--------|----------|
| 1 | 返回 `cur` 而非 `pre` | 循环结束时 `cur == NULL`，`pre` 才是新头 |
| 2 | 忘记先保存 `cur->next` | 先 `tmp = cur->next`，再 `cur->next = pre`，顺序不能反 |
| 3 | 不处理空链表 | 开头判空 `if (head == NULL) return NULL` |

## 总结

- **核心**：三指针 `pre/cur/tmp` 逐个反转指针方向，返回 `pre`
- **关键**：先暂存后继再转向，避免断链