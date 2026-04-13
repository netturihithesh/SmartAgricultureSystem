// Shared profit calculation utility — single source of truth
// Used by ActionHome.jsx to avoid duplicating this logic in multiple places.

export const calculateProfitSnapshot = (cropEconomics, landSize, totalDurationDays) => {
  const land = parseFloat(landSize) || 1;
  const yieldPerAcre = cropEconomics?.avg_yield_per_acre || 18;
  const costPerAcre = cropEconomics?.cost_per_acre || 22000;
  const marketPricePerQ = 2300;

  const totalYield = Math.round(yieldPerAcre * land);
  const totalCost = costPerAcre * land;
  const revenue = totalYield * marketPricePerQ;
  const totalProfit = revenue - totalCost;

  // Real-world farm economic logic: A short-term crop occupies the land for a full 6-month cycle 
  // (including prep, harvest, and rest) because farmers typically only run 2 seasons per year.
  let durationMonths = Math.max(1, totalDurationDays / 30);
  if (durationMonths <= 6) {
    durationMonths = 6;
  }

  const monthlyIncome = Math.round(totalProfit / durationMonths);

  return {
    totalYield,
    totalProfit: totalProfit > 0 ? totalProfit : 0,
    monthlyIncome: monthlyIncome > 0 ? monthlyIncome : 0,
    marketPricePerQ,
  };
};
