import { markdownToVoice } from "./src/voice";
import { cleanDir, mergeMP3Files } from "./src/files";
import { parseArgs } from "util";
import { extract } from "@extractus/article-extractor";
import slugify from "@sindresorhus/slugify";
import natsort from "natsort";
import { htmlToMarkdown } from "./src/markdown";

async function processMarkdown(markdown: string, out: string) {
    await cleanDir(process.env.TEMP_DIR!);

    const files = await markdownToVoice(process.env.TEMP_DIR!, markdown);
    files.sort(natsort());

    console.log("Merging files");
    await mergeMP3Files(files, out);
}

async function podcastify(url: string) {
    const article = await extract(url);
    if (!article?.content) {
        throw new Error(`Couldn't parse article from ${url}`);
    }

    const markdown = await htmlToMarkdown(article.content);
    const filename = `${slugify(article.title || url)}.mp3`;
    await processMarkdown(markdown, filename);
}

const { positionals } = parseArgs({ args: Bun.argv, allowPositionals: true });

const url = positionals.find((arg) => arg.startsWith("http"));

if (!url) {
    throw new Error("Please provide a URL to podcastify");
}

await podcastify(url);

// const markdown = await Bun.file("./test.md").text();
// await processMarkdown(markdown, "./test.mp3");
