import OpenAI from "openai";

const openai = new OpenAI();

export async function textToVoice(text: string, filename: string) {
    const mp3 = await openai.audio.speech.create({
        model: "tts-1-hd",
        voice: "shimmer",
        input: text,
        speed: 1.25,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await Bun.write(filename, buffer);
}

// const markdown = await Bun.file("./test.md").text();

// await textToVoice(markdown, "./test.mp3");
