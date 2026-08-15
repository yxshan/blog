interface TocItem {
  id: string;
  text: string;
  children: TocItem[];
}

function createTocButton(item: TocItem, child = false): HTMLButtonElement {
  const button = document.createElement("button");
  button.textContent = item.text;
  button.dataset.tocId = item.id;
  button.className = child
    ? "block w-full py-1 pl-6 pr-2 text-left text-sm text-gray-500 hover:text-gray-800 dark:text-gray-500 dark:hover:text-gray-300"
    : "block w-full py-1 pl-3 pr-2 text-left text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200";
  return button;
}

export function initToc(): void {
  const container = document.querySelector(".prose");
  const toc = document.getElementById("toc");
  if (!container || !toc) return;
  const headings = [
    ...container.querySelectorAll<HTMLHeadingElement>("h2[id], h3[id]"),
  ];
  if (headings.length === 0) {
    toc.remove();
    return;
  }

  const tree: TocItem[] = [];
  let current: TocItem | undefined;
  for (const heading of headings) {
    const item: TocItem = {
      id: heading.id,
      text: heading.textContent ?? "",
      children: [],
    };
    if (heading.tagName === "H2") {
      tree.push(item);
      current = item;
    } else {
      current?.children.push(item);
    }
  }

  const list = document.createElement("ul");
  list.className = "space-y-1 border-l border-gray-200 dark:border-gray-700";
  for (const item of tree) {
    const listItem = document.createElement("li");
    listItem.appendChild(createTocButton(item));
    if (item.children.length > 0) {
      const children = document.createElement("ul");
      children.className = "space-y-1";
      for (const child of item.children) {
        const childItem = document.createElement("li");
        childItem.appendChild(createTocButton(child, true));
        children.appendChild(childItem);
      }
      listItem.appendChild(children);
    }
    list.appendChild(listItem);
  }
  toc.appendChild(list);

  toc
    .querySelectorAll<HTMLButtonElement>("button[data-toc-id]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        if (!button.dataset.tocId) return;
        document.getElementById(button.dataset.tocId)?.scrollIntoView({
          behavior: "smooth",
        });
      });
    });
}
