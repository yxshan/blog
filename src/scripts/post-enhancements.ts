export function enhanceCodeBlock(
  block: HTMLPreElement,
  language: string,
): void {
  if (block.closest(".code-block-wrapper")) return;

  const wrapper = document.createElement("div");
  wrapper.className = "code-block-wrapper";
  const header = document.createElement("div");
  header.className = "code-block-header";
  const languageLabel = document.createElement("span");
  languageLabel.textContent = language || "text";
  const copyButton = document.createElement("button");
  copyButton.className = "copy-btn code-copy-btn";
  copyButton.innerHTML = `<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>复制</span>`;
  header.append(languageLabel, copyButton);

  const body = document.createElement("div");
  body.className = "code-block-body";
  body.appendChild(block.cloneNode(true));
  const codeElement = body.querySelector("code");
  if (codeElement) {
    codeElement.classList.add("hljs");
    codeElement.innerHTML = codeElement.innerHTML
      .split("\n")
      .map((line) => `<span class="hljs-line">${line || " "}</span>`)
      .join("\n");
  }

  wrapper.append(header, body);
  block.parentElement?.replaceChild(wrapper, block);
  const codeText = wrapper.querySelector("code")?.textContent ?? "";
  copyButton.addEventListener("click", () => {
    void navigator.clipboard.writeText(codeText).then(() => {
      const label = copyButton.querySelector("span");
      if (!label) return;
      label.textContent = "已复制";
      window.setTimeout(() => {
        label.textContent = "复制";
      }, 2000);
    });
  });
}

function enhanceLinks(container: Element): void {
  container.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
    const href = link.getAttribute("href") ?? "";
    if (!/^https?:\/\//.test(href)) return;
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
    link.classList.add("external-link");
    if (!link.querySelector(".external-icon")) {
      const icon = document.createElement("span");
      icon.className = "external-icon";
      icon.textContent = "↗";
      link.appendChild(icon);
    }
  });
}

function enhanceHeadings(container: Element): void {
  const seen: Record<string, number> = {};
  container
    .querySelectorAll<HTMLElement>("h1, h2, h3, h4")
    .forEach((heading) => {
      if (heading.id) return;
      let id = (heading.textContent ?? "")
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fff]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const count = seen[id] ?? 0;
      seen[id] = count + 1;
      if (count > 0) id = `${id}-${count}`;
      heading.id = id;
    });
}

function enhanceHashTags(container: Element): void {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      return parent?.closest("pre, code, a, h1, h2, h3, h4, h5, h6, .hash-tag")
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT;
    },
  });
  const textNodes: Node[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  for (const node of textNodes) {
    const original = node.nodeValue ?? "";
    if (!original.includes("#")) continue;
    const regex = /(^|[^\w\u4e00-\u9fff])#([\u4e00-\u9fff\w]+)/g;
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let changed = false;
    for (const match of original.matchAll(regex)) {
      const prefix = match[1] ?? "";
      const tag = match[2] ?? "";
      fragment.append(
        document.createTextNode(
          original.slice(lastIndex, (match.index ?? 0) + prefix.length),
        ),
      );
      const span = document.createElement("span");
      span.className = "hash-tag";
      span.textContent = `#${tag}`;
      fragment.appendChild(span);
      lastIndex = (match.index ?? 0) + prefix.length + tag.length + 1;
      changed = true;
    }
    if (!changed) continue;
    fragment.append(document.createTextNode(original.slice(lastIndex)));
    node.parentNode?.replaceChild(fragment, node);
  }
}

export function enhancePost(): void {
  const container = document.querySelector(".prose");
  if (!container) return;
  enhanceHeadings(container);
  container.querySelectorAll<HTMLPreElement>("pre").forEach((pre) => {
    const code = pre.querySelector("code");
    if (!code) return;
    const language = code.className.match(/language-(\w+)/)?.[1] ?? "";
    enhanceCodeBlock(pre, language.toUpperCase());
  });
  enhanceLinks(container);
  enhanceHashTags(container);
}
