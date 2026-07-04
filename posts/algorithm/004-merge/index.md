---
title: 合并
date: 2026-07-01
tags:
  - 简单
  - 链表
  - 合并
difficulty: 简单
leetcode: https://www.nowcoder.com/practice/d8b6b4358f774294a89de2a6ac4d9337?tpId=295&tqId=23267&sourceUrl=%2Fexam%2Foj%3FquestionJobId%3D166%26subTabName%3Donline_coding_page
updated: 2026-07-04
draft: true
---
# 合并两个排序的链表

[BM4 合并两个排序的链表](https://www.nowcoder.com/practice/d8b6b4358f774294a89de2a6ac4d9337?tpId=295&tqId=23267&sourceUrl=%2Fexam%2Foj%3FquestionJobId%3D166%26subTabName%3Donline_coding_page)

#简单 #链表 #合并

## 题目信息

> 输入两个递增的链表，单个链表的长度为n，合并这两个链表并使新链表中的节点仍然是递增排序的。  
> 数据范围： 0≤n≤1000，−1000≤节点值≤1000
> 要求：空间复杂度 $O(1)$，时间复杂度 $O(n)$

## 解题思路

1. 首先处理特殊情况，如果其中一个链表为空，则直接返回另一个链表，因为不需要合并操作。
2. 创建一个虚拟头节点`dummy`，在栈上分配内存并初始化其`next`指针为`NULL`，同时定义一个尾指针`tail`指向`dummy，用于追踪合并后链表的最后一个节点。
3. 使用`while`循环同时遍历两个链表，循环条件为两个链表当前节点都不为空，这样能确保在比较节点值时不会访问空指针。
4. 在循环体内比较两个链表当前节点的值，将值较小的节点连接到`tail`的`next`指针后面，然后将该链表的指针后移一位，最后将tail指针移动到新连接的节点上，保持tail始终指向合并链表的尾节点。
5. 当其中一个链表遍历完后退出循环，此时另一个链表可能还有剩余节点，直接将`tail`的`next`指针指向非空的剩余链表头部，因为剩余部分本身就是有序的，无需再逐个比较。
6. 最后返回`dummy.next`，即合并后链表的真正头节点，虚拟头节点`dummy`在栈上分配，函数返回后自动释放，不影响返回的链表结构。

## 代码实现

```c
struct ListNode* Merge(struct ListNode* pHead1, struct ListNode* pHead2) {
    // 处理特殊情况
    if (pHead1 == NULL) return pHead2;
    if (pHead2 == NULL) return pHead1;
    
    // 创建虚拟头节点（分配内存！）
    struct ListNode dummy;
    dummy.next = NULL;
    struct ListNode* tail = &dummy;  // tail指向当前合并链表的尾节点
    
    // 比较两个链表，合并
    while (pHead1 != NULL && pHead2 != NULL) {
        if (pHead1->val <= pHead2->val) {
            tail->next = pHead1;
            pHead1 = pHead1->next;
        } else {
            tail->next = pHead2;
            pHead2 = pHead2->next;
        }
        tail = tail->next;  // tail后移
    }
    
    // 连接剩余部分
    if (pHead1 != NULL) {
        tail->next = pHead1;
    } else {
        tail->next = pHead2;
    }
    
    return dummy.next;
}
```

时间复杂度： $O(n)$
空间复杂度： $O(1)$

## 易错点

| 序号  | 易错点                                                          | 正确做法                                                                                 |
| --- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| 1   | 未处理空链表情况，直接访问节点值导致崩溃                                         | 函数开头先判断：if (pHead1 == NULL) return pHead2; if (pHead2 == NULL) return pHead1;        |
| 2   | 声明虚拟头节点指针后未分配内存就直接使用（如struct ListNode* head; head->val = 0;） | 在栈上创建虚拟头节点：struct ListNode dummy; dummy.next = NULL; struct ListNode* tail = &dummy; |
| 3   | 循环条件使用\|\|而不是 &&，导致某个链表为空时仍访问其节点值                            | 使用 while (pHead1 != NULL && pHead2 != NULL)，确保两个节点都不为空时才比较                           |
| 4   | 比较节点值后只移动了链表指针，忘记将tail指针后移                                   | 每次连接节点后执行 tail = tail->next; 保持tail指向合并链表的尾节点                                        |
| 5   | 循环退出后直接返回，忘记连接剩余的链表节点                                        | 循环结束后判断哪个链表非空，执行 tail->next = (pHead1 != NULL) ? pHead1 : pHead2;                    |
| 6   | 返回时返回虚拟头节点本身（如 return &dummy;）而非真正的头节点                       | 返回 dummy.next，即合并后链表的第一个有效节点                                                         |
| 7   | 使用malloc创建虚拟头节点但忘记释放，导致内存泄漏                                  | 使用栈上分配（struct ListNode dummy;）无需手动释放，避免内存管理问题                                        |
| 8   | 当两个链表节点值相等时，未考虑合并的稳定性                                        | 使用 <= 判断，当值相等时优先取pHead1的节点，保证合并前后相同值节点的相对顺序不变                                        |
| 9   | 修改了原链表的头指针，导致后续无法正确遍历或释放                                     | 使用临时指针（如p1、p2）遍历原链表，保留原链表头节点指针用于后续可能的释放操作                                            |
## 总结

### 两者的本质区别

```c
// struct ListNode 是类型名（结构体类型）
struct ListNode {
    int val;
    struct ListNode* next;
};

// struct ListNode* 是指针类型（指向结构体的指针）
struct ListNode* ptr;  // ptr是一个指针变量
```

**简单来说**：
- `struct ListNode` → 结构体本身（数据实体）
- `struct ListNode*` → 指向结构体的指针（地址）

### 直观对比

```c
// 1. 声明变量
struct ListNode node1;        // 分配内存，存储一个节点
struct ListNode* node2;       // 分配4/8字节内存，存储地址

// 2. 访问成员
node1.val = 10;               // 用 . 访问
node2->val = 10;              // 用 -> 访问（指针）
(*node2).val = 10;            // 等价写法

// 3. 内存大小
sizeof(struct ListNode)       // 一般是8字节（4字节val + 4字节指针）
sizeof(struct ListNode*)      // 4字节（32位）或8字节（64位）
```

### 创建新节点的4种方法

#### 方法1：栈上创建（自动分配）

```c
struct ListNode node;         // 声明结构体变量
node.val = 5;
node.next = NULL;

// 如果函数返回，这个节点会被销毁！
// 适合临时使用，不能返回给调用者
```

#### 方法2：堆上创建（手动分配）⭐ 最常用

```c
// 标准写法
struct ListNode* node = (struct ListNode*)malloc(sizeof(struct ListNode));
if (node == NULL) {
    // 处理分配失败
    return NULL;
}
node->val = 5;
node->next = NULL;
```

#### 方法3：使用typedef简化（推荐）

```c
// 定义时使用typedef
typedef struct ListNode {
    int val;
    struct ListNode* next;
} ListNode;  // 现在ListNode就是类型名了

// 创建节点
ListNode* node = (ListNode*)malloc(sizeof(ListNode));
node->val = 5;
node->next = NULL;
```

#### 方法4：创建辅助函数

```c
// 创建新节点的辅助函数
struct ListNode* createNode(int val) {
    struct ListNode* node = (struct ListNode*)malloc(sizeof(struct ListNode));
    if (node == NULL) {
        return NULL;
    }
    node->val = val;
    node->next = NULL;
    return node;
}

// 使用
struct ListNode* node = createNode(5);
```

### 栈 vs 堆

| 特性 | 栈上创建 | 堆上创建 |
|------|---------|---------|
| 语法 | `struct ListNode node;` | `malloc(sizeof(...))` |
| 生命周期 | 函数结束时自动释放 | 需要手动`free()` |
| 速度 | 快 | 慢 |
| 大小限制 | 较小（通常几MB） | 较大（可用内存） |
| 返回给调用者 | ❌ 不可以 | ✅ 可以 |
