import nlp from "compromise";

export const extractClaims = (articleText: string) => {
  const claims =
    articleText.length > 25 ? articleText.slice(0, 25) + "" : articleText;

  return claims;
};
