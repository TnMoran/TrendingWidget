import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Share2, 
  RefreshCw, 
  TrendingUp, 
  MessageCircle, 
  Heart, 
  Repeat2, 
  Twitter,
  ChevronRight,
  Info
} from 'lucide-react';
import { cn } from './lib/utils';
import { getTrendingData, type TrendingData } from './services/trendingService';
import { GoogleAd } from './components/GoogleAd';

export default function App() {
  const [data, setData] = useState<TrendingData | null>(null);
  const [currentTweetIndex, setCurrentTweetIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const [isWidgetMode, setIsWidgetMode] = useState(false);
  const [isKeyMissing, setIsKeyMissing] = useState(false);

  useEffect(() => {
    // Check if we are in widget mode via URL param
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'widget') {
      setIsWidgetMode(true);
    }

    // Check if API key is missing (for UI warning)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "undefined") {
      setIsKeyMissing(true);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    const newData = await getTrendingData();
    setData(newData);
    setCurrentTweetIndex(0);
    setIsLoading(false);
    setIsRefreshing(false);
    setClickCount(0);
    setShowAd(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const nextTweet = () => {
    if (!data) return;

    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    // Show an ad every 3 clicks
    if (newClickCount % 3 === 0) {
      setShowAd(true);
    } else {
      setShowAd(false);
      setCurrentTweetIndex((prev) => (prev + 1) % data.tweets.length);
    }
  };

  const skipAd = () => {
    if (!data) return;
    setShowAd(false);
    setCurrentTweetIndex((prev) => (prev + 1) % data.tweets.length);
  };

  const shareTweet = async () => {
    if (!data) return;
    const tweet = data.tweets[currentTweetIndex];
    const text = `"${tweet.content}" - ${tweet.authorName} (${tweet.authorHandle})`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Trending on X',
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  };

  const currentTweet = data?.tweets[currentTweetIndex];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9F9] flex items-center justify-center p-4 font-sans">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-gray-500 font-medium">Fetching trends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen bg-[#F7F9F9] text-[#0F1419] font-sans flex flex-col items-center",
      isWidgetMode ? "p-2 justify-center" : "p-4 md:p-8"
    )}>
      <div className="w-full max-w-md space-y-6">
        {/* API Key Warning */}
        {isKeyMissing && !isWidgetMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
            <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-amber-900">Configuración incompleta</p>
              <p className="text-xs text-amber-800 leading-relaxed">
                Falta la variable de entorno <code className="bg-amber-100 px-1 rounded">GEMINI_API_KEY</code> en Vercel. 
                La app está usando datos de prueba. Configúrala en el dashboard de Vercel para ver tendencias reales.
              </p>
            </div>
          </div>
        )}

        {/* Header - Hidden in widget mode */}
        {!isWidgetMode && (
          <header className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="bg-black p-2 rounded-xl">
                <Twitter className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">X Trends</h1>
            </div>
            <button 
              onClick={fetchData}
              disabled={isRefreshing}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("w-5 h-5 text-gray-600", isRefreshing && "animate-spin")} />
            </button>
          </header>
        )}

        {/* Featured Tweet Widget OR Ad Interstitial */}
        <section className={cn("relative", !isWidgetMode && "min-h-[320px]")}>
          <AnimatePresence mode="wait">
            {showAd ? (
              <motion.div
                key="ad-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-[2rem] p-6 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Info className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Sponsored</span>
                  </div>
                </div>
                
                <GoogleAd className="min-h-[150px]" />

                <div className="pt-4">
                  <button 
                    onClick={skipAd}
                    className="w-full bg-blue-500 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all active:scale-95"
                  >
                    Continue to Tweets
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={currentTweet?.id || 'empty'}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={cn(
                  "bg-white p-6 shadow-xl border border-gray-100 flex flex-col gap-4",
                  isWidgetMode ? "rounded-[1.5rem]" : "rounded-[2rem] shadow-gray-200/50"
                )}
              >
                {currentTweet ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={currentTweet.avatarUrl} 
                          alt={currentTweet.authorName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-100"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-bold text-sm leading-tight">{currentTweet.authorName}</p>
                          <p className="text-gray-500 text-xs">{currentTweet.authorHandle}</p>
                        </div>
                      </div>
                      <div className="text-gray-400">
                        <Twitter className="w-4 h-4" />
                      </div>
                    </div>

                    <p className={cn(
                      "leading-relaxed font-medium",
                      isWidgetMode ? "text-sm" : "text-[17px]"
                    )}>
                      {currentTweet.content}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-4 text-gray-500 text-xs">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{currentTweet.retweets}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Repeat2 className="w-3.5 h-3.5" />
                          <span>{currentTweet.retweets}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5" />
                          <span>{currentTweet.likes}</span>
                        </div>
                      </div>
                      <span className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">
                        {currentTweet.timestamp}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button 
                        onClick={nextTweet}
                        className="flex-1 bg-black text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {isWidgetMode ? "Next" : "Next Tweet"}
                      </button>
                      {!isWidgetMode && (
                        <button 
                          onClick={shareTweet}
                          className="w-12 bg-gray-100 text-black py-3 rounded-xl font-bold flex items-center justify-center hover:bg-gray-200 transition-all active:scale-95"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="h-40 flex items-center justify-center text-gray-400 italic text-sm">
                    No tweets found
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Trending Topics Widget - Hidden in widget mode */}
        {!isWidgetMode && (
          <section className="bg-white rounded-[2rem] p-6 shadow-lg shadow-gray-200/30 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold">Trending Topics</h2>
            </div>
            
            <div className="space-y-4">
              {data?.topics.map((topic, idx) => (
                <motion.div 
                  key={topic.topic}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                      {topic.category} · Trending
                    </p>
                    <p className="font-bold text-[15px] group-hover:text-blue-600 transition-colors">
                      {topic.topic}
                    </p>
                    <p className="text-xs text-gray-500">
                      {topic.volume}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </motion.div>
              ))}
            </div>

            <button className="w-full mt-6 text-blue-500 font-bold text-sm hover:underline flex items-center justify-center gap-1">
              Show more
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Banner Ad Space at the bottom of Trends */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <GoogleAd format="rectangle" className="min-h-[100px]" />
            </div>
          </section>
        )}

        {/* Footer Info */}
        <footer className="text-center px-4 pb-8">
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">
            {isWidgetMode ? "X Trends Widget" : "Powered by Gemini AI • Ad-Supported Widget"}
          </p>
        </footer>
      </div>
    </div>
  );
}
