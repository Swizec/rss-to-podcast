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

async function markdownToVoice(markdown: string) {
    const file = await unified()
        .use(remarkParse)
        .use(remarkImagesToText)
        .use(remarkStringify)
        // .use(() => (ast) => {
        //     visit(ast, "paragraph", (node) => {
        //         console.log(node);
        //     });
        // })
        .process(markdown);

    textToVoice(String(file));
}

const markdown = await Bun.file("./test.md").text();

markdownToVoice(markdown);
