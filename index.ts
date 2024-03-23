import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { imageToText } from "./vision";
import { textToVoice } from "./voice";

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

function remarkImagesToText() {
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

function splitMarkdownByTitleAndImage(markdown: string): MarkdownSection[] {
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

async function markdownToVoice(markdown: string) {
    const sections = splitMarkdownByTitleAndImage(markdown);

    for await (const [i, section] of sections.entries()) {
        const text = `${section.title}${section.content}`;
        const file = await unified()
            .use(remarkParse)
            .use(remarkImagesToText)
            .use(remarkStringify)
            .process(text);

        console.log(String(file).length);

        textToVoice(String(file), `test-${i}.mp3`);
    }

    // for await (const [i, section] of sections.entries()) {
    //     const text = `${section.title}${section.content}`;
    //     console.log(text.length);
    //     // textToVoice(text, `test-${i}.mp3`);
    // }

    // const chunks = textToVoice(String(file));
}

const markdown = await Bun.file("./test.md").text();

markdownToVoice(markdown);
