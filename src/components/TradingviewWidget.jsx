// TradingViewWidget.jsx
import React, { useEffect, useRef, memo } from 'react';
//take assetSymbol as props
function TradingViewWidget() {
  const container = useRef();

  useEffect(() => {
    const currentContainer = container.current;

    // Create the script element
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "NASDAQ:TSLA",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "light",
        "style": "1",
        "locale": "en",
        "allow_symbol_change": true,
        "calendar": false,
        "support_host": "https://www.tradingview.com"
      }`;

    // Append the script to the container
    currentContainer.appendChild(script);

    // Cleanup on unmount
    return () => {
      if (currentContainer.contains(script)) {
        currentContainer.removeChild(script);
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  return (

    <div className="tradingview-widget-container h-full" ref={container} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
    </div>


  );
}

export default memo(TradingViewWidget);
