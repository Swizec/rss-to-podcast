import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import path from "node:path";
import { imageToText } from "./vision";
import { textToVoice } from "./voice";
import { cleanDir, mergeMP3Files, waitForFilesFlush } from "./src/files";

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

async function markdownToVoice(dir: string, markdown: string) {
    const sections = splitMarkdownByTitleAndImage(markdown);
    const files: string[] = [];

    for (const [i, section] of sections.entries()) {
        const text = `${section.title}${section.content}`;
        const file = await unified()
            .use(remarkParse)
            .use(remarkImagesToText)
            .use(remarkStringify)
            .process(text);

        console.log(String(file).length);

        const filename = path.join(dir, `markdownToVoice-${i}.mp3`);
        console.log(filename);
        textToVoice(String(file), filename);
        files.push(filename);
    }

    return files;
}

await cleanDir(process.env.TEMP_DIR!);

const markdown = await Bun.file("./test.md").text();

const files = await markdownToVoice(process.env.TEMP_DIR!, markdown);

console.log("Waiting to flush files");
await waitForFilesFlush(process.env.TEMP_DIR!, files);

console.log("Merging files");
await mergeMP3Files(files, "test.mp3");
