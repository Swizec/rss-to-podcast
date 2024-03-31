import ffmpeg from "fluent-ffmpeg";
import { unlinkSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";

export async function mergeMP3Files(
    files: string[],
    outputFile: string
): Promise<void> {
    if (files.length === 0) {
        throw new Error("No files to merge");
    }

    let command = ffmpeg();

    // Add each MP3 file to the ffmpeg command
    files.forEach((file) => {
        command = command.input(file);
    });

    // Return a Promise that resolves when the merging is complete
    return new Promise((resolve, reject) => {
        command
            .on("error", (err) => {
                reject(err);
            })
            .on("end", () => {
                resolve();
            })
            .mergeToFile(outputFile, process.env.TEMP_DIR!); // Specify a temporary directory for processing
    });
}

export async function cleanDir(dir: string) {
    const files = (await readdir(dir)).filter((f) => !f.startsWith("."));
    for (const file of files) {
        unlinkSync(path.join(dir, file));
    }
}
