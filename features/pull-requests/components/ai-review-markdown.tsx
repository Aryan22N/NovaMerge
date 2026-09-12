/**
 * AiReviewMarkdown — lightweight server component that converts the AI-generated
 * markdown review to safe HTML for display.
 *
 * The AI system prompt (generate-review.ts) only produces a fixed set of
 * markdown constructs:
 *   - ATX headings  (### h3, ## h2, # h1)
 *   - Bold          (**text**)
 *   - Italic        (*text*)
 *   - Inline code   (`code`)
 *   - Fenced code blocks (```lang\n...\n```)
 *   - Unordered lists (- item / * item)
 *   - Paragraphs (blank-line separated)
 *   - Horizontal rules (---)
 *
 * No external markdown library is added — all conversions are done with
 * targeted string replacements, keeping the bundle size unchanged.
 */

/** Escapes HTML special characters to prevent XSS from AI output. */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/**
 * Converts a limited subset of markdown to safe HTML.
 * Processes block elements first, then inline elements within text nodes.
 */
function markdownToHtml(markdown: string): string {
    const lines = markdown.split("\n");
    const output: string[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // ── Fenced code block ───────────────────────────────────────────
        if (line.trimStart().startsWith("```")) {
            const lang = line.trim().slice(3).trim();
            const codeLines: string[] = [];
            i++;
            while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
                codeLines.push(escapeHtml(lines[i]));
                i++;
            }
            output.push(
                `<pre class="not-prose rounded-none bg-muted border border-border p-4 overflow-x-auto text-xs leading-relaxed my-3"><code${lang ? ` data-lang="${escapeHtml(lang)}"` : ""}>${codeLines.join("\n")}</code></pre>`
            );
            i++; // skip closing ```
            continue;
        }

        // ── Horizontal rule ─────────────────────────────────────────────
        if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim())) {
            output.push('<hr class="my-4 border-border" />');
            i++;
            continue;
        }

        // ── ATX Headings ────────────────────────────────────────────────
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            const level = headingMatch[1].length;
            const text = inlineMarkdown(headingMatch[2]);
            const sizeClass =
                level === 1
                    ? "text-base font-semibold mt-4 mb-1"
                    : level === 2
                    ? "text-sm font-semibold mt-4 mb-1"
                    : "text-sm font-medium mt-3 mb-1 text-foreground";
            output.push(`<h${level} class="${sizeClass}">${text}</h${level}>`);
            i++;
            continue;
        }

        // ── Unordered list ──────────────────────────────────────────────
        if (/^[-*+]\s/.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
                items.push(
                    `<li class="ml-4 text-sm">${inlineMarkdown(lines[i].replace(/^[-*+]\s/, "").trim())}</li>`
                );
                i++;
            }
            output.push(`<ul class="list-disc list-inside space-y-0.5 my-2">${items.join("")}</ul>`);
            continue;
        }

        // ── Blank line ──────────────────────────────────────────────────
        if (line.trim() === "") {
            i++;
            continue;
        }

        // ── Paragraph fallback ──────────────────────────────────────────
        output.push(
            `<p class="text-sm leading-relaxed my-1.5">${inlineMarkdown(escapeHtml(line))}</p>`
        );
        i++;
    }

    return output.join("\n");
}

/** Handles inline markdown: bold, italic, inline code. */
function inlineMarkdown(text: string): string {
    // Escape first to prevent XSS, then convert inline patterns
    const escaped = escapeHtml(text);

    return escaped
        // Inline code — must be before bold/italic to avoid double-processing
        .replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1 py-0.5 font-mono text-xs">$1</code>')
        // Bold (**text** or __text__)
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/__([^_]+)__/g, "<strong>$1</strong>")
        // Italic (*text* or _text_) — avoid matching ** or __
        .replace(/(?<!\*)\*(?!\*)([^*]+)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
        .replace(/(?<!_)_(?!_)([^_]+)(?<!_)_(?!_)/g, "<em>$1</em>");
}

type AiReviewMarkdownProps = {
    /** Raw markdown string from `PullRequest.reviewComment`. */
    markdown: string;
    className?: string;
};

/**
 * Renders AI-generated markdown review as HTML inside a styled container.
 *
 * Uses a custom server-side converter (no external deps) that handles the
 * exact constructs the AI system prompt produces.
 *
 * @param markdown - The raw markdown from `reviewComment`.
 * @param className - Optional extra classes on the wrapper div.
 */
export function AiReviewMarkdown({ markdown, className }: AiReviewMarkdownProps) {
    const html = markdownToHtml(markdown);

    return (
        <div
            className={`text-foreground ${className ?? ""}`}
            // Server-rendered HTML from our own controlled converter — the input
            // is AI-generated text that has been HTML-escaped before conversion.
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

// Export the converter for unit testing
export { markdownToHtml, inlineMarkdown };
