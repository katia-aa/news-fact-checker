import axios from "axios";

const API_KEY = import.meta.env.VITE_CURRENTS_API_KEY;
const BASE_URL = "https://api.currentsapi.services/v1/search";

export const fetchDiddyNews = async () => {
  const response = await axios.get(BASE_URL, {
    params: {
      keywords: "Diddy",
      language: "en",
      apiKey: API_KEY,
    },
  });
  return response.data.news;
};

export const fetchLatestNewsForClaim = async (claim: string) => {
  const response = await axios.get(BASE_URL, {
    params: {
      keywords: claim,
      language: "en",
      apiKey: API_KEY,
    },
  });

  console.log(response.data.news);

  return response.data.news;
};
