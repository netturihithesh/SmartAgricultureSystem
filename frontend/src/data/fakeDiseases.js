export const fakeDiseases = [
  { disease: "Downy Mildew", treatment: "1. Improve air circulation\n2. Apply copper-based fungicide\n3. Reduce overhead watering" },
  { disease: "Powdery Mildew", treatment: "1. Apply sulfur fungicide\n2. Remove infected plant debris\n3. Ensure adequate spacing" },
  { disease: "Leaf Blight", treatment: "1. Prune affected leaves\n2. Apply broad-spectrum fungicide\n3. Avoid wetting foliage during irrigation" },
  { disease: "Rust Fungus", treatment: "1. Use rust-resistant varieties\n2. Apply appropriate fungicide early\n3. Destroy infected crop residue" },
  { disease: "Bacterial Wilt", treatment: "1. Remove and destroy infected plants immediately\n2. Practice crop rotation\n3. Sanitize tools between uses" },
  { disease: "Root Rot", treatment: "1. Improve soil drainage\n2. Reduce watering frequency\n3. Apply beneficial soil microbes (Trichoderma)" },
  { disease: "Stem Borer Infestation", treatment: "1. Apply systemic insecticide\n2. Use pheromone traps to monitor adult moths\n3. Destroy infested stems" },
  { disease: "Aphid Colony", treatment: "1. Introduce ladybugs (natural predators)\n2. Apply neem oil spray\n3. Use insecticidal soap" },
  { disease: "Whitefly Infestation", treatment: "1. Hang yellow sticky traps\n2. Spray with horticultural oil\n3. Remove heavily infested lower leaves" },
  { disease: "Leaf Miner Damage", treatment: "1. Remove affected leaves\n2. Apply Spinosad-based insecticide\n3. Use row covers to prevent egg-laying" },
  { disease: "Spider Mites", treatment: "1. Increase ambient humidity\n2. Spray foliage with water to dislodge mites\n3. Apply miticide or neem oil" },
  { disease: "Anthracnose", treatment: "1. Apply fungicide containing chlorothalonil\n2. Remove infected twigs and leaves\n3. Avoid overhead irrigation" },
  { disease: "Fusarium Wilt", treatment: "1. Solarize soil before planting\n2. Use resistant seeds\n3. Adjust soil pH to neutral" },
  { disease: "Botrytis (Gray Mold)", treatment: "1. Improve ventilation around plants\n2. Avoid working among wet plants\n3. Apply targeted fungicide during damp weather" },
  { disease: "Mosaic Virus", treatment: "1. Immediately uproot and burn infected plants\n2. Control aphid vectors\n3. Disinfect gardening tools" },
  { disease: "Root-Knot Nematodes", treatment: "1. Plant marigolds as a natural deterrent\n2. Practice strict crop rotation\n3. Solarize affected soil beds" },
  { disease: "Thrips Damage", treatment: "1. Set up blue sticky traps\n2. Apply Spinosad spray\n3. Release predatory mites" },
  { disease: "Bacterial Leaf Spot", treatment: "1. Spray copper-based bactericide\n2. Avoid overhead watering\n3. Increase plant spacing for airflow" },
  { disease: "Smut Fungus", treatment: "1. Remove galls before they burst\n2. Treat seeds with fungicide before planting\n3. Rotate crops annually" },
  { disease: "Canker Lesions", treatment: "1. Prune out infected branches during dry weather\n2. Sterilize pruners between cuts\n3. Apply protective copper spray" },
  { disease: "Nutrient Chlorosis", treatment: "1. Apply balanced foliar micronutrients\n2. Check and adjust soil pH\n3. Ensure adequate nitrogen and iron levels" },
  { disease: "Mealybug Infestation", treatment: "1. Dab pests with rubbing alcohol\n2. Apply insecticidal soap\n3. Introduce green lacewings" },
  { disease: "Cutworm Damage", treatment: "1. Place cardboard collars around seedling stems\n2. Apply diatomaceous earth around base\n3. Hand-pick worms at night" },
  { disease: "Armyworm Invasion", treatment: "1. Apply Bacillus thuringiensis (Bt) spray\n2. Introduce parasitic wasps\n3. Deep plow soil to expose pupae" },
  { disease: "Web Blight", treatment: "1. Reduce planting density\n2. Apply appropriate systemic fungicide\n3. Maintain dry field conditions" },
  { disease: "Sclerotinia Stem Rot", treatment: "1. Ensure excellent soil drainage\n2. Avoid dense canopies\n3. Rotate with non-host crops like corn" },
  { disease: "Crown Gall", treatment: "1. Plant disease-free nursery stock\n2. Avoid injuring roots during transplanting\n3. Remove and burn affected plants" },
  { disease: "Bacterial Soft Rot", treatment: "1. Harvest only in dry conditions\n2. Cure crops properly before storage\n3. Ensure storage areas are cool and well-ventilated" },
  { disease: "Damping Off", treatment: "1. Start seeds in sterile potting mix\n2. Avoid overwatering seedlings\n3. Ensure good light and air circulation" },
  { disease: "Scale Insects", treatment: "1. Prune heavily infested branches\n2. Apply dormant oil in early spring\n3. Scrub scales off with a soft brush" }
];

export const getRandomDetection = () => {
  const randomIdx = Math.floor(Math.random() * fakeDiseases.length);
  const selected = fakeDiseases[randomIdx];
  
  const severities = [
    "Mild Infection (5-10% surface area)",
    "Moderate Infection (15-30% surface area)",
    "Severe Infestation (Requires immediate action)",
    "Early Stage Detection (Easily treatable)",
    "Critical Outbreak (High risk of spread)"
  ];
  
  const confidences = [
    "92.4% AI Match", "96.8% AI Match", "89.1% AI Match", 
    "98.2% AI Match", "94.5% AI Match", "91.7% AI Match"
  ];
  
  return {
    disease_name: selected.disease,
    confidence_level: confidences[Math.floor(Math.random() * confidences.length)],
    cause: severities[Math.floor(Math.random() * severities.length)],
    treatment: selected.treatment
  };
};
