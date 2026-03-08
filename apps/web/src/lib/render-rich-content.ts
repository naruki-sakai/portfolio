import sanitizeHtml from "sanitize-html";

interface ProseMirrorMark {
  type: string;
  attrs?: Record<string, string>;
}

interface ProseMirrorNode {
  type: string;
  attrs?: Record<string, string | number>;
  content?: ProseMirrorNode[];
  marks?: ProseMirrorMark[];
  text?: string;
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "h2", "h3", "h4",
    "ul", "ol", "li",
    "img",
    "strong", "em", "a", "br",
  ],
  allowedAttributes: {
    img: ["src", "alt", "title", "width", "height", "loading"],
    a: ["href", "target", "rel"],
  },
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        target: "_blank",
        rel: "noopener noreferrer",
      },
    }),
  },
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderMarks(text: string, marks?: ProseMirrorNode["marks"]): string {
  if (!marks || marks.length === 0) return escapeHtml(text);

  let html = escapeHtml(text);
  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        html = `<strong>${html}</strong>`;
        break;
      case "italic":
        html = `<em>${html}</em>`;
        break;
      case "link":
        html = `<a href="${escapeHtml(String(mark.attrs?.href ?? ""))}">${html}</a>`;
        break;
    }
  }
  return html;
}

function renderNode(node: ProseMirrorNode): string {
  switch (node.type) {
    case "doc":
      return (node.content ?? []).map(renderNode).join("");

    case "paragraph":
      return `<p>${(node.content ?? []).map(renderNode).join("")}</p>`;

    case "heading": {
      const level = Number(node.attrs?.level ?? 2);
      const tag = `h${Math.min(Math.max(level, 2), 4)}`;
      return `<${tag}>${(node.content ?? []).map(renderNode).join("")}</${tag}>`;
    }

    case "bulletList":
      return `<ul>${(node.content ?? []).map(renderNode).join("")}</ul>`;

    case "orderedList":
      return `<ol>${(node.content ?? []).map(renderNode).join("")}</ol>`;

    case "listItem":
      return `<li>${(node.content ?? []).map(renderNode).join("")}</li>`;

    case "image":
      return `<img src="${escapeHtml(String(node.attrs?.src ?? ""))}" alt="${escapeHtml(String(node.attrs?.alt ?? ""))}" loading="lazy" />`;

    case "text":
      return renderMarks(node.text ?? "", node.marks);

    case "hardBreak":
      return "<br />";

    default:
      return (node.content ?? []).map(renderNode).join("");
  }
}

/**
 * ProseMirror JSON を安全な HTML 文字列に変換する
 * サーバーサイドで呼び出すことを想定
 */
export function renderRichContent(json: Record<string, unknown>): string {
  const rawHtml = renderNode(json as unknown as ProseMirrorNode);
  return sanitizeHtml(rawHtml, SANITIZE_OPTIONS);
}
