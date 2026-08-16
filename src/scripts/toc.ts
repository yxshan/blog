interface TocItem {
  id: string;
  text: string;
  children: TocItem[];
}

function createTocButton(item: TocItem, child = false): HTMLButtonElement {
  const button = document.createElement("button");
  button.textContent = item.text;
  button.dataset.tocId = item.id;
  button.dataset.level = child ? "3" : "2";
  button.className = child
    ? "toc-link block w-full py-1 pl-6 pr-2 text-left text-sm text-gray-500 dark:text-gray-500"
    : "toc-link block w-full py-1 pl-3 pr-2 text-left text-sm text-gray-600 dark:text-gray-400";
  return button;
}

function syncActiveTocItem(toc: HTMLElement, id: string): void {
  toc
    .querySelectorAll<HTMLButtonElement>("button[data-toc-id]")
    .forEach((button) => {
      const active = button.dataset.tocId === id;
      if (active) button.setAttribute("aria-current", "location");
      else button.removeAttribute("aria-current");
      button.dataset.active = String(active);
    });
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
  toc.replaceChildren();

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
        syncActiveTocItem(toc, button.dataset.tocId);
        document.getElementById(button.dataset.tocId)?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
        });
      });
    });

  syncActiveTocItem(toc, headings[0]?.id ?? "");
  if (!("IntersectionObserver" in window)) return;

  const visible = new Set<string>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const heading = entry.target as HTMLHeadingElement;
        if (entry.isIntersecting) visible.add(heading.id);
        else visible.delete(heading.id);
      }

      const current =
        headings.find((heading) => visible.has(heading.id)) ??
        [...headings]
          .reverse()
          .find((heading) => heading.getBoundingClientRect().top <= 112) ??
        headings[0];
      if (current) syncActiveTocItem(toc, current.id);
    },
    { rootMargin: "-96px 0px -68% 0px", threshold: [0, 1] },
  );
  headings.forEach((heading) => observer.observe(heading));
}
