import { markdownToVoice } from "./src/voice";
import { cleanDir, mergeMP3Files } from "./src/files";

async function processMarkdown(markdown: string, out: string) {
    await cleanDir(process.env.TEMP_DIR!);

    const files = await markdownToVoice(process.env.TEMP_DIR!, markdown);

    console.log("Merging files");
    await mergeMP3Files(files, out);
}

const markdown = await Bun.file("./test.md").text();
await processMarkdown(markdown, "./test.mp3");
