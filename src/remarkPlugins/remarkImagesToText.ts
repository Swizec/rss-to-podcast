import { visit } from "unist-util-visit";
import { imageToText } from "../vision";

async function imageNodeToText(node) {
    try {
        const text = await imageToText(node.url, node.alt);

        node.type = "paragraph";
        node.children = [
            {
                type: "text",
                value: `Embedded image: ${text} End image`,
            },
        ];
    } catch (err) {
        console.error(err);
        console.log(node);
        node.type = "paragraph";
        node.children = [{ type: "text", value: "" }];
    }
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
