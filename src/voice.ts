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

function chunkTextLines(lines: string[], maxChars: number = 4096): string[] {
    let currentChunk = "";
    const chunks: string[] = [];

    for (const line of lines) {
        if (currentChunk.length + line.length > maxChars) {
            chunks.push(currentChunk);
            currentChunk = "";
        }

        currentChunk += line + "\n";
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }

    return chunks;
}

export async function markdownToVoice(tempDir: string, markdown: string) {
    const sections = splitMarkdownByTitleAndImage(markdown);
    const files: string[] = [];

    await Promise.all(
        sections.map(async (section, i) => {
            // textifies images and embeds
            const text = await markdownSectionToText(section);
            // makes sure every chunk fits in the char limit
            const chunks = chunkTextLines(text.split("\n"));

            for (let j = 0; j < chunks.length; j++) {
                const filename = path.join(
                    tempDir,
                    `markdownToVoice-${i}-${j}.mp3`
                );
                console.log(filename);

                await textToVoice(text, filename);
                files.push(filename);
            }
        })
    );

    return files;
}
