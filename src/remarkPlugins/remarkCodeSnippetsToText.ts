import OpenAI from "openai";
import { visit } from "unist-util-visit";

const openai = new OpenAI();

async function codeSnippetToText(node) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "very briefly describe this code for someone who is listening to a technical article by audio. no yapping",
                        },
                        { type: "text", text: `\`\`\`${node.value}\`\`\`` },
                    ],
                },
            ],
        });

        const text = response.choices[0].message.content;

        node.type = "paragraph";
        node.children = [
            {
                type: "text",
                value: `Code snippet: ${text}`,
            },
        ];
    } catch (err) {
        console.error(err);
        console.log(node);
        node.type = "paragraph";
        node.children = [{ type: "text", value: "" }];
    }
}

export function remarkCodeSnippetsToText() {
    return async (ast) => {
        const snippets = [];
        visit(ast, "code", (node) => {
            snippets.push(node);
        });

        const promises = [];
        for (const snippet of snippets) {
            promises.push(codeSnippetToText(snippet));
        }

        await Promise.all(promises);
    };
}
