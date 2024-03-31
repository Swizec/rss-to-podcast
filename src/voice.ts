import OpenAI from "openai";
import path from "node:path";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { remarkImagesToText, splitMarkdownByTitleAndImage } from "./markdown";

const openai = new OpenAI();

export async function textToVoice(text: string, filename: string) {
    const mp3 = await openai.audio.speech.create({
        model: "tts-1-hd",
        voice: "shimmer",
        input: text,
        speed: 1.15,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await Bun.write(filename, buffer);
}

export async function markdownToVoice(tempDir: string, markdown: string) {
    const sections = splitMarkdownByTitleAndImage(markdown);
    const files: string[] = [];

    await Promise.all(
        sections.map(async (section, i) => {
            const text = `${section.title}${section.content}`;
            const file = await unified()
                .use(remarkParse)
                .use(remarkImagesToText)
                .use(remarkStringify)
                .process(text);

            console.log(String(file).length);

            const filename = path.join(tempDir, `markdownToVoice-${i}.mp3`);
            console.log(filename);

            await textToVoice(String(file), filename);
            files.push(filename);
        })
    );

    return files;
}
