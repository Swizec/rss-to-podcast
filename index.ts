import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import ffmpeg from "fluent-ffmpeg";
import { imageToText } from "./vision";
import { textToVoice } from "./voice";

async function mergeMP3Files(
    files: string[],
    outputFile: string
): Promise<void> {
    if (files.length === 0) {
        throw new Error("No files to merge");
    }

    let command = ffmpeg();

    // Add each MP3 file to the ffmpeg command
    files.forEach((file) => {
        command = command.input(file);
    });

    // Return a Promise that resolves when the merging is complete
    return new Promise((resolve, reject) => {
        command
            .on("error", (err) => {
                reject(err);
            })
            .on("end", () => {
                resolve();
            })
            .mergeToFile(outputFile, "./temp2"); // Specify a temporary directory for processing
    });
}

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
    const files: string[] = [];

    for await (const [i, section] of sections.entries()) {
        const text = `${section.title}${section.content}`;
        const file = await unified()
            .use(remarkParse)
            .use(remarkImagesToText)
            .use(remarkStringify)
            .process(text);

        console.log(String(file).length);

        const filename = `./temp/markdownToVoice-${i}.mp3`;
        console.log(filename);
        textToVoice(String(file), filename);
        files.push(filename);
    }

    console.log("merging file");
    console.log(files);
    // mergeMP3Files(files, "./test.mp3");

    // for await (const [i, section] of sections.entries()) {
    //     const text = `${section.title}${section.content}`;
    //     console.log(text.length);
    //     // textToVoice(text, `test-${i}.mp3`);
    // }

    // const chunks = textToVoice(String(file));
}

const markdown = await Bun.file("./test.md").text();

// markdownToVoice(markdown);
const files = [
    "./temp/markdownToVoice-0.mp3",
    "./temp/markdownToVoice-1.mp3",
    "./temp/markdownToVoice-2.mp3",
    "./temp/markdownToVoice-3.mp3",
    "./temp/markdownToVoice-4.mp3",
    "./temp/markdownToVoice-5.mp3",
    "./temp/markdownToVoice-6.mp3",
    "./temp/markdownToVoice-7.mp3",
    "./temp/markdownToVoice-8.mp3",
    "./temp/markdownToVoice-9.mp3",
    "./temp/markdownToVoice-10.mp3",
    "./temp/markdownToVoice-11.mp3",
    "./temp/markdownToVoice-12.mp3",
    "./temp/markdownToVoice-13.mp3",
    "./temp/markdownToVoice-14.mp3",
];
await mergeMP3Files(files, "./test.mp3");
