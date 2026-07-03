---
title: 反转链表（BM1/BM2/BM3）
date: 2026-07-03
tags: [简单, 中等, 链表, 反转, 区间]
difficulty: 中等
---


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

| 序号 | 易错点 | 正确做法 |
|------|--------|----------|
| 1 | 头插法循环次数写成 `n-m+1` | 头插法只需 `n-m` 次（区间首节点不动，其余 n-m 个节点头插） |
| 2 | 头插法操作顺序颠倒 | 严格按照：摘(tmp=cur->next) → 跳过(cur->next=tmp->next) → 接前(tmp->next=pre->next) → 接后(pre->next=tmp) |
| 3 | 忘记虚拟头节点处理 m=1 | m=1 时 pre 需要指向 head 之前的节点，虚拟头节点统一处理 |
| 4 | 区间反转后忘记重新连接 | 直接反转法必须 `start->next=pre` 和 `end->next=cur` 两步连接 |

## 总结

- **直接反转法**：找前驱 → 三指针反转区间 → 重新连接首尾，逻辑与 BM1 相同
- **头插法（推荐）**：`cur` 不动，逐个摘 `cur->next` 头插到 `pre` 后，循环 n-m 次

# 链表中的节点每k个一组翻转

[BM3 链表中的节点每k个一组翻转](https://www.nowcoder.com/practice/b49c3dc907814e9bbfa8437c251b028e?tpId=295&tqId=722&sourceUrl=%2Fexam%2Foj%3FquestionJobId%3D166%26subTabName%3Donline_coding_page)

#中等 #链表 #反转  #区间

## 题目信息

> 将给出的链表中的节点每 k 个一组翻转，返回翻转后的链表  
> 如果链表中的节点数不是 k 的倍数，将最后剩下的节点保持原样  
> 你不能更改节点中的值，只能更改节点本身。
> 
> 数据范围：  0≤n≤2000， 1≤k≤2000，链表中每个元素都满足 0≤val≤1000  
> 要求空间复杂度 O(1)，时间复杂度 O(n)
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

时间复杂度：O(n)
空间复杂度：O(1)
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

| 序号 | 易错点 | 正确做法 |
|------|--------|----------|
| 1 | `groups = len/k + 1` 多算一组 | `groups = len/k`，整除自动排除不足 k 个的尾巴 |
| 2 | 反转后 `pre` 更新为 `prev` | ★ `pre` 应更新为 `groupStart`（组尾），而非 `prev`（组头） |
| 3 | 忘记 `groupStart->next = cur` | 反转后组尾必须连接下一组首，否则断链 |
| 4 | 递归中 `head->next` 连接错误 | ★ `head` 是组尾，`head->next = reverseKGroup(cur, k)`，不是 `prev->next` |
| 5 | 递归忘记先检查剩余节点数 | 必须检查 `count < k` 直接返回，否则会越界 |

## 总结

- **模拟法**：算长度定组数 → 逐组三指针反转 k 个 → `groupStart` 连接前后，空间 O(1)
- **递归法**：检查→反转前 k 个→`head->next` 递归连接，代码简洁但空间 O(n/k)
- **与 BM1/BM2 关系**：BM1 反转整个链表（k=n），BM2 反转一个区间，BM3 是多个定长区间的组合
