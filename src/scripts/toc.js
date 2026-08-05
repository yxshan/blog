export function initToc() {
  const container = document.querySelector(".prose");
  const toc = document.getElementById("toc");
  if (!container || !toc) return;

  const headings = [...container.querySelectorAll("h2[id], h3[id]")];
  if (headings.length === 0) {
    toc.remove();
    return;
  }

  const tree = [];
  let lastH2 = -1;
  for (const heading of headings) {
    const item = {
      id: heading.id,
      text: heading.textContent || "",
      level: Number(heading.tagName[1]),
      children: [],
    };
    if (item.level === 2) {
      tree.push(item);
      lastH2 = tree.length - 1;
    } else if (item.level === 3 && lastH2 >= 0) {
      tree[lastH2].children.push(item);
    }
  }

  const list = document.createElement("ul");
  list.className = "space-y-1 border-l border-gray-200 dark:border-gray-700";
  for (const h2 of tree) {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.textContent = h2.text;
    button.dataset.tocId = h2.id;
    button.className =
      "block w-full py-1 pl-3 pr-2 text-left text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200";
    li.appendChild(button);
    if (h2.children.length > 0) {
      const children = document.createElement("ul");
      children.className = "space-y-1";
      for (const h3 of h2.children) {
        const childLi = document.createElement("li");
        const childButton = document.createElement("button");
        childButton.textContent = h3.text;
        childButton.dataset.tocId = h3.id;
        childButton.className =
          "block w-full py-1 pl-6 pr-2 text-left text-sm text-gray-500 hover:text-gray-800 dark:text-gray-500 dark:hover:text-gray-300";
        childLi.appendChild(childButton);
        children.appendChild(childLi);
      }
      li.appendChild(children);
    }
    list.appendChild(li);
  }
  toc.appendChild(list);

  toc.querySelectorAll("button[data-toc-id]").forEach((button) => {
    button.addEventListener("click", () => {
      document.getElementById(button.dataset.tocId)?.scrollIntoView({
        behavior: "smooth",
      });
    });
  });
}
