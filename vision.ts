import OpenAI from "openai";

const openai = new OpenAI();

export async function imageToText(url: string, alt?: string) {
    const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: alt
                            ? `Write a short 2-sentence description of this image for a blind person. The alt is: ${alt}`
                            : "Write a short 2-sentence description of this image for a blind person",
                    },
                    { type: "image_url", image_url: { url } },
                ],
            },
        ],
    });

    return response.choices[0].message.content;
}
