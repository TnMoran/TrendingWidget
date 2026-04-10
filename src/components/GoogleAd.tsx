import { useEffect } from 'react';

interface GoogleAdProps {
  className?: string;
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
}

export function GoogleAd({ className, slot, format = 'auto' }: GoogleAdProps) {
  const clientId = (import.meta as any).env.VITE_GOOGLE_ADS_CLIENT_ID;
  const adSlot = slot || (import.meta as any).env.VITE_GOOGLE_ADS_SLOT_ID;

  useEffect(() => {
    // Only try to push if we are in a browser and adsbygoogle is defined
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  // If no client ID is provided, show a placeholder for development
  if (!clientId || clientId.includes('XXXX')) {
    return (
      <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-6 text-center ${className}`}>
        <div className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded mb-2 uppercase tracking-wider">
          Ad Space Placeholder
        </div>
        <p className="text-xs text-gray-500 font-medium">
          Google Ads will appear here once you configure your Client ID and Slot ID in .env
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
