import OpenAI from "openai";

const openai = new OpenAI();

async function imageToText(url: string) {
    const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: "Very shortly describe this image for a blind person",
                    },
                    { type: "image_url", image_url: { url } },
                ],
            },
        ],
    });

    console.log(response.choices[0]);
}

await imageToText(
    "https://journals.plos.org/plosone/article/figure/image?size=large&id=10.1371/journal.pone.0299765.g001"
);
