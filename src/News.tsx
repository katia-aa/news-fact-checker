import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Heading,
  Text,
  Stack,
  Spinner,
  Center,
  Image,
  Link,
  Button,
} from "@chakra-ui/react";
import { fetchDiddyNews, fetchLatestNewsForClaim } from "./currentsAPI";
import { summarizeArticle } from "./summarizationService"; // Import summarization service
import { factCheckClaimWithOpenAI } from "./factCheckClaimService";
import { extractClaims } from "./extractClaims";

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  image: string;
  published: string;
}

const News: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["diddyNews"],
    queryFn: fetchDiddyNews,
  });

  const [summarizedArticles, setSummarizedArticles] = useState<{
    [key: string]: string;
  }>({}); // State to store summaries
  const [loadingSummaries, setLoadingSummaries] = useState<{
    [key: string]: boolean;
  }>({});
  const [factCheckResults, setFactCheckResults] = useState<{
    [key: string]: string | null;
  }>({});
  const [loadingFactChecks, setLoadingFactChecks] = useState<{
    [key: string]: boolean;
  }>({});

  const handleSummarize = async (articleId: string, articleContent: string) => {
    setLoadingSummaries((prev) => ({ ...prev, [articleId]: true }));
    const summary = await summarizeArticle(articleContent);
    setSummarizedArticles((prev) => ({ ...prev, [articleId]: summary }));
    setLoadingSummaries((prev) => ({ ...prev, [articleId]: false }));
  };
  const handleFactCheck = async (
    articleId: string,
    claim: string,
    articleTitle: string
  ) => {
    try {
      setLoadingFactChecks((prev) => ({ ...prev, [articleId]: true }));

      const shortenedClaim = extractClaims(articleTitle); // Use key phrases only or apply a length limit

      // Fetch real-time articles related to the claim
      const realTimeArticles = await fetchLatestNewsForClaim(shortenedClaim);

      if (!realTimeArticles || realTimeArticles.length === 0) {
        throw new Error("No relevant articles found.");
      }

      // Use OpenAI to analyze and fact-check the claim based on the latest news
      const factCheckResult = await factCheckClaimWithOpenAI(
        claim,
        realTimeArticles
      );

      console.log(factCheckResult);

      setFactCheckResults((prev) => ({
        ...prev,
        [articleId]: factCheckResult.includes("true")
          ? "true"
          : factCheckResult.includes("false")
            ? "false"
            : "uncertain",
        [`${articleId}-reason`]: factCheckResult,
      }));
    } catch (error) {
      console.error("Error fact-checking the claim:", error);
      setFactCheckResults((prev) => ({
        ...prev,
        [articleId]: "uncertain",
        [`${articleId}-reason`]: "An error occurred while fact-checking.",
      }));
    } finally {
      // Always stop loading regardless of success or failure
      setLoadingFactChecks((prev) => ({ ...prev, [articleId]: false }));
    }
  };

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Text color="red.500">Error fetching news. Please try again later.</Text>
    );
  }

  return (
    <Box maxW="container.md" mx="auto" mt={8} px={4}>
      <Heading
        mb={6}
        textAlign="center"
        color="primary.200"
        fontFamily="heading"
        fontSize="4xl"
        textShadow="1px 1px #FFDFD3"
      >
        Diddy News Tracker
      </Heading>
      <Stack spacing={8}>
        {data?.map((article: NewsArticle) => (
          <Box
            key={article.id}
            p={6}
            boxShadow="lg"
            borderRadius="xl"
            bg="white"
            borderWidth="1px"
            borderColor="primary.200"
          >
            {article.image && (
              <Image
                borderRadius="md"
                src={article.image}
                alt={article.title}
                mb={4}
                maxH="250px"
                objectFit="cover"
              />
            )}
            <Heading fontSize="2xl" mb={2} color="primary.300">
              {article.title}
            </Heading>
            <Text fontSize="lg" color="gray.700" mb={4}>
              {article.description}
            </Text>
            <Text fontSize="sm" color="gray.500" mb={4}>
              Published on {new Date(article.published).toLocaleDateString()}
            </Text>
            <Stack direction="row" spacing={4} mt={4}>
              <Button
                as={Link}
                href={article.url}
                colorScheme="blue"
                isExternal
                fontWeight="bold"
              >
                Read more
              </Button>

              {/* Summarization Button */}
              <Button
                colorScheme="purple"
                onClick={() => handleSummarize(article.id, article.description)}
                isLoading={loadingSummaries[article.id]}
              >
                Summarize Article
              </Button>

              {/* Fact Check Button */}
              <Button
                colorScheme="teal"
                onClick={() =>
                  handleFactCheck(
                    article.id,
                    article.description,
                    article.title
                  )
                }
                isLoading={loadingFactChecks[article.id]}
              >
                Fact Check Article
              </Button>
            </Stack>

            {/* Display summary if available */}
            {summarizedArticles[article.id] && (
              <Text mt={4} color="primary.500" fontWeight="bold">
                Key Takeaways: {summarizedArticles[article.id]}
              </Text>
            )}

            {/* Show Fact Check Results */}
            {loadingFactChecks[article.id] ? (
              <Text mt={2} color="blue.500">
                {(() => {
                  const loadingStates = [
                    "Processing...",
                    "Reading articles...",
                    "Cross-referencing claims...",
                  ];
                  const index =
                    Math.floor(Date.now() / 1000) % loadingStates.length;
                  return loadingStates[index];
                })()}
              </Text>
            ) : (
              <>
                {factCheckResults[article.id] === "true" && (
                  <Text mt={2} color="green.500">
                    ✅ This claim appears to be true.
                  </Text>
                )}
                {factCheckResults[article.id] === "false" && (
                  <Text mt={2} color="red.500">
                    ❌ This claim appears to be false.
                    <br />
                  </Text>
                )}
                {factCheckResults[article.id] === "uncertain" && (
                  <Text mt={2} color="orange.500">
                    ❓ We are uncertain about the truth of this claim.
                  </Text>
                )}
                {factCheckResults[`${article.id}-reason`] && (
                  <Text>
                    Reason: {factCheckResults[`${article.id}-reason`]}
                  </Text>
                )}
              </>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default News;
