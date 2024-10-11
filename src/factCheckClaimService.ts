import axios from "axios";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Use OpenAI to verify whether the claim is true or false
export const factCheckClaimWithOpenAI = async (
  claim: string,
  articles: [{ title: string; description: string }]
) => {
  const articleSnippets = articles
    .map(
      (article: { title: string; description: string }) =>
        `${article.title}: ${article.description}`
    )
    .join("\n");

  console.log(claim);
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o", // Use 'gpt-4' if you have access
      messages: [
        {
          role: "system",
          content:
            "You are an AI that helps verify the truthfulness of claims based on the latest information from news articles.",
        },
        {
          role: "user",
          content: `Here is a claim: "${claim}". Here are some recent articles:\n\n${articleSnippets}\n\nPlease determine if the claim is true, false, or uncertain based on the evidence from these articles, and explain why.`,
        },
      ],
      max_tokens: 150, // Adjust based on how much detail you want
      temperature: 0.5, // Keep the temperature low for more factual responses
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message.content.trim(); // Return the AI's response
};
