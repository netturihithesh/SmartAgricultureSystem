import CROP_DATABASE from '../data/crop_data.json';

export const generateSmartRecommendation = async (profile, soilType, waterAvailability, cropDurationType, agmarknetKey) => {
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
    if (filteredCrops.length < 5) {
        const strictNames = new Set(filteredCrops.map(c => c.name));
        const looseCrops = CROP_DATABASE.filter(crop => 
             (crop.water_need === waterAvailability || crop.conditions.soil_types.includes(soilType)) &&
             !strictNames.has(crop.name)
        );
        filteredCrops = [...filteredCrops, ...looseCrops];
    }

    const [district, state] = profile.location.split(',').map(s => s.trim());
    
    // 3. Market Price API Call
    const evaluatedCrops = await Promise.all(filteredCrops.map(async (crop) => {
        let marketPrice = 0;
        try {
            if (agmarknetKey) {
                const url = `https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24?api-key=${agmarknetKey}&format=json&filters[State]=${state}&filters[District]=${district}&filters[Commodity]=${encodeURIComponent(crop.api_name)}`;
                const agRes = await fetch(url);
                const agData = await agRes.json();
                
                if (agData.records && agData.records.length > 0) {
                    marketPrice = parseInt(agData.records[0].Modal_Price);
                }
            }
        } catch (e) {
            console.warn(`Agmarknet failure for ${crop.name}`, e);
        }

        if (!marketPrice || isNaN(marketPrice)) {
            const breakEven = crop.economics.cost_per_acre / crop.economics.avg_yield_per_acre;
            marketPrice = Math.round((breakEven * (1.6 + Math.random() * 0.4)) / 100) * 100;
        }

        // 4. Detailed Economic Modeling
        const profitPerAcre = (crop.economics.avg_yield_per_acre * marketPrice) - crop.economics.cost_per_acre;
        
        let landSize = 5; // Default fallback
        if (profile.land_size) {
            const parsed = parseFloat(profile.land_size);
            if (!isNaN(parsed) && parsed > 0) {
                landSize = parsed;
            }
        }
        
        const totalProfit = profitPerAcre * landSize;
        
        let cropMonths = 4;
        if (crop.crop_duration_type === 'long_term') cropMonths = 6;
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
