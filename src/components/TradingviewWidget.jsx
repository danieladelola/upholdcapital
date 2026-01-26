// TradingViewWidget.jsx
import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget({ symbol = "NASDAQ:TSLA" }) {
  const container = useRef(null);

  useEffect(() => {
    const current = container.current;
    if (!current) return;

    // clear
    current.innerHTML = '';

    // create inner div for widget
    const widgetDiv = document.createElement('div');
    const widgetId = `tradingview_${Math.random().toString(36).slice(2)}`;
    widgetDiv.id = widgetId;
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';
    current.appendChild(widgetDiv);

    // load script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;

    script.onload = () => {
      try {
        if (window.TradingView && typeof window.TradingView.widget === 'function') {
          new window.TradingView.widget({
            autosize: true,
            symbol: symbol,
            interval: 'D',
            timezone: 'Etc/UTC',
            theme: 'dark',
            style: '1',
            locale: 'en',
            container_id: widgetId,
            allow_symbol_change: true,
            studies: [],
          });
        }
      } catch (e) {
        // fail silently
      }
    };

    document.head.appendChild(script);

    return () => {
      // cleanup
      if (script.parentNode) script.parentNode.removeChild(script);
      if (widgetDiv.parentNode) widgetDiv.parentNode.removeChild(widgetDiv);
    };
  }, [symbol]);

  return (
    <div className="tradingview-widget-container h-full" ref={container} style={{ height: '100%', width: '100%' }} />
  );
}

export default memo(TradingViewWidget);
