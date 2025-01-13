export function getDefaultPortfolios() {
  const portfolios = [
    {
      id: 1,
      name: "Bing.x",
      icon: "B",
      iconBg: "bg-cyan-500",
      coins: [
        {
          name: "Ninja Squad Token",
          symbol: "NST",
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/16473.png",
          price: 4.72,
          change1h: 1.2,
          change24h: -3.15,
          change7d: -12.04,
          balance: 167,
          value: 788.24,
          allocation: 100,
        },
      ],
    },
    {
      id: 2,
      name: "Binance",
      icon: "B",
      iconBg: "bg-purple-500",
      coins: [
        {
          name: "Aave",
          symbol: "AAVE",
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/7278.png",
          price: 267.03,
          change1h: -1.43,
          change24h: -6.99,
          change7d: -21.16,
          balance: 2.35,
          value: 628.77,
          allocation: 22.11,
        },
        {
          name: "Avalanche",
          symbol: "AVAX",
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
          price: 34.34,
          change1h: -0.67,
          change24h: -6.21,
          change7d: -21.61,
          balance: 14.74,
          value: 506.36,
          allocation: 17.83,
        },
        {
          name: "Fantom",
          symbol: "FTM",
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/3513.png",
          price: 0.827,
          change1h: 0,
          change24h: 0,
          change7d: 0,
          balance: 458.54,
          value: 379.08,
          allocation: 13.28,
        },
        {
          name: "Arkham",
          symbol: "ARKM",
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/24478.png",
          price: 1.2365,
          change1h: -1.03,
          change24h: -8.02,
          change7d: -24.84,
          balance: 248.91,
          value: 307.79,
          allocation: 10.8,
        },
        {
          name: "Fetch.ai",
          symbol: "FET",
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/3773.png",
          price: 1.2076,
          change1h: -0.8,
          change24h: -7.2,
          change7d: -23.63,
          balance: 247.92,
          value: 299.41,
          allocation: 10.53,
        },
        {
          name: "Pepe",
          symbol: "PEPE",
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/24478.png",
          price: 0.00001668,
          change1h: -1.14,
          change24h: -4.95,
          change7d: -18.67,
          balance: 14900000,
          value: 248.32,
          allocation: 8.73,
        },
        {
          name: "Render",
          symbol: "RNDR",
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/7288.png",
          price: 6.6761,
          change1h: -1.01,
          change24h: -7.22,
          change7d: -21.78,
          balance: 34.22,
          value: 228.49,
          allocation: 8.02,
        },
        {
          name: "Pixels",
          symbol: "PIXEL",
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/28468.png",
          price: 0.1269,
          change1h: -3.0,
          change24h: -9.05,
          change7d: -26.42,
          balance: 759.87,
          value: 96.43,
          allocation: 3.39,
        },
        {
          name: "Worldcoin",
          symbol: "WLD",
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/24275.png",
          price: 1.9768,
          change1h: -1.04,
          change24h: -7.98,
          change7d: -19.58,
          balance: 48.06,
          value: 95.01,
          allocation: 3.34,
        },
      ],
    },
    {
      id: 3,
      name: "Gate.io",
      icon: "G",
      iconBg: "bg-orange-500",
      coins: [
        {
          name: "Pangolin",
          symbol: "PNG",
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/8422.png",
          price: 0.3001,
          change1h: -0.57,
          change24h: -2.75,
          change7d: -11.65,
          balance: 783.14,
          value: 235.01,
          allocation: 30.15,
        },
        {
          name: "TARS AI",
          symbol: "TAI",
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/28878.png",
          price: 0.2577,
          change1h: -2.4,
          change24h: -12.17,
          change7d: -24.44,
          balance: 797,
          value: 205.35,
          allocation: 26.35,
        },
        {
          name: "Wojak",
          symbol: "WOJAK",
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/24615.png",
          price: 0.0006697,
          change1h: -3.68,
          change24h: -13.81,
          change7d: -35.56,
          balance: 290569,
          value: 194.6,
          allocation: 24.98,
        },
        {
          name: "Popcat (SOL)",
          symbol: "POPCAT",
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/24742.png",
          price: 0.513,
          change1h: -2.88,
          change24h: -10.55,
          change7d: -40.86,
          balance: 229.54,
          value: 117.75,
          allocation: 15.11,
        },
        {
          name: "Just a chill guy",
          symbol: "CHILLGUY",
          icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/28944.png",
          price: 0.1087,
          change1h: -2.94,
          change24h: -13.5,
          change7d: -48.03,
          balance: 240,
          value: 26.08,
          allocation: 3.41,
        },
      ],
    },
  ];

  // Her portföy için değerleri hesapla
  portfolios.forEach(portfolio => {
    portfolio.value = portfolio.coins.reduce((sum, coin) => sum + coin.value, 0);
    portfolio.change24h = portfolio.coins.reduce((sum, coin) => sum + (coin.value * coin.change24h) / 100, 0);
  });

  return portfolios;
}
