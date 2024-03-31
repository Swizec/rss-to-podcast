import { visit } from "unist-util-visit";
import { imageToText } from "./vision";

async function imageNodeToText(node) {
    const text = await imageToText(node.url, node.alt);
    node.type = "paragraph";
    node.children = [
        {
            type: "text",
            value: `Embedded image: ${text} End image`,
        },
    ];
}

export function remarkImagesToText() {
    return async (ast) => {
        const images = [];
        visit(ast, "image", (node) => {
            images.push(node);
        });

        const promises = [];
        for (const image of images) {
            promises.push(imageNodeToText(image));
        }

        await Promise.all(promises);
    };
}

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
