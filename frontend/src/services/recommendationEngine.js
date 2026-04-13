import CROP_DATABASE from '../data/crop_data.json';
import STATE_CROP_AVERAGES from '../data/state_crop_averages.json';
import { supabase } from '../supabase';

export const generateSmartRecommendation = async (profile, soilType, waterAvailability, cropDurationType, agmarknetKeysArray) => {
    // 1. Season Detection (Auto)
    const month = new Date().getMonth() + 1;
    let season = "Summer";
    if (month >= 6 && month <= 10) season = "Kharif";
    else if (month >= 11 || month <= 3) season = "Rabi";

    // 2. Strict Filtering
    let filteredCrops = CROP_DATABASE.filter(crop =>
        crop.crop_duration_type === cropDurationType &&
        crop.water_need === waterAvailability &&
        (crop.conditions.soil_types.includes(soilType) || crop.conditions.soil_types.includes('Alluvial Soil')) &&
        (crop.conditions.seasons.includes(season) || crop.conditions.seasons.includes('Perennial'))
    );

    // Fallback padding if strict filter yields fewer than 5 crops
    // IMPORTANT: Even in the fallback, we MUST respect the duration plan!
    // A farmer needing a 3-month crop cannot plant a 10-year perennial orchard.
    if (filteredCrops.length < 5) {
        const strictNames = new Set(filteredCrops.map(c => c.name));
        const looseCrops = CROP_DATABASE.filter(crop => 
             crop.crop_duration_type === cropDurationType && // MUST STRICTLY MATCH DURATION
             (crop.water_need === waterAvailability || crop.conditions.soil_types.includes(soilType)) &&
             !strictNames.has(crop.name)
        );
        filteredCrops = [...filteredCrops, ...looseCrops];
    }

    const [district, state] = profile.location.split(',').map(s => s.trim());
    
    // 3. Market Price API Call
    const rawEvaluations = await Promise.all(filteredCrops.map(async (crop) => {
        let marketPrice = 0;
        let definitiveNoMarket = false;
        // 0. Check GLOBAL Supabase Knowledge Base (Shared by all users)
        try {
            const deterministicId = `${state}-${crop.api_name}`.replace(/\s+/g, '-').toLowerCase();
            const { data: dbPrice, error: dbError } = await supabase
                .from('market_prices')
                .select('price, updated_at')
                .eq('id', deterministicId)
                .single();
                
            if (dbPrice && !dbError) {
                const updatedTime = new Date(dbPrice.updated_at).getTime();
                // State-Level Daily Refresh Check
                if (Date.now() - updatedTime < 24 * 60 * 60 * 1000) {
                    marketPrice = dbPrice.price;
                    console.log(`[State Cache] Used Database price for ${crop.name} in ${state}`);
                }
            }
        } catch (e) {
            // Table might not exist yet, or RLS block, ignore and continue to API
        }

        // Use Pre-downloaded Local State Averages Instead of Live API
        if (marketPrice === 0) {
            const localData = STATE_CROP_AVERAGES.find(
                item => item.state.toLowerCase() === state.toLowerCase() && 
                        item.commodity.toLowerCase() === crop.api_name.toLowerCase()
            );

            if (localData) {
                marketPrice = localData.average_price;
                console.log(`[Local Data Engine] Found offline price for ${crop.name} in ${state}: ₹${marketPrice}`);
            } else {
                definitiveNoMarket = true;
                console.log(`[Local Data Engine] 🛑 Dropping ${crop.name} - No offline market data found in ${state}`);
            }
        }

        // User requested algorithm change: If NO data for this crop, DO NOT recommend it!
        if (definitiveNoMarket) {
            return null; 
        }

        if (!marketPrice || isNaN(marketPrice)) {
            // Calculate a realistic breakeven point based on modern costs
            const breakEven = crop.economics.cost_per_acre / crop.economics.avg_yield_per_acre;
            
            // Generate deterministic offline market price stable across reloads
            const seed = crop.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            
            // Use 2.1x as conservative base margin to account for MSP (Minimum Support Price) 
            // and missing fixed land costs in the simple breakeven equation.
            const deterministicMargin = 2.1 + ((seed % 10) * 0.08); 
            marketPrice = Math.round((breakEven * deterministicMargin) / 10) * 10;
        }

        // 4. Detailed Economic Modeling (Realistic / Average Case)
        // Real-world farming includes post-harvest losses, mandi commissions, and transit costs.
        // We dampen the theoretical ideal gross revenue by 25% to reflect an average, realistic farmer take-home.
        const idealGrossRevenue = crop.economics.avg_yield_per_acre * marketPrice;
        const realisticGrossRevenue = idealGrossRevenue * 0.75;
        const profitPerAcre = realisticGrossRevenue - crop.economics.cost_per_acre;
        
        let landSize = 5; // Default fallback
        if (profile.land_size) {
            const parsed = parseFloat(profile.land_size);
            if (!isNaN(parsed) && parsed > 0) {
                landSize = parsed;
            }
        }
        
        const totalProfit = profitPerAcre * landSize;
        
        // Realistic Farm Economics: Even if a short_term crop takes 4 months, the land is 
        // realistically occupied for a 6 month block (due to 2 seasons a year, preparation, and resting).
        let cropMonths = 6; 
        if (crop.crop_duration_type === 'long_term') cropMonths = 9;
        else if (crop.crop_duration_type === 'perennial') cropMonths = 12;

        const monthlyIncome = Math.round(totalProfit / cropMonths);

        // 5. Suitability Score
        let suitabilityScore = 0;
        if (crop.water_need === waterAvailability) suitabilityScore += 0.4;
        if (crop.crop_duration_type === cropDurationType) suitabilityScore += 0.3;
        if (crop.conditions.soil_types.includes(soilType)) suitabilityScore += 0.3;

        let reasoning = [];
        if (crop.water_need === waterAvailability) reasoning.push(`Water profile strictly matches`);
        if (crop.conditions.soil_types.includes(soilType)) reasoning.push(`Optimal for ${soilType}`);
        if (crop.crop_duration_type === cropDurationType) reasoning.push(`Matches desired term`);

        return {
            ...crop,
            suitabilityScore,
            marketPrice,
            profitPerAcre: Math.round(profitPerAcre),
            totalProfit: Math.round(totalProfit),
            monthlyIncome,
            estimatedProfit: monthlyIncome, // Map estimatedProfit alias to monthlyIncome for the 0-1 Chart Scalar
            reasons: reasoning
        };
    }));

    // Filter out the nulls (crops rejected for having no market)
    const evaluatedCrops = rawEvaluations.filter(c => c !== null);

    // If all crops were rejected because of the market, safety fallback:
    if (evaluatedCrops.length === 0) {
       console.log(`[Agmarknet Engine] All strictly matched crops had no market. Returning top 5 overall.`);
       return filteredCrops.slice(0, 5).map(crop => ({ ...crop, finalScore: 0, estimatedProfit: 1, profitPerAcre: 1, totalProfit: 1, monthlyIncome: 1, marketPrice: 1, reasons: ["Emergency Fallback: No market data"] }));
    }

    // 6. Dynamic Profit Normalization (Calculate max profit among survivors)
    const maxProfit = Math.max(...evaluatedCrops.map(c => c.estimatedProfit), 1);

    // 7. Final Score Assignment
    evaluatedCrops.forEach(crop => {
        let profitScore = Math.max(crop.estimatedProfit / maxProfit, 0); // Normalized exactly to true relative max
        const finalScore = (crop.suitabilityScore * 0.6) + (profitScore * 0.4);
        crop.finalScore = Math.round(finalScore * 100);
    });

    // 8. Output Ranking
    evaluatedCrops.sort((a, b) => b.finalScore - a.finalScore);
    return evaluatedCrops.slice(0, 5);
};
