export function enhanceCodeBlock(block, lang) {
  if (block.closest(".code-block-wrapper")) return;

  const wrapper = document.createElement("div");
  wrapper.className = "code-block-wrapper";

  const header = document.createElement("div");
  header.className = "code-block-header";
  const langLabel = document.createElement("span");
  langLabel.textContent = lang || "text";
  const copyBtn = document.createElement("button");
  copyBtn.className = "copy-btn code-copy-btn";
  copyBtn.innerHTML = `<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>复制</span>`;
  header.append(langLabel, copyBtn);

  const body = document.createElement("div");
  body.className = "code-block-body";
  body.appendChild(block.cloneNode(true));

  const codeEl = body.querySelector("code");
  if (codeEl) {
    codeEl.classList.add("hljs");
    const lines = codeEl.innerHTML.split("\n");
    codeEl.innerHTML = lines
      .map((line) => `<span class="hljs-line">${line || " "}</span>`)
      .join("\n");
  }

  wrapper.appendChild(header);
  wrapper.appendChild(body);
  block.parentElement.replaceChild(wrapper, block);

  const codeText = wrapper.querySelector("code")?.textContent || "";
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(codeText).then(() => {
      copyBtn.querySelector("span").textContent = "已复制";
      setTimeout(() => {
        copyBtn.querySelector("span").textContent = "复制";
      }, 2000);
    });
  });
}

function enhanceLinks(container) {
  container.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (/^https?:\/\//.test(href)) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
      link.classList.add("external-link");
      if (!link.querySelector(".external-icon")) {
        const icon = document.createElement("span");
        icon.className = "external-icon";
        icon.innerHTML = "↗";
        link.appendChild(icon);
      }
    }
  });
}

function enhanceHeadings(container) {
  const seen = {};
  container.querySelectorAll("h1, h2, h3, h4").forEach((heading) => {
    if (heading.id) return;
    const text = heading.textContent || "";
    let id = text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff]+/g, "-")
      .replace(/(^-|-$)/g, "");
    if (seen[id] !== undefined) {
      seen[id] += 1;
      id = `${id}-${seen[id]}`;
    } else {
      seen[id] = 0;
    }
    heading.id = id;
  });
}

function enhanceHashTags(container) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (
        parent &&
        parent.closest("pre, code, a, h1, h2, h3, h4, h5, h6, .hash-tag")
      ) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  for (const node of textNodes) {
    const original = node.nodeValue || "";
    if (!original.includes("#")) continue;
    const regex = /(^|[^\w\u4e00-\u9fff])#([\u4e00-\u9fff\w]+)/g;
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let changed = false;
    let match;

    while ((match = regex.exec(original)) !== null) {
      const prefix = match[1];
      const tag = match[2];
      fragment.append(
        document.createTextNode(
          original.slice(lastIndex, match.index + prefix.length),
        ),
      );
      const span = document.createElement("span");
      span.className = "hash-tag";
      span.textContent = `#${tag}`;
      fragment.appendChild(span);
      lastIndex = match.index + prefix.length + tag.length + 1;
      changed = true;
    }

    if (!changed) continue;
    fragment.append(document.createTextNode(original.slice(lastIndex)));
    node.parentNode.replaceChild(fragment, node);
  }
}

export function enhancePost() {
  const container = document.querySelector(".prose");
  if (!container) return;
  enhanceHeadings(container);
  container.querySelectorAll("pre").forEach((pre) => {
    const code = pre.querySelector("code");
    if (!code) return;
    const langMatch = code.className.match(/language-(\w+)/);
    enhanceCodeBlock(pre, langMatch ? langMatch[1].toUpperCase() : "");
  });
  enhanceLinks(container);
  enhanceHashTags(container);
}
