import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
    // Fallback data
    return {
      topics: [
        { topic: "#SpaceX", volume: "125K posts", category: "Technology" },
        { topic: "Champions League", volume: "89K posts", category: "Sports" },
        { topic: "New AI Model", volume: "45K posts", category: "Tech" },
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
        }
      ]
    };
  }
}
