---
title: "2014真题：二叉树的带权路径长度"
date: 2026-08-16
tags:
  - 中等
  - 二叉树
  - 递归
  - 树的遍历
  - 考研真题
difficulty: 中等
leetcode:
updated: 2026-08-16
draft: false
---
# 2014真题：二叉树的带权路径长度

#中等 #二叉树 #递归 #树的遍历 #考研真题

## 题目信息

![019-wpl](./019-wpl.png)

二叉树的带权路径长度（WPL）是所有叶结点的带权路径长度之和。给定一棵采用二叉链表存储的二叉树，叶结点的 `weight` 保存非负权值，要求计算整棵树的 WPL。

根结点到自身的路径长度为 `0`。若根结点本身就是叶结点，它的贡献为 `weight * 0 = 0`。

## 示例

题目未给出独立的输入输出示例，图中给出了结点结构。计算时只累加叶结点的 `weight * depth`。

## 直接解：递归遍历并累加

从根结点出发，同时记录当前深度。遇到叶结点时累加 `weight * depth`；遇到非叶结点时递归处理左右子树。

这种方法每个结点只访问一次，是最直接的基线解。它使用递归栈保存当前路径，空间与树高有关。

```c
int wplDirect(BiTNode *root, int depth) {
    if (root == NULL) {
        return 0;
    }
    if (root->left == NULL && root->right == NULL) {
        return root->weight * depth;
    }
    return wplDirect(root->left, depth + 1)
        + wplDirect(root->right, depth + 1);
}
```

## 优化解：显式栈遍历

不使用递归，改用栈保存“结点 + 深度”。该方法的渐进时间复杂度不变，但可以避免递归层数过深；如果题目只要求时间和空间的渐进复杂度，递归写法更简洁。

## 示例推演

从根结点开始，根的深度为 `0`。向下一层时深度加 `1`，继续向下时逐层增加。每到一个叶结点，就把它的权值乘以当前深度加入答案，遍历结束后的总和就是 WPL。

## 代码实现

```c
typedef struct BiTNode {
    struct BiTNode *left;
    int weight;
    struct BiTNode *right;
} BiTNode;

int wplRecursive(BiTNode *root, int depth) {
    if (root == NULL) {
        return 0;
    }

    if (root->left == NULL && root->right == NULL) {
        return root->weight * depth;
    }

    return wplRecursive(root->left, depth + 1)
        + wplRecursive(root->right, depth + 1);
}

int getWPL(BiTNode *root) {
    return wplRecursive(root, 0);
}
```

## 正确性说明

递归调用处理一棵子树时，传入的 `depth` 正好是该子树根结点的深度。遇到叶结点时返回它的权值与深度之积；非叶结点返回左右子树贡献之和。因此根调用返回所有叶结点贡献的总和，即 WPL。

## 复杂度分析

- **时间复杂度：** `O(n)`，每个结点访问一次。
- **空间复杂度：** `O(h)`，递归栈最多保存树高层数。

## 易错点

1. 只有叶结点的 `weight` 参与计算。
2. 根结点深度从 `0` 开始，不能从 `1` 开始。
3. 不能只累加叶权值，还必须乘以对应路径长度。
