import axios from "axios";

const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
const CURRENTS_API_URL = "https://api.openai.com/v1/chat/completions";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
export const summarizeArticle = async (articleContent: string) => {
  const response = await axios.post(
    `${CORS_PROXY}${CURRENTS_API_URL}`,
    {
      model: "gpt-4", // Use 'gpt-4' if you're using GPT-4
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that extracts interesting details and key facts from articles about the diddy scandal and summorizes the article in a concise manner using the smart brevity framework.",
        },
        {
          role: "user",
          content: `Extract the most significant and notable details from the article: \n\n${articleContent}. Focus specifically on any to problematic behavior that could be associated with abuse, coercion, or sex trafficking. Highlight sections that suggest or allude to such behavior, even if there is no definitive proof.`,
        },
      ],
      max_tokens: 150, // Limit the length of the summary
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message.content.trim();
};
