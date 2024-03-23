import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { imageToText } from "./vision";

function imagesToText() {
    return async (ast) => {
        const images = [];
        visit(ast, "image", (node) => {
            images.push(node);
        });

        const promises = [];
        for (const { url } of images) {
            promises.push(
                (async () => {
                    const text = await imageToText(url);
                    console.log(text);
                })()
            );
        }

        await Promise.all(promises);
    };
}

async function markdownToVoice(markdown: string) {
    const file = await unified()
        .use(remarkParse)
        .use(imagesToText)
        .use(remarkStringify)
        .process(markdown);

    // console.log(String(file));
}

const markdown = await Bun.file("./test.md").text();

markdownToVoice(markdown);
