---
title: "2022真题：顺序存储二叉树的二叉搜索树判定"
date: 2026-08-16
tags:
  - 二叉树
  - 二叉搜索树
  - 顺序存储
  - 中序遍历
  - 考研真题
difficulty: 中等
leetcode:
updated: 2026-08-16
draft: false
---
# 2022真题：顺序存储二叉树的二叉搜索树判定

#中等 #二叉树 #二叉搜索树 #顺序存储 #中序遍历 #考研真题

## 题目信息

![020-seq-bst](./020-seq-bst.png)

非空二叉树采用顺序存储。数组 `SqBiTNode` 保存结点值，数组下标按照完全二叉树规则计算孩子位置：左孩子为 `2*i+1`，右孩子为 `2*i+2`；`-1` 表示该位置没有结点，`ElemNum` 表示实际使用的数组长度。

请判断该存储结果表示的二叉树是否为二叉搜索树。本文按严格二叉搜索树处理：任意结点的左子树值都小于该结点，右子树值都大于该结点。

## 直接解：中序遍历后检查有序性

二叉搜索树的中序遍历结果必须严格递增。先把顺序存储的二叉树进行中序遍历，写入辅助数组，再检查相邻元素是否严格递增。

```c
#define MAX_SIZE 1000

typedef struct {
    int SqBiTNode[MAX_SIZE];
    int ElemNum;
} SqBiTree;

void inorder(const SqBiTree *tree, int index, int order[], int *count) {
    if (index >= tree->ElemNum || tree->SqBiTNode[index] == -1) {
        return;
    }

    inorder(tree, 2 * index + 1, order, count);
    order[*count] = tree->SqBiTNode[index];
    (*count)++;
    inorder(tree, 2 * index + 2, order, count);
}

int isBSTByInorder(const SqBiTree *tree) {
    int order[MAX_SIZE];
    int count = 0;
    int i;

    if (tree->ElemNum <= 0 || tree->SqBiTNode[0] == -1) {
        return 0;
    }

    inorder(tree, 0, order, &count);
    for (i = 1; i < count; i++) {
        if (order[i - 1] >= order[i]) {
            return 0;
        }
    }
    return 1;
}
```

时间复杂度为 `O(n)`，但需要保存全部中序序列，空间复杂度为 `O(n)`；递归栈另需 `O(h)` 空间。

## 优化解：递归传递取值范围

对每个结点直接维护它允许出现的开区间。根结点没有上下界；进入左子树后，上界变成当前结点值，进入右子树后，下界变成当前结点值。只要某个结点越界，就不是二叉搜索树。

```c
int checkBSTRange(
    const SqBiTree *tree,
    int index,
    int lower,
    int hasLower,
    int upper,
    int hasUpper
) {
    int value;

    if (index >= tree->ElemNum || tree->SqBiTNode[index] == -1) {
        return 1;
    }

    value = tree->SqBiTNode[index];
    if ((hasLower && value <= lower) || (hasUpper && value >= upper)) {
        return 0;
    }

    return checkBSTRange(tree, 2 * index + 1,
                         lower, hasLower, value, 1)
        && checkBSTRange(tree, 2 * index + 2,
                         value, 1, upper, hasUpper);
}

int isBST(const SqBiTree *tree) {
    if (tree->ElemNum <= 0 || tree->SqBiTNode[0] == -1) {
        return 0;
    }
    return checkBSTRange(tree, 0, 0, 0, 0, 0);
}
```

每个实际结点只访问一次，时间复杂度为 `O(n)`；只使用递归栈，空间复杂度为 `O(h)`，不再保存中序序列。

## 易错点

1. 只比较父结点和左右孩子是不够的，必须检查整个子树的范围。
2. 本文采用严格递增中序序列，因此重复值不满足二叉搜索树定义。
3. 顺序存储下标从 `0` 开始，左、右孩子分别是 `2*i+1` 和 `2*i+2`。
4. `-1` 是空位置标记，不应把它作为实际结点值参与比较。

