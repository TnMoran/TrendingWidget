import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "undefined") {
      // Return null or throw a specific error that we can catch
      return null;
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export interface TrendingTopic {
  topic: string;
  volume: string;
  category: string;
}

export interface TrendingTweet {
  id: string;
  authorName: string;
  authorHandle: string;
  content: string;
  timestamp: string;
  likes: string;
  retweets: string;
  avatarUrl: string;
}

export interface TrendingData {
  topics: TrendingTopic[];
  tweets: TrendingTweet[];
}

export async function getTrendingData(): Promise<TrendingData> {
  const ai = getAI();
  
  if (!ai) {
    console.warn("GEMINI_API_KEY is missing. Using fallback data.");
    return getFallbackData();
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate a list of 10 current trending topics and 5 'trending' tweets that would be popular on X (formerly Twitter) right now. Make them feel realistic, diverse (tech, sports, news, entertainment), and engaging. Include realistic engagement metrics.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING },
                  volume: { type: Type.STRING },
                  category: { type: Type.STRING }
                },
                required: ["topic", "volume", "category"]
              }
            },
            tweets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  authorName: { type: Type.STRING },
                  authorHandle: { type: Type.STRING },
                  content: { type: Type.STRING },
                  timestamp: { type: Type.STRING },
                  likes: { type: Type.STRING },
                  retweets: { type: Type.STRING },
                  avatarUrl: { type: Type.STRING }
                },
                required: ["id", "authorName", "authorHandle", "content", "timestamp", "likes", "retweets", "avatarUrl"]
              }
            }
          },
          required: ["topics", "tweets"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return data as TrendingData;
  } catch (error) {
    console.error("Error fetching trending data:", error);
    return getFallbackData();
  }
}

function getFallbackData(): TrendingData {
  return {
    topics: [
      { topic: "#SpaceX", volume: "125K posts", category: "Technology" },
      { topic: "Champions League", volume: "89K posts", category: "Sports" },
      { topic: "New AI Model", volume: "45K posts", category: "Tech" },
      { topic: "Vercel Deploy", volume: "12K posts", category: "Tech" },
      { topic: "Gemini AI", volume: "67K posts", category: "AI" },
    ],
    tweets: [
      {
        id: "1",
        authorName: "Tech Insider",
        authorHandle: "@techinsider",
        content: "The new AI breakthroughs we're seeing this week are absolutely mind-blowing. The pace of innovation is accelerating. 🚀 #AI #Tech",
        timestamp: "2h ago",
        likes: "12.5K",
        retweets: "2.1K",
        avatarUrl: "https://picsum.photos/seed/tech/100/100"
      },
      {
        id: "2",
        authorName: "Web Dev Daily",
        authorHandle: "@webdevdaily",
        content: "Deploying to Vercel is so smooth, but don't forget to set your environment variables! 🛠️ #WebDev #Vercel",
        timestamp: "4h ago",
        likes: "8.2K",
        retweets: "1.5K",
        avatarUrl: "https://picsum.photos/seed/web/100/100"
      }
    ]
  };
}
