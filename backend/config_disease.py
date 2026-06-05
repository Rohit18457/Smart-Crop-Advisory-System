"""
Disease Class Names & Solutions
================================
39 plant disease classes and their treatment information.
Split from config.py for maintainability.
"""

# ── Disease Class Names (39 classes — order matches training dataset) ─────────
DISEASE_CLASS_NAMES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Background_without_leaves",
    "Blueberry___healthy",
    "Cherry___Powdery_mildew",
    "Cherry___healthy",
    "Corn___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn___Common_rust",
    "Corn___Northern_Leaf_Blight",
    "Corn___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
]

# ── Disease Solutions ──────────────────────────────────────────────────────────
DISEASE_SOLUTIONS = {
    "Apple___Apple_scab": {
        "disease": "Apple Scab",
        "cause": "Fungus Venturia inaequalis",
        "solution": "Apply fungicides such as captan or myclobutanil during early spring. Remove fallen infected leaves to reduce overwintering spores. Choose scab-resistant apple varieties for new plantings.",
    },
    "Apple___Black_rot": {
        "disease": "Apple Black Rot",
        "cause": "Fungus Botryosphaeria obtusa",
        "solution": "Prune and destroy infected branches and mummified fruit. Apply fungicides like captan or thiophanate-methyl. Maintain good tree hygiene and proper air circulation.",
    },
    "Apple___Cedar_apple_rust": {
        "disease": "Cedar Apple Rust",
        "cause": "Fungus Gymnosporangium juniperi-virginianae",
        "solution": "Remove nearby cedar/juniper trees if possible. Apply fungicides such as myclobutanil at bloom stage. Plant rust-resistant apple cultivars.",
    },
    "Apple___healthy": {
        "disease": "No Disease",
        "cause": "N/A",
        "solution": "Your apple plant is healthy! Continue regular care: adequate watering, balanced fertilization, and seasonal pruning.",
    },
    "Background_without_leaves": {
        "disease": "No Leaf Detected",
        "cause": "N/A",
        "solution": "No plant leaf was detected in the image. Please upload a clear image of a plant leaf for disease diagnosis.",
    },
    "Blueberry___healthy": {
        "disease": "No Disease",
        "cause": "N/A",
        "solution": "Your blueberry plant is healthy! Maintain acidic soil (pH 4.5–5.5), regular mulching, and adequate watering.",
    },
    "Cherry___Powdery_mildew": {
        "disease": "Cherry Powdery Mildew",
        "cause": "Fungus Podosphaera clandestina",
        "solution": "Apply sulfur-based or potassium bicarbonate fungicides. Improve air circulation through pruning. Avoid overhead watering and ensure leaves stay dry.",
    },
    "Cherry___healthy": {
        "disease": "No Disease",
        "cause": "N/A",
        "solution": "Your cherry plant is healthy! Continue proper watering, annual pruning, and pest monitoring.",
    },
    "Corn___Cercospora_leaf_spot Gray_leaf_spot": {
        "disease": "Corn Gray Leaf Spot",
        "cause": "Fungus Cercospora zeae-maydis",
        "solution": "Rotate crops to reduce inoculum. Apply foliar fungicides like strobilurins. Plant resistant hybrids and avoid continuous corn planting.",
    },
    "Corn___Common_rust": {
        "disease": "Corn Common Rust",
        "cause": "Fungus Puccinia sorghi",
        "solution": "Plant resistant hybrids. Apply fungicides if infection occurs before tasselling. Early planting can help avoid peak rust conditions.",
    },
    "Corn___Northern_Leaf_Blight": {
        "disease": "Corn Northern Leaf Blight",
        "cause": "Fungus Exserohilum turcicum",
        "solution": "Use resistant hybrids. Apply foliar fungicides at early infection. Practice crop rotation and till infected residue into the soil.",
    },
    "Corn___healthy": {
        "disease": "No Disease",
        "cause": "N/A",
        "solution": "Your corn plant is healthy! Ensure adequate nitrogen fertilisation, proper spacing, and consistent watering.",
    },
    "Grape___Black_rot": {
        "disease": "Grape Black Rot",
        "cause": "Fungus Guignardia bidwellii",
        "solution": "Remove mummified berries and infected tendrils. Apply fungicides (myclobutanil, mancozeb) from bud break through fruit set. Improve canopy airflow.",
    },
    "Grape___Esca_(Black_Measles)": {
        "disease": "Grape Esca (Black Measles)",
        "cause": "Complex of fungi including Phaeomoniella and Phaeoacremonium",
        "solution": "There is no proven cure. Prune out infected wood well below visible symptoms. Protect pruning wounds with appropriate sealant. Remove severely infected vines.",
    },
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
        "disease": "Grape Leaf Blight",
        "cause": "Fungus Pseudocercospora vitis",
        "solution": "Apply copper-based fungicides. Remove infected foliage. Improve air circulation through canopy management and avoid overhead irrigation.",
    },
    "Grape___healthy": {
        "disease": "No Disease",
        "cause": "N/A",
        "solution": "Your grape plant is healthy! Continue regular pruning, balanced nutrition, and monitoring for pests.",
    },
    "Orange___Haunglongbing_(Citrus_greening)": {
        "disease": "Citrus Greening (Huanglongbing)",
        "cause": "Bacterium Candidatus Liberibacter asiaticus, spread by Asian citrus psyllid",
        "solution": "There is no cure. Control the psyllid vector with insecticides. Remove and destroy infected trees promptly. Plant certified disease-free nursery stock.",
    },
    "Peach___Bacterial_spot": {
        "disease": "Peach Bacterial Spot",
        "cause": "Bacterium Xanthomonas arboricola pv. pruni",
        "solution": "Apply copper-based bactericides during dormant season. Avoid overhead irrigation. Plant resistant cultivars and maintain tree vigour.",
    },
    "Peach___healthy": {
        "disease": "No Disease",
        "cause": "N/A",
        "solution": "Your peach plant is healthy! Continue annual pruning, balanced fertilisation, and pest monitoring.",
    },
    "Pepper,_bell___Bacterial_spot": {
        "disease": "Bell Pepper Bacterial Spot",
        "cause": "Bacterium Xanthomonas campestris pv. vesicatoria",
        "solution": "Use certified disease-free seed. Apply copper-based sprays early. Practice crop rotation and avoid working with wet plants.",
    },
    "Pepper,_bell___healthy": {
        "disease": "No Disease",
        "cause": "N/A",
        "solution": "Your bell pepper is healthy! Ensure consistent watering, warm temperatures, and adequate calcium to prevent blossom end rot.",
    },
    "Potato___Early_blight": {
        "disease": "Potato Early Blight",
        "cause": "Fungus Alternaria solani",
        "solution": "Apply fungicides like chlorothalonil or mancozeb preventatively. Practice crop rotation. Remove and destroy affected plant debris after harvest.",
    },
    "Potato___Late_blight": {
        "disease": "Potato Late Blight",
        "cause": "Oomycete Phytophthora infestans",
        "solution": "Apply fungicides (metalaxyl, chlorothalonil) immediately at first sign. Destroy infected plants. Use certified disease-free seed potatoes and resistant varieties.",
    },
    "Potato___healthy": {
        "disease": "No Disease",
        "cause": "N/A",
        "solution": "Your potato plant is healthy! Continue hilling, consistent watering, and watch for Colorado potato beetles.",
    },
    "Raspberry___healthy": {
        "disease": "No Disease",
        "cause": "N/A",
        "solution": "Your raspberry plant is healthy! Maintain trellising, annual cane pruning, and mulching for root protection.",
    },
    "Soybean___healthy": {
        "disease": "No Disease",
        "cause": "N/A",
        "solution": "Your soybean plant is healthy! Ensure proper inoculation with rhizobium, adequate spacing, and weed management.",
    },
    "Squash___Powdery_mildew": {
        "disease": "Squash Powdery Mildew",
        "cause": "Fungus Podosphaera xanthii",
        "solution": "Apply neem oil or potassium bicarbonate. Ensure good air circulation and avoid overhead watering. Plant resistant varieties where available.",
    },
    "Strawberry___Leaf_scorch": {
        "disease": "Strawberry Leaf Scorch",
        "cause": "Fungus Diplocarpon earlianum",
        "solution": "Remove and destroy infected leaves. Apply fungicides like captan. Renovate beds after harvest and ensure adequate spacing for airflow.",
    },
    "Strawberry___healthy": {
        "disease": "No Disease",
        "cause": "N/A",
        "solution": "Your strawberry plant is healthy! Maintain mulching, drip irrigation, and runner management for best yields.",
    },
    "Tomato___Bacterial_spot": {
        "disease": "Tomato Bacterial Spot",
        "cause": "Bacterium Xanthomonas spp.",
        "solution": "Apply copper-based bactericides early. Use pathogen-free seed and transplants. Rotate crops and avoid overhead watering.",
    },
    "Tomato___Early_blight": {
        "disease": "Tomato Early Blight",
        "cause": "Fungus Alternaria solani",
        "solution": "Apply fungicides like chlorothalonil. Mulch to prevent soil splash. Remove lower infected leaves and practice crop rotation.",
    },
    "Tomato___Late_blight": {
        "disease": "Tomato Late Blight",
        "cause": "Oomycete Phytophthora infestans",
        "solution": "Apply fungicides (mefenoxam, chlorothalonil) immediately. Remove and destroy all infected plants. Avoid overhead watering and plant resistant varieties.",
    },
    "Tomato___Leaf_Mold": {
        "disease": "Tomato Leaf Mold",
        "cause": "Fungus Passalora fulva",
        "solution": "Improve greenhouse ventilation. Apply fungicides if necessary. Remove affected foliage and avoid wetting leaves during watering.",
    },
    "Tomato___Septoria_leaf_spot": {
        "disease": "Tomato Septoria Leaf Spot",
        "cause": "Fungus Septoria lycopersici",
        "solution": "Apply fungicides like chlorothalonil or mancozeb. Remove infected lower leaves. Practice crop rotation and use mulch to prevent splash.",
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "disease": "Tomato Spider Mites",
        "cause": "Two-spotted spider mite (Tetranychus urticae)",
        "solution": "Spray with insecticidal soap or neem oil. Increase humidity around plants. Introduce predatory mites (Phytoseiulus persimilis) for biological control.",
    },
    "Tomato___Target_Spot": {
        "disease": "Tomato Target Spot",
        "cause": "Fungus Corynespora cassiicola",
        "solution": "Apply fungicides like chlorothalonil. Remove infected debris. Ensure good air circulation and avoid overhead watering.",
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "disease": "Tomato Yellow Leaf Curl Virus",
        "cause": "Begomovirus transmitted by whiteflies (Bemisia tabaci)",
        "solution": "Control whiteflies with insecticides or yellow sticky traps. Remove infected plants immediately. Use virus-resistant tomato varieties and reflective mulches.",
    },
    "Tomato___Tomato_mosaic_virus": {
        "disease": "Tomato Mosaic Virus",
        "cause": "Tobamovirus",
        "solution": "Remove and destroy infected plants. Disinfect tools with 10% bleach. Plant resistant varieties and avoid tobacco products near plants (cross-infection risk).",
    },
    "Tomato___healthy": {
        "disease": "No Disease",
        "cause": "N/A",
        "solution": "Your tomato plant is healthy! Continue consistent watering, staking/caging, and balanced fertilisation with calcium.",
    },
}
