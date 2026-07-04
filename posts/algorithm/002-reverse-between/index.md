---
title: 链表内指定区间反转
date: 2026-07-01
tags:
  - 中等
  - 链表
  - 反转
  - 区间
difficulty: 中等
leetcode: https://www.nowcoder.com/practice/b58434e200a648c589ca2063f1faf58c?tpId=295&tqId=654&sourceUrl=%2Fexam%2Foj%3FquestionJobId%3D166%26subTabName%3Donline_coding_page
updated: 2026-07-04
draft: false
---
# 链表内指定区间反转

[BM2 链表内指定区间反转](https://www.nowcoder.com/practice/b58434e200a648c589ca2063f1faf58c?tpId=295&tqId=654&sourceUrl=%2Fexam%2Foj%3FquestionJobId%3D166%26subTabName%3Donline_coding_page)

#中等 #链表 #反转 #区间
## 题目信息

> 将一个节点数为 size 链表 m 位置到 n 位置之间的**区间**反转，要求时间复杂度 O(n)，空间复杂度 O(1)。  
> 例如：  
> 给出的链表为 1→2→3→4→5→NULL, m=2,n=4  
> 返回 1→4→3→2→5→NULL
>   
> 数据范围： 链表长度 0<size≤1000，0<m≤n≤size，链表中每个节点的值满足 ∣val∣≤1000
> 要求：时间复杂度 O(n) ，空间复杂度 O(n)
> 进阶：时间复杂度 O(n)，空间复杂度 O(1)

## 解题思路

### 直接反转法

1. 第一反应：暴力法 - 提取区间，反转，再插入
   问题：需要额外空间，且断链麻烦
2. 优化思路：原地反转
   关键点：
   - 找到反转区间的前驱节点
   - 记录区间首尾
   - 反转区间内指针方向
   - 重新连接
3. 边界条件：
   - m=n：直接返回
   - m=1：需要虚拟头节点
   - 链表为空或只有一个节点

### 头插法（推荐）

1. **核心思想**：不直接反转指针方向，而是把区间内每个节点逐个"拔出来"，插入到 `pre` 之后（即区间头部）
   - `pre` 固定指向反转区间的前驱节点
   - `cur` 固定指向反转区间的第一个节点（也是反转后的尾节点）
   - 每次把 `cur->next` 从链上摘下，头插到 `pre` 之后

2. **步骤图解**（m=2, n=4，1→2→3→4→5）：
   ```
   初始：dummy→1→2→3→4→5   pre=1, cur=2
   i=2：摘3，插入pre后：1→3→2→4→5
   i=3：摘4，插入pre后：1→4→3→2→5
   结束：return 1→4→3→2→5
   ```

3. **关键点**：
   - 循环次数 = `n - m`（不是 `n - m + 1`）
   - `cur` 始终不动，变的是它后面的节点一个个往前插
   - 三步操作顺序不能乱：`tmp=cur->next` → `cur->next=tmp->next` → `tmp->next=pre->next` → `pre->next=tmp`

## 代码实现

### 直接反转法

``` c
/**
* struct ListNode {
* int val;
* struct ListNode *next;
* };
*/

struct ListNode* reverseBetween(struct ListNode* head, int m, int n) {
    if (m == n || head == NULL || head->next == NULL) {
        return head;
    }

    // 使用虚拟头节点处理 m=1 的情况
    struct ListNode dummy;
    dummy.next = head;
    struct ListNode* prev = &dummy;
    
    // 找到 m 的前一个节点
    for (int i = 1; i < m; i++) {
        prev = prev->next;
    }
    
    // ★ 三指针：start(前驱) cur(区间首) end(区间尾)
    struct ListNode* start = prev;          // 反转区间的前一个节点（不动）
    struct ListNode* cur = prev->next;      // 反转区间的第一个节点
    struct ListNode* end = cur;             // ★ 记住区间尾，反转后用于连接后续
    struct ListNode* pre = NULL;
    
    // 反转从 m 到 n 的节点（与 BM1 反转链表完全相同的逻辑）
    int count = n - m + 1;                  // 区间长度
    while (count > 0 && cur != NULL) {
        struct ListNode* next = cur->next;  // 暂存后继
        cur->next = pre;                    // 反转指向
        pre = cur;
        cur = next;
        count--;
    }
    
    // ★ 重新连接：前驱→反转后头，反转后尾→剩余部分
    start->next = pre;      // 例：1 → 4（反转后头）
    end->next = cur;        // 例：2 → 5（剩余部分）
    
    return dummy.next;
}
```

时间复杂度：O(n)
空间复杂度：O(1)
### 头插法（推荐）

```c
/**
* struct ListNode {
* int val;
* struct ListNode *next;
* };
*/

struct ListNode* reverseBetween(struct ListNode* head, int m, int n) {
	if (m == n || head == NULL || head->next == NULL) {
        return head;
    }
    
    struct ListNode dummy;
    dummy.next = head;
    struct ListNode* pre = &dummy;
    
    for (int i = 1; i < m; i++) {
	    pre = pre->next;
    }
    
    struct ListNode* cur = pre->next;   // cur 固定指向区间首节点（反转后的尾）★不动
    
    // 循环 n-m 次，每次把 cur->next 摘下来头插到 pre 后
    for (int i = m; i < n; i++) {
	    struct ListNode* tmp = cur->next;    // ★ 摘下待头插的节点
	    cur->next = tmp->next;               // cur 跳过 tmp，连接后续
	    tmp->next = pre->next;               // tmp 指向当前区间首节点
	    pre->next = tmp;                     // pre 指向新的区间首节点
    }
    
    return dummy.next;
}
```

时间复杂度：O(n)
空间复杂度：O(1)
## 易错点

| 序号  | 易错点               | 正确做法                                                                                          |
| --- | ----------------- | --------------------------------------------------------------------------------------------- |
| 1   | 头插法循环次数写成 `n-m+1` | 头插法只需 `n-m` 次（区间首节点不动，其余 n-m 个节点头插）                                                           |
| 2   | 头插法操作顺序颠倒         | 严格按照：摘(tmp=cur->next) → 跳过(cur->next=tmp->next) → 接前(tmp->next=pre->next) → 接后(pre->next=tmp) |
| 3   | 忘记虚拟头节点处理 m=1     | m=1 时 pre 需要指向 head 之前的节点，虚拟头节点统一处理                                                           |
| 4   | 区间反转后忘记重新连接       | 直接反转法必须 `start->next=pre` 和 `end->next=cur` 两步连接                                              |

## 总结

- **直接反转法**：找前驱 → 三指针反转区间 → 重新连接首尾，逻辑与 BM1 相同
- **头插法（推荐）**：`cur` 不动，逐个摘 `cur->next` 头插到 `pre` 后，循环 n-m 次