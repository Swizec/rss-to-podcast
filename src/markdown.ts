import { unified } from "unified";
import rehypeParse from "rehype-parse";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import rehypeRemark from "rehype-remark";
import { remarkImagesToText } from "./remarkPlugins/remarkImagesToText";
import { remarkCodeSnippetsToText } from "./remarkPlugins/remarkCodeSnippetsToText";

type MarkdownSection = {
    title: string;
    content: string;
};

export function splitMarkdownByTitleAndImage(
    markdown: string
): MarkdownSection[] {
    const lines = markdown.split("\n");
    const sections: MarkdownSection[] = [];
    let currentSection: MarkdownSection = { title: "", content: "" };

    lines.forEach((line) => {
        if (
            line.startsWith("# ") ||
            line.startsWith("## ") ||
            line.startsWith("![")
        ) {
            if (currentSection.title || currentSection.content) {
                sections.push(currentSection);
            }
            currentSection = { title: line, content: "" };
        } else {
            currentSection.content += line + "\n";
        }
    });

    if (currentSection.title || currentSection.content) {
        sections.push(currentSection);
    }

    return sections;
}

export async function htmlToMarkdown(html: string): Promise<string> {
    const processor = unified()
        .use(rehypeParse, { fragment: true, emitParseErrors: false })
        .use(rehypeRemark)
        .use(remarkStringify);

    const file = await processor.process(html);
    return String(file);
}

export async function markdownSectionToText(section: MarkdownSection) {
    const text = `${section.title}${section.content}`;
    return String(
        await unified()
            .use(remarkParse)
            .use(remarkImagesToText)
            .use(remarkCodeSnippetsToText)
            .use(remarkStringify)
            .process(text)
    );
}
