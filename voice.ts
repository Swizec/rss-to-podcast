import OpenAI from "openai";

const openai = new OpenAI();

async function textToVoice(text: string) {
    const mp3 = await openai.audio.speech.create({
        model: "tts-1-hd",
        voice: "shimmer",
        input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await Bun.write("./test.mp3", buffer);
}

const markdown = await Bun.file("./test.md").text();

await textToVoice(markdown);
