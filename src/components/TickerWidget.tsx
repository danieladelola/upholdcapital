"use client"

import { useEffect } from "react"

export default function TradingViewTickerTape() {
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"
    script.async = true
    script.innerHTML = JSON.stringify({
      symbols: [
        {
          proName: "FOREXCOM:SPXUSD",
          title: "S&P 500",
        },
        {
          proName: "FOREXCOM:NSXUSD",
          title: "US 100",
        },
        {
          proName: "FX_IDC:EURUSD",
          title: "EUR/USD",
        },
        {
          proName: "BITSTAMP:BTCUSD",
          title: "Bitcoin",
        },
        {
          proName: "BITSTAMP:ETHUSD",
          title: "Ethereum",
        },
      ],
      showSymbolLogo: true,
      colorTheme: "light",
      isTransparent: false,
      displayMode: "adaptive",
      locale: "en",
    })

    const container = document.getElementById("tradingview-widget-container")
    if (container) {
      container.appendChild(script)
    }

    return () => {
      if (container) {
        const widgetContainer = container.querySelector(".tradingview-widget-container")
        if (widgetContainer) {
          container.removeChild(widgetContainer)
        }
      }
    }
  }, [])

  return (
    <div id="tradingview-widget-container" className="tradingview-widget-container">
      <div className="tradingview-widget-container__widget"></div>
    </div>
  )
}

