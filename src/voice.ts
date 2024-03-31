import OpenAI from "openai";
import path from "node:path";

import {
    markdownSectionToText,
    splitMarkdownByTitleAndImage,
} from "./markdown";

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
            const text = await markdownSectionToText(section);

            console.log(text.length);

            const filename = path.join(tempDir, `markdownToVoice-${i}.mp3`);
            console.log(filename);

            await textToVoice(text, filename);
            files.push(filename);
        })
    );

    return files;
}
