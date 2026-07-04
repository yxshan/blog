---
title: 链表中的节点每k个一组翻转
date: 2026-07-01
tags:
  - 中等
  - 链表
  - 反转
  - 区间
difficulty: 简单
leetcode: https://www.nowcoder.com/practice/b49c3dc907814e9bbfa8437c251b028e?tpId=295&tqId=722&sourceUrl=%2Fexam%2Foj%3FquestionJobId%3D166%26subTabName%3Donline_coding_page
updated: 2026-07-04
draft: false
---
# 链表中的节点每k个一组翻转

[BM3 链表中的节点每k个一组翻转](https://www.nowcoder.com/practice/b49c3dc907814e9bbfa8437c251b028e?tpId=295&tqId=722&sourceUrl=%2Fexam%2Foj%3FquestionJobId%3D166%26subTabName%3Donline_coding_page)

#中等 #链表 #反转  #区间

## 题目信息

> 将给出的链表中的节点每 k 个一组翻转，返回翻转后的链表  
> 如果链表中的节点数不是 k 的倍数，将最后剩下的节点保持原样  
> 你不能更改节点中的值，只能更改节点本身。
> 
> 数据范围：  0≤n≤2000， 1≤k≤2000，链表中每个元素都满足 0≤val≤1000  
> 要求空间复杂度 $O(1)$，时间复杂度 $O(n)$
> 
> 例如：
> 给定的链表是 1→2→3→4→5
> 对于 k=2k=2 , 你应该返回 2→1→4→3→5
> 对于 k=3k=3 , 你应该返回 3→2→1→4→5

## 解题思路

### 模拟法

1. **核心思想**：先计算链表总长度确定要反转几组（`groups = len / k`），然后逐组进行 k 个节点的反转，关键是用 `groupStart` 记住每组反转后的组尾，用于连接下一组
   - 外层循环控制组数，内层循环反转每组 k 个节点
   - 每反转完一组，连接 `pre→组头` 和 `组尾→下一组首`

2. **步骤图解**（1→2→3→4→5, k=2）：
   ```
   初始：dummy→1→2→3→4→5  pre=&dummy, cur=1
   第1组(g=0)：
     反转[1,2]：prev=2→1, cur=3
     连接：groupStart(1)→3, pre→2, pre更新为1
     结果：dummy→2→1→3→4→5
   第2组(g=1)：
     反转[3,4]：prev=4→3, cur=5
     连接：groupStart(3)→5, pre(1)→4, pre更新为3
     结果：dummy→2→1→4→3→5
   结束：return 2→1→4→3→5
   ```

3. **关键点**：
   - `groups = len / k` 确定循环次数，剩余不足 k 个的节点保持不动
   - `groupStart` 是反转前的组首、反转后的组尾，用于 `groupStart->next = cur` 连接下一组
   - 反转完一组后 `pre` 更新为 `groupStart`（当前组尾），为下一组做准备

4. **边界处理**：
   - k ≤ 1 或链表为空：直接返回
   - k 大于链表长度：`groups = 0`，不反转，直接返回
   - 最后不足 k 个：`groups` 已排除，不进入反转循环

### 递归法

1. **核心思想**：递归到子问题——先检查是否有 k 个节点，有则反转前 k 个，然后递归处理剩余链表
   - 反转后 `head` 变成组尾，`head->next` 指向递归结果

2. **步骤图解**（1→2→3→4→5, k=2）：
   ```
   reverseKGroup(1→2→3→4→5)：
     检查有≥2个 ✓，反转前2个：prev=2→1, cur=3
     head(1)->next = reverseKGroup(3→4→5)
                     检查有≥2个 ✓，反转前2个：prev=4→3, cur=5
                     head(3)->next = reverseKGroup(5)
                                     检查只有1个 < k，return 5
                     返回 4→3→5
     返回 2→1→4→3→5
   ```

3. **关键点**：
   - 反转前必须检查剩余节点数是否 ≥ k，不够直接返回 head
   - 反转后 `head` 是组尾，`head->next = reverseKGroup(cur, k)` 连接递归结果
   - 空间复杂度 O(n/k)（递归栈深度），不满足 O(1) 但代码简洁

## 代码实现

### 模拟法

```c
struct ListNode* reverseKGroup(struct ListNode* head, int k) {
    // 边界：空链表或 k≤1 无需反转
    if (head == NULL || k <= 1) {
        return head;
    }
    
    // ★ 先计算链表长度，确定需要反转的组数
    struct ListNode* p = head;
    int len = 0;
    while (p != NULL) {
        len++;
        p = p->next;
    }
    int groups = len / k;  // ★ 整除，不足 k 个的剩余节点不动
    
    // 虚拟头节点统一处理
    struct ListNode dummy;
    dummy.next = head;
    struct ListNode* pre = &dummy;  // pre 指向当前组的前驱
    struct ListNode* cur = head;    // cur 指向当前组首节点
    
    // ★ 外层循环：逐组反转
    for (int g = 0; g < groups; g++) {
        struct ListNode* groupStart = cur;  // ★ 记住组首（反转后变成组尾）
        
        // 内层循环：三指针反转 k 个节点（与 BM1 相同逻辑）
        struct ListNode* prev = NULL;
        for (int i = 0; i < k; i++) {
            struct ListNode* next = cur->next;  // 暂存后继
            cur->next = prev;                   // 反转指向
            prev = cur;
            cur = next;
        }
        // 此时：prev=组头，cur=下一组首节点，groupStart=组尾
        
        // ★ 连接前后组
        groupStart->next = cur;   // 组尾 → 下一组首
        pre->next = prev;         // 前驱 → 组头
        pre = groupStart;         // ★ pre 移到当前组尾，为下一组做准备
    }
    
    return dummy.next;
}
```

时间复杂度：$O(n)$
空间复杂度：$O(1)$
### 递归法

```c
struct ListNode* reverseKGroup(struct ListNode* head, int k) {
    // 边界：空链表或 k≤1 直接返回
    if (head == NULL || k <= 1) return head;
    
    // ★ 先检查剩余节点是否足够 k 个，不够则不反转
    struct ListNode* check = head;
    int count = 0;
    while (check != NULL && count < k) {
        check = check->next;
        count++;
    }
    if (count < k) return head;  // 不足 k 个，保持原样
    
    // 三指针反转前 k 个节点（与 BM1 相同逻辑）
    struct ListNode* prev = NULL;
    struct ListNode* cur = head;
    for (int i = 0; i < k; i++) {
        struct ListNode* next = cur->next;  // 暂存后继
        cur->next = prev;                   // 反转指向
        prev = cur;
        cur = next;
    }
    // 此时：prev=组头，cur=剩余链表首节点，head=组尾
    
    // ★ head 变成组尾，递归连接后续结果
    head->next = reverseKGroup(cur, k);
    
    return prev;  // 返回组头
}
```
## 易错点

| 序号  | 易错点                         | 正确做法                                                              |
| --- | --------------------------- | ----------------------------------------------------------------- |
| 1   | `groups = len/k + 1` 多算一组   | `groups = len/k`，整除自动排除不足 k 个的尾巴                                  |
| 2   | 反转后 `pre` 更新为 `prev`        | ★ `pre` 应更新为 `groupStart`（组尾），而非 `prev`（组头）                       |
| 3   | 忘记 `groupStart->next = cur` | 反转后组尾必须连接下一组首，否则断链                                                |
| 4   | 递归中 `head->next` 连接错误       | ★ `head` 是组尾，`head->next = reverseKGroup(cur, k)`，不是 `prev->next` |
| 5   | 递归忘记先检查剩余节点数                | 必须检查 `count < k` 直接返回，否则会越界                                       |

## 总结

- **模拟法**：算长度定组数 → 逐组三指针反转 k 个 → `groupStart` 连接前后，空间 O(1)
- **递归法**：检查→反转前 k 个→`head->next` 递归连接，代码简洁但空间 O(n/k)
- **与 BM1/BM2 关系**：BM1 反转整个链表（k=n），BM2 反转一个区间，BM3 是多个定长区间的组合
