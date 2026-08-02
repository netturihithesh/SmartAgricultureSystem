// Shared profit calculation utility — single source of truth for Smart Agriculture System
// Accurately calculates Expected Yield, Market Price, Gross Revenue, Input Cost, Net Profit, and Monthly Income.

const CROP_MARKET_PRICES = {
  'paddy (basmati)': 3800,
  'paddy (common)': 2300,
  'paddy': 2500,
  'cotton': 7120,
  'sugarcane': 315,
  'turmeric': 13500,
  'mango': 4500,
  'chili': 18000,
  'chilli': 18000,
  'maize': 2225,
  'banana': 1800,
  'tomato': 2000,
  'potato': 1500,
  'onion': 2400,
  'bajra': 2500,
  'jowar': 3180,
  'groundnut': 6375,
  'soybean': 4600,
  'wheat': 2275,
};

export const getMarketPricePerQ = (cropName) => {
  if (!cropName) return 2300;
  const name = cropName.toLowerCase().trim();
  for (const [key, price] of Object.entries(CROP_MARKET_PRICES)) {
    if (name.includes(key) || key.includes(name)) {
      return price;
    }
  }
  return 2400; // Default average market price per quintal
};

export const calculateProfitSnapshot = (cropEconomics, landSize, totalDurationDays, cropName = '', weatherYieldImpact = 0) => {
  const land = parseFloat(landSize) || 1.5;
  const yieldPerAcre = cropEconomics?.avg_yield_per_acre || 20;
  const costPerAcre = cropEconomics?.cost_per_acre || 24000;
  const marketPricePerQ = getMarketPricePerQ(cropName || cropEconomics?.name);

  // Weather-adjusted yield per acre
  const adjustedYieldPerAcre = yieldPerAcre * (1 + (weatherYieldImpact || 0));
  const totalYield = Math.round(adjustedYieldPerAcre * land);

  const totalCost = Math.round(costPerAcre * land);
  const revenue = Math.round(totalYield * marketPricePerQ);
  const totalProfit = Math.max(0, revenue - totalCost);

  // Duration in months
  let durationMonths = Math.max(1, Math.ceil((totalDurationDays || 120) / 30));

  const monthlyIncome = Math.round(totalProfit / durationMonths);

  return {
    totalYield,
    totalCost,
    revenue,
    totalProfit,
    monthlyIncome,
    marketPricePerQ,
    costPerAcre,
    yieldPerAcre: Math.round(adjustedYieldPerAcre),
  };
};
