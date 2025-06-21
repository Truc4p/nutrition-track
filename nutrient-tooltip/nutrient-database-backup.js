// Comprehensive Nutrient Database with all 218 USDA nutrients
const NUTRIENT_DATABASE = {
    // ENERGY & MACRONUTRIENTS
    "Energy": {
        category: "Energy",
        explanation: "Total energy content of food, measured in calories (kcal) or kilojoules (kJ). Essential for all body functions.",
        importance: "high",
        unit: "kcal"
    },
    "Energy (Atwater General Factors)": {
        category: "Energy",
        explanation: "Energy calculated using Atwater general factors (4-4-9 system for protein-carbohydrate-fat).",
        importance: "medium",
        unit: "kcal"
    },
    "Energy (Atwater Specific Factors)": {
        category: "Energy",
        explanation: "Energy calculated using food-specific Atwater factors for more accurate energy estimation.",
        importance: "medium",
        unit: "kcal"
    },
    "Protein": {
        category: "Macronutrients", 
        explanation: "Essential macronutrient made of amino acids. Builds and repairs tissues, makes enzymes and hormones.",
        importance: "high",
        unit: "g"
    },
    "Total lipid (fat)": {
        category: "Macronutrients",
        explanation: "Total fat content including all types of fats. Essential for energy, hormone production, and nutrient absorption.",
        importance: "high", 
        unit: "g"
    },
    "Total fat (NLEA)": {
        category: "Macronutrients",
        explanation: "Total fat content as defined by Nutrition Labeling and Education Act regulations.",
        importance: "high",
        unit: "g"
    },
    "Carbohydrate, by difference": {
        category: "Macronutrients",
        explanation: "Total carbohydrates calculated by subtracting protein, fat, ash, and water from total weight.",
        importance: "high",
        unit: "g"
    },
    "Carbohydrate, by summation": {
        category: "Macronutrients",
        explanation: "Total carbohydrates calculated by adding individual carbohydrate components.",
        importance: "medium",
        unit: "g"
    },
    "Water": {
        category: "Basic Components",
        explanation: "Water content of food. Important for hydration and affects food texture and preservation.",
        importance: "medium",
        unit: "g"
    },
    "Ash": {
        category: "Basic Components", 
        explanation: "Mineral content remaining after burning organic matter. Indicates total mineral content.",
        importance: "low",
        unit: "g"
    },
    "Nitrogen": {
        category: "Basic Components",
        explanation: "Total nitrogen content, used to calculate protein content (N × 6.25).",
        importance: "low",
        unit: "g"
    },
    "Alcohol, ethyl": {
        category: "Other Compounds",
        explanation: "Ethyl alcohol content in alcoholic beverages. Provides energy but no nutrients.",
        importance: "medium",
        unit: "g"
    },

    // VITAMINS
    "Vitamin A": {
        category: "Vitamins",
        explanation: "Fat-soluble vitamin essential for vision, immune function, and cell growth.",
        importance: "high",
        unit: "µg"
    },
    "Vitamin A, RAE": {
        category: "Vitamins",
        explanation: "Vitamin A expressed as Retinol Activity Equivalents. Essential for vision, immune function, and cell growth.",
        importance: "high",
        unit: "µg"
    },
    "Vitamin A, IU": {
        category: "Vitamins",
        explanation: "Vitamin A expressed in International Units, an older measurement system.",
        importance: "medium",
        unit: "IU"
    },
    "Retinol": {
        category: "Vitamins",
        explanation: "Pre-formed vitamin A found in animal products. Directly usable by the body.",
        importance: "high",
        unit: "µg"
    },
    "Vitamin C, total ascorbic acid": {
        category: "Vitamins", 
        explanation: "Water-soluble antioxidant vitamin. Essential for collagen synthesis and immune function.",
        importance: "high",
        unit: "mg"
    },
    "Vitamin D (D2 + D3)": {
        category: "Vitamins",
        explanation: "Fat-soluble vitamin essential for bone health and calcium absorption. Made in skin from sunlight.",
        importance: "high",
        unit: "µg"
    },
    "Vitamin D (D2 + D3), International Units": {
        category: "Vitamins",
        explanation: "Vitamin D expressed in International Units, commonly used in supplements.",
        importance: "medium",
        unit: "IU"
    },
    "Vitamin D2 (ergocalciferol)": {
        category: "Vitamins",
        explanation: "Plant-derived form of vitamin D. Less effective than D3 at raising blood levels.",
        importance: "medium",
        unit: "µg"
    },
    "Vitamin D3 (cholecalciferol)": {
        category: "Vitamins",
        explanation: "Animal-derived form of vitamin D. More effective at raising blood levels than D2.",
        importance: "high",
        unit: "µg"
    },
    "Vitamin E (alpha-tocopherol)": {
        category: "Vitamins",
        explanation: "Most active form of vitamin E. Fat-soluble antioxidant protecting cell membranes.",
        importance: "high",
        unit: "mg"
    },
    "Vitamin E, added": {
        category: "Vitamins",
        explanation: "Vitamin E added during food processing or fortification.",
        importance: "medium",
        unit: "mg"
    },
    "Tocopherol, beta": {
        category: "Vitamins",
        explanation: "Form of vitamin E with lower biological activity than alpha-tocopherol.",
        importance: "low",
        unit: "mg"
    },
    "Tocopherol, gamma": {
        category: "Vitamins",
        explanation: "Form of vitamin E with antioxidant properties, complementary to alpha-tocopherol.",
        importance: "medium",
        unit: "mg"
    },
    "Tocopherol, delta": {
        category: "Vitamins",
        explanation: "Form of vitamin E with antioxidant properties but lower activity.",
        importance: "low",
        unit: "mg"
    },
    "Tocotrienol, alpha": {
        category: "Vitamins",
        explanation: "Form of vitamin E with unique properties including neuroprotective effects.",
        importance: "low",
        unit: "mg"
    },
    "Tocotrienol, beta": {
        category: "Vitamins",
        explanation: "Form of vitamin E with potential cardiovascular benefits.",
        importance: "low",
        unit: "mg"
    },
    "Tocotrienol, gamma": {
        category: "Vitamins",
        explanation: "Form of vitamin E with cholesterol-lowering properties.",
        importance: "low",
        unit: "mg"
    },
    "Tocotrienol, delta": {
        category: "Vitamins",
        explanation: "Form of vitamin E with antioxidant and anti-inflammatory properties.",
        importance: "low",
        unit: "mg"
    },
    "Vitamin K (phylloquinone)": {
        category: "Vitamins",
        explanation: "Vitamin K1. Essential for blood clotting. Found in leafy green vegetables.",
        importance: "high",
        unit: "µg"
    },
    "Vitamin K (Menaquinone-4)": {
        category: "Vitamins",
        explanation: "Vitamin K2 form important for bone health and cardiovascular function.",
        importance: "medium",
        unit: "µg"
    },
    "Vitamin K (Dihydrophylloquinone)": {
        category: "Vitamins",
        explanation: "Vitamin K derivative found in processed foods, with reduced biological activity.",
        importance: "low",
        unit: "µg"
    },
    "Thiamin": {
        category: "Vitamins",
        explanation: "Vitamin B1. Essential for energy metabolism and nervous system function. Found in whole grains.",
        importance: "high",
        unit: "mg"
    },
    "Riboflavin": {
        category: "Vitamins",
        explanation: "Vitamin B2. Important for energy production and antioxidant function. Found in dairy and leafy greens.",
        importance: "high",
        unit: "mg"
    },
    "Niacin": {
        category: "Vitamins",
        explanation: "Vitamin B3. Essential for energy metabolism and DNA repair. Found in meat, fish, and grains.",
        importance: "high",
        unit: "mg"
    },
    "Pantothenic acid": {
        category: "Vitamins",
        explanation: "Vitamin B5. Essential for fat metabolism and synthesis of hormones and neurotransmitters.",
        importance: "high",
        unit: "mg"
    },
    "Vitamin B-6": {
        category: "Vitamins",
        explanation: "Essential for protein metabolism, brain function, and immune system. Found in meat and vegetables.",
        importance: "high",
        unit: "mg"
    },
    "Biotin": {
        category: "Vitamins",
        explanation: "Vitamin B7. Essential for fat synthesis, amino acid metabolism, and gene regulation.",
        importance: "medium",
        unit: "µg"
    },
    "Folate, DFE": {
        category: "Vitamins",
        explanation: "Dietary Folate Equivalents. Essential for DNA synthesis and cell division. Critical during pregnancy.",
        importance: "high",
        unit: "µg"
    },
    "Folate, total": {
        category: "Vitamins",
        explanation: "Total folate from all sources including natural and synthetic forms.",
        importance: "high",
        unit: "µg"
    },
    "Folate, food": {
        category: "Vitamins",
        explanation: "Natural folate found in foods, excluding synthetic folic acid.",
        importance: "high",
        unit: "µg"
    },
    "Folic acid": {
        category: "Vitamins",
        explanation: "Synthetic form of folate used in supplements and fortified foods.",
        importance: "high",
        unit: "µg"
    },
    "5-methyl tetrahydrofolate (5-MTHF)": {
        category: "Vitamins",
        explanation: "Active form of folate in the body, important for methylation reactions.",
        importance: "medium",
        unit: "µg"
    },
    "10-Formyl folic acid (10HCOFA)": {
        category: "Vitamins",
        explanation: "Formylated derivative of folic acid involved in one-carbon metabolism.",
        importance: "low",
        unit: "µg"
    },
    "5-Formyltetrahydrofolic acid (5-HCOH4": {
        category: "Vitamins",
        explanation: "Stable form of folate that serves as a vitamin cofactor.",
        importance: "low",
        unit: "µg"
    },
    "Vitamin B-12": {
        category: "Vitamins",
        explanation: "Essential for nerve function and red blood cell formation. Found only in animal products.",
        importance: "high",
        unit: "µg"
    },
    "Vitamin B-12, added": {
        category: "Vitamins",
        explanation: "Vitamin B12 added during food processing or fortification.",
        importance: "medium",
        unit: "µg"
    },

    // MINERALS
    "Calcium, Ca": {
        category: "Minerals",
        explanation: "Essential mineral for bone and teeth health, muscle function, and nerve signaling.",
        importance: "high",
        unit: "mg"
    },
    "Iron, Fe": {
        category: "Minerals",
        explanation: "Essential for oxygen transport in blood and energy metabolism. Deficiency causes anemia.",
        importance: "high",
        unit: "mg"
    },
    "Magnesium, Mg": {
        category: "Minerals",
        explanation: "Essential for over 300 enzyme reactions, bone health, and muscle function.",
        importance: "high",
        unit: "mg"
    },
    "Phosphorus, P": {
        category: "Minerals",
        explanation: "Essential for bone health, energy storage, and cell membrane structure.",
        importance: "high",
        unit: "mg"
    },
    "Potassium, K": {
        category: "Minerals",
        explanation: "Essential for heart function, muscle contractions, and blood pressure regulation.",
        importance: "high",
        unit: "mg"
    },
    "Sodium, Na": {
        category: "Minerals",
        explanation: "Essential for fluid balance and nerve function. Excess intake linked to high blood pressure.",
        importance: "high",
        unit: "mg"
    },
    "Zinc, Zn": {
        category: "Minerals",
        explanation: "Essential for immune function, wound healing, and protein synthesis.",
        importance: "high",
        unit: "mg"
    },
    "Copper, Cu": {
        category: "Minerals",
        explanation: "Essential for iron metabolism, connective tissue formation, and antioxidant function.",
        importance: "medium",
        unit: "mg"
    },
    "Manganese, Mn": {
        category: "Minerals",
        explanation: "Essential for bone development, wound healing, and antioxidant enzyme function.",
        importance: "medium",
        unit: "mg"
    },
    "Selenium, Se": {
        category: "Minerals",
        explanation: "Essential antioxidant mineral. Important for thyroid function and immune system.",
        importance: "medium",
        unit: "µg"
    },
    "Molybdenum, Mo": {
        category: "Minerals",
        explanation: "Essential trace mineral needed for enzyme function and sulfur metabolism.",
        importance: "low",
        unit: "µg"
    },
    "Iodine, I": {
        category: "Minerals",
        explanation: "Essential for thyroid hormone production and metabolic regulation.",
        importance: "high",
        unit: "µg"
    },
    "Fluoride, F": {
        category: "Minerals",
        explanation: "Helps prevent tooth decay and may strengthen bones in small amounts.",
        importance: "low",
        unit: "µg"
    },

    // FIBER & CARBOHYDRATES
    "Fiber, total dietary": {
        category: "Carbohydrates",
        explanation: "Indigestible plant material that promotes digestive health and helps control blood sugar.",
        importance: "high",
        unit: "g"
    },
    "Total dietary fiber (AOAC 2011.25)": {
        category: "Carbohydrates",
        explanation: "Dietary fiber measured using AOAC method 2011.25, includes resistant starch.",
        importance: "high",
        unit: "g"
    },
    "Fiber, soluble": {
        category: "Carbohydrates",
        explanation: "Soluble fiber that dissolves in water, helps lower cholesterol and blood sugar.",
        importance: "high",
        unit: "g"
    },
    "Fiber, insoluble": {
        category: "Carbohydrates",
        explanation: "Insoluble fiber that promotes digestive health and prevents constipation.",
        importance: "high",
        unit: "g"
    },
    "Sugars, Total": {
        category: "Carbohydrates",
        explanation: "Total sugar content including natural and added sugars. Provides quick energy.",
        importance: "medium",
        unit: "g"
    },
    "Total Sugars": {
        category: "Carbohydrates",
        explanation: "Alternative measurement of total sugar content in foods.",
        importance: "medium",
        unit: "g"
    },
    "Glucose": {
        category: "Carbohydrates",
        explanation: "Simple sugar that is the body's primary energy source. Found in fruits and honey.",
        importance: "medium",
        unit: "g"
    },
    "Fructose": {
        category: "Carbohydrates",
        explanation: "Simple sugar found in fruits, honey, and some vegetables. Sweetest natural sugar.",
        importance: "medium",
        unit: "g"
    },
    "Galactose": {
        category: "Carbohydrates",
        explanation: "Simple sugar that combines with glucose to form lactose (milk sugar).",
        importance: "low",
        unit: "g"
    },
    "Sucrose": {
        category: "Carbohydrates",
        explanation: "Table sugar composed of glucose and fructose. Found in sugar cane and sugar beets.",
        importance: "medium",
        unit: "g"
    },
    "Lactose": {
        category: "Carbohydrates",
        explanation: "Milk sugar composed of glucose and galactose. Found only in dairy products.",
        importance: "medium",
        unit: "g"
    },
    "Maltose": {
        category: "Carbohydrates",
        explanation: "Malt sugar composed of two glucose units. Found in malted grains and some fruits.",
        importance: "low",
        unit: "g"
    },
    "Starch": {
        category: "Carbohydrates",
        explanation: "Complex carbohydrate that provides sustained energy. Found in grains, potatoes, and legumes.",
        importance: "high",
        unit: "g"
    },
    "Raffinose": {
        category: "Carbohydrates",
        explanation: "Complex sugar found in beans and vegetables. Can cause digestive gas.",
        importance: "low",
        unit: "g"
    },
    "Stachyose": {
        category: "Carbohydrates",
        explanation: "Complex sugar found in legumes. Can cause digestive discomfort.",
        importance: "low",
        unit: "g"
    },
    "Verbascose": {
        category: "Carbohydrates",
        explanation: "Complex sugar found in legumes and some vegetables.",
        importance: "low",
        unit: "g"
    },

    // FATTY ACIDS
    "Fatty acids, total saturated": {
        category: "Fatty Acids",
        explanation: "Total saturated fats. Should be limited in diet as excess may raise cholesterol levels.",
        importance: "high",
        unit: "g"
    },
    "Fatty acids, total monounsaturated": {
        category: "Fatty Acids",
        explanation: "Total monounsaturated fats. Generally considered heart-healthy fats.",
        importance: "high",
        unit: "g"
    },
    "Fatty acids, total polyunsaturated": {
        category: "Fatty Acids",
        explanation: "Total polyunsaturated fats including omega-3 and omega-6 fatty acids.",
        importance: "high",
        unit: "g"
    },
    "Cholesterol": {
        category: "Lipids",
        explanation: "Waxy substance found in animal products. Body makes cholesterol, dietary intake less important than once thought.",
        importance: "medium",
        unit: "mg"
    },

    // AMINO ACIDS
    "Alanine": {
        category: "Amino Acids",
        explanation: "Non-essential amino acid important for energy production and immune function.",
        importance: "low",
        unit: "g"
    },
    "Arginine": {
        category: "Amino Acids",
        explanation: "Semi-essential amino acid important for wound healing and immune function.",
        importance: "medium",
        unit: "g"
    },
    "Aspartic acid": {
        category: "Amino Acids",
        explanation: "Non-essential amino acid that plays a role in hormone production and nervous system function.",
        importance: "low",
        unit: "g"
    },
    "Cysteine": {
        category: "Amino Acids",
        explanation: "Semi-essential amino acid important for protein structure and antioxidant production.",
        importance: "medium",
        unit: "g"
    },
    "Cystine": {
        category: "Amino Acids",
        explanation: "Dimeric form of cysteine, important for protein structure and hair/nail health.",
        importance: "low",
        unit: "g"
    },
    "Glutamic acid": {
        category: "Amino Acids",
        explanation: "Non-essential amino acid important for brain function and metabolism.",
        importance: "low",
        unit: "g"
    },
    "Glycine": {
        category: "Amino Acids",
        explanation: "Non-essential amino acid important for collagen production and sleep quality.",
        importance: "medium",
        unit: "g"
    },
    "Histidine": {
        category: "Amino Acids",
        explanation: "Essential amino acid important for growth and tissue repair.",
        importance: "high",
        unit: "g"
    },
    "Hydroxyproline": {
        category: "Amino Acids",
        explanation: "Modified amino acid found primarily in collagen, important for skin and joint health.",
        importance: "low",
        unit: "g"
    },
    "Isoleucine": {
        category: "Amino Acids",
        explanation: "Essential branched-chain amino acid important for muscle metabolism and energy.",
        importance: "high",
        unit: "g"
    },
    "Leucine": {
        category: "Amino Acids",
        explanation: "Essential branched-chain amino acid crucial for muscle protein synthesis.",
        importance: "high",
        unit: "g"
    },
    "Lysine": {
        category: "Amino Acids",
        explanation: "Essential amino acid important for protein synthesis and calcium absorption.",
        importance: "high",
        unit: "g"
    },
    "Methionine": {
        category: "Amino Acids",
        explanation: "Essential amino acid important for metabolism and detoxification.",
        importance: "high",
        unit: "g"
    },
    "Phenylalanine": {
        category: "Amino Acids",
        explanation: "Essential amino acid important for neurotransmitter production.",
        importance: "high",
        unit: "g"
    },
    "Proline": {
        category: "Amino Acids",
        explanation: "Non-essential amino acid important for collagen production and wound healing.",
        importance: "medium",
        unit: "g"
    },
    "Serine": {
        category: "Amino Acids",
        explanation: "Non-essential amino acid important for protein synthesis and brain function.",
        importance: "low",
        unit: "g"
    },
    "Threonine": {
        category: "Amino Acids",
        explanation: "Essential amino acid important for protein synthesis and immune function.",
        importance: "high",
        unit: "g"
    },
    "Tryptophan": {
        category: "Amino Acids",
        explanation: "Essential amino acid precursor to serotonin, important for mood and sleep.",
        importance: "high",
        unit: "g"
    },
    "Tyrosine": {
        category: "Amino Acids",
        explanation: "Non-essential amino acid important for neurotransmitter production.",
        importance: "medium",
        unit: "g"
    },
    "Valine": {
        category: "Amino Acids",
        explanation: "Essential branched-chain amino acid important for muscle metabolism.",
        importance: "high",
        unit: "g"
    },

    // SATURATED FATTY ACIDS (SFA)
    "SFA 4:0": { category: "Fatty Acids", explanation: "Butyric acid, short-chain saturated fatty acid found in dairy products.", importance: "low", unit: "g" },
    "SFA 5:0": { category: "Fatty Acids", explanation: "Valeric acid, short-chain saturated fatty acid.", importance: "low", unit: "g" },
    "SFA 6:0": { category: "Fatty Acids", explanation: "Caproic acid, medium-chain saturated fatty acid found in dairy.", importance: "low", unit: "g" },
    "SFA 7:0": { category: "Fatty Acids", explanation: "Enanthic acid, saturated fatty acid found in some plant oils.", importance: "low", unit: "g" },
    "SFA 8:0": { category: "Fatty Acids", explanation: "Caprylic acid, medium-chain saturated fatty acid with antimicrobial properties.", importance: "low", unit: "g" },
    "SFA 9:0": { category: "Fatty Acids", explanation: "Pelargonic acid, saturated fatty acid found in some plant oils.", importance: "low", unit: "g" },
    "SFA 10:0": { category: "Fatty Acids", explanation: "Capric acid, medium-chain saturated fatty acid found in coconut oil.", importance: "low", unit: "g" },
    "SFA 11:0": { category: "Fatty Acids", explanation: "Undecanoic acid, saturated fatty acid found in some animal fats.", importance: "low", unit: "g" },
    "SFA 12:0": { category: "Fatty Acids", explanation: "Lauric acid, saturated fatty acid with antimicrobial properties found in coconut oil.", importance: "medium", unit: "g" },
    "SFA 13:0": { category: "Fatty Acids", explanation: "Tridecanoic acid, saturated fatty acid found in some dairy products.", importance: "low", unit: "g" },
    "SFA 14:0": { category: "Fatty Acids", explanation: "Myristic acid, saturated fatty acid found in dairy and tropical oils.", importance: "low", unit: "g" },
    "SFA 15:0": { category: "Fatty Acids", explanation: "Pentadecanoic acid, saturated fatty acid found in dairy products.", importance: "low", unit: "g" },
    "SFA 16:0": { category: "Fatty Acids", explanation: "Palmitic acid, most common saturated fatty acid in foods.", importance: "medium", unit: "g" },
    "SFA 17:0": { category: "Fatty Acids", explanation: "Margaric acid, saturated fatty acid found in ruminant fats.", importance: "low", unit: "g" },
    "SFA 18:0": { category: "Fatty Acids", explanation: "Stearic acid, saturated fatty acid that doesn't raise cholesterol levels.", importance: "medium", unit: "g" },
    "SFA 20:0": { category: "Fatty Acids", explanation: "Arachidic acid, long-chain saturated fatty acid found in peanuts.", importance: "low", unit: "g" },
    "SFA 21:0": { category: "Fatty Acids", explanation: "Heneicosanoic acid, long-chain saturated fatty acid.", importance: "low", unit: "g" },
    "SFA 22:0": { category: "Fatty Acids", explanation: "Behenic acid, very long-chain saturated fatty acid.", importance: "low", unit: "g" },
    "SFA 23:0": { category: "Fatty Acids", explanation: "Tricosanoic acid, very long-chain saturated fatty acid.", importance: "low", unit: "g" },
    "SFA 24:0": { category: "Fatty Acids", explanation: "Lignoceric acid, very long-chain saturated fatty acid.", importance: "low", unit: "g" },

    // MONOUNSATURATED FATTY ACIDS (MUFA)
    "MUFA 12:1": { category: "Fatty Acids", explanation: "Lauroleic acid, monounsaturated fatty acid found in some plant oils.", importance: "low", unit: "g" },
    "MUFA 14:1": { category: "Fatty Acids", explanation: "Myristoleic acid, monounsaturated fatty acid found in fish and dairy.", importance: "low", unit: "g" },
    "MUFA 14:1 c": { category: "Fatty Acids", explanation: "Cis-myristoleic acid, natural form of myristoleic acid.", importance: "low", unit: "g" },
    "MUFA 15:1": { category: "Fatty Acids", explanation: "Pentadecenoic acid, monounsaturated fatty acid found in some marine oils.", importance: "low", unit: "g" },
    "MUFA 16:1": { category: "Fatty Acids", explanation: "Palmitoleic acid, monounsaturated fatty acid with potential health benefits.", importance: "medium", unit: "g" },
    "MUFA 16:1 c": { category: "Fatty Acids", explanation: "Cis-palmitoleic acid, natural form of palmitoleic acid.", importance: "medium", unit: "g" },
    "MUFA 17:1": { category: "Fatty Acids", explanation: "Heptadecenoic acid, monounsaturated fatty acid found in ruminant fats.", importance: "low", unit: "g" },
    "MUFA 17:1 c": { category: "Fatty Acids", explanation: "Cis-heptadecenoic acid, natural form found in dairy products.", importance: "low", unit: "g" },
    "MUFA 18:1": { category: "Fatty Acids", explanation: "Oleic acid, most common monounsaturated fatty acid with heart benefits.", importance: "high", unit: "g" },
    "MUFA 18:1 c": { category: "Fatty Acids", explanation: "Cis-oleic acid, natural heart-healthy form of oleic acid.", importance: "high", unit: "g" },
    "MUFA 20:1": { category: "Fatty Acids", explanation: "Eicosenoic acid, monounsaturated fatty acid found in some plant oils.", importance: "low", unit: "g" },
    "MUFA 20:1 c": { category: "Fatty Acids", explanation: "Cis-eicosenoic acid, natural form found in olive oil.", importance: "low", unit: "g" },
    "MUFA 22:1": { category: "Fatty Acids", explanation: "Erucic acid, monounsaturated fatty acid found in some plant oils.", importance: "low", unit: "g" },
    "MUFA 22:1 c": { category: "Fatty Acids", explanation: "Cis-erucic acid, natural form with potential concerns in high amounts.", importance: "low", unit: "g" },
    "MUFA 22:1 n-11": { category: "Fatty Acids", explanation: "Cetoleic acid, omega-11 monounsaturated fatty acid.", importance: "low", unit: "g" },
    "MUFA 22:1 n-9": { category: "Fatty Acids", explanation: "Erucic acid, omega-9 monounsaturated fatty acid.", importance: "low", unit: "g" },
    "MUFA 24:1 c": { category: "Fatty Acids", explanation: "Nervonic acid, very long-chain monounsaturated fatty acid important for brain health.", importance: "medium", unit: "g" },

    // POLYUNSATURATED FATTY ACIDS (PUFA)
    "PUFA 18:2": { category: "Fatty Acids", explanation: "Linoleic acid, essential omega-6 fatty acid important for skin health.", importance: "high", unit: "g" },
    "PUFA 18:2 CLAs": { category: "Fatty Acids", explanation: "Conjugated linoleic acids with potential body composition benefits.", importance: "medium", unit: "g" },
    "PUFA 18:2 c": { category: "Fatty Acids", explanation: "Cis-linoleic acid, natural form of essential omega-6 fatty acid.", importance: "high", unit: "g" },
    "PUFA 18:2 n-6 c,c": { category: "Fatty Acids", explanation: "Linoleic acid in cis configuration, essential omega-6 fatty acid.", importance: "high", unit: "g" },
    "PUFA 18:3": { category: "Fatty Acids", explanation: "Alpha-linolenic acid, essential omega-3 fatty acid from plants.", importance: "high", unit: "g" },
    "PUFA 18:3 c": { category: "Fatty Acids", explanation: "Cis-alpha-linolenic acid, natural form of plant omega-3.", importance: "high", unit: "g" },
    "PUFA 18:3 n-3 c,c,c (ALA)": { category: "Fatty Acids", explanation: "Alpha-linolenic acid, essential omega-3 fatty acid from plants like flax.", importance: "high", unit: "g" },
    "PUFA 18:3 n-6 c,c,c": { category: "Fatty Acids", explanation: "Gamma-linolenic acid, omega-6 fatty acid with anti-inflammatory properties.", importance: "medium", unit: "g" },
    "PUFA 18:3i": { category: "Fatty Acids", explanation: "Conjugated alpha-linolenic acid isomer.", importance: "low", unit: "g" },
    "PUFA 18:4": { category: "Fatty Acids", explanation: "Stearidonic acid, omega-3 fatty acid found in some plant oils.", importance: "medium", unit: "g" },
    "PUFA 20:2 c": { category: "Fatty Acids", explanation: "Eicosadienoic acid, omega-6 fatty acid.", importance: "low", unit: "g" },
    "PUFA 20:2 n-6 c,c": { category: "Fatty Acids", explanation: "Eicosadienoic acid, intermediate in omega-6 metabolism.", importance: "low", unit: "g" },
    "PUFA 20:3": { category: "Fatty Acids", explanation: "Eicosatrienoic acid, intermediate in fatty acid metabolism.", importance: "low", unit: "g" },
    "PUFA 20:3 c": { category: "Fatty Acids", explanation: "Cis-eicosatrienoic acid, intermediate in omega-6 pathway.", importance: "low", unit: "g" },
    "PUFA 20:3 n-3": { category: "Fatty Acids", explanation: "Eicosatrienoic acid, omega-3 fatty acid.", importance: "low", unit: "g" },
    "PUFA 20:3 n-6": { category: "Fatty Acids", explanation: "Dihomo-gamma-linolenic acid, omega-6 fatty acid with anti-inflammatory potential.", importance: "medium", unit: "g" },
    "PUFA 20:3 n-9": { category: "Fatty Acids", explanation: "Mead acid, omega-9 fatty acid produced during essential fatty acid deficiency.", importance: "low", unit: "g" },
    "PUFA 20:4": { category: "Fatty Acids", explanation: "Arachidonic acid, omega-6 fatty acid important for brain function.", importance: "medium", unit: "g" },
    "PUFA 20:4 n-6": { category: "Fatty Acids", explanation: "Arachidonic acid, omega-6 fatty acid that can be pro-inflammatory in excess.", importance: "medium", unit: "g" },
    "PUFA 20:4c": { category: "Fatty Acids", explanation: "Cis-arachidonic acid, natural form found in animal products.", importance: "medium", unit: "g" },
    "PUFA 20:5 n-3 (EPA)": { category: "Fatty Acids", explanation: "Eicosapentaenoic acid, marine omega-3 with anti-inflammatory properties.", importance: "high", unit: "g" },
    "PUFA 20:5c": { category: "Fatty Acids", explanation: "Cis-EPA, natural form of this important marine omega-3.", importance: "high", unit: "g" },
    "PUFA 21:5": { category: "Fatty Acids", explanation: "Heneicosapentaenoic acid, uncommon long-chain omega-3.", importance: "low", unit: "g" },
    "PUFA 22:2": { category: "Fatty Acids", explanation: "Docosadienoic acid, long-chain omega-6 fatty acid.", importance: "low", unit: "g" },
    "PUFA 22:3": { category: "Fatty Acids", explanation: "Docosatrienoic acid, long-chain fatty acid.", importance: "low", unit: "g" },
    "PUFA 22:4": { category: "Fatty Acids", explanation: "Adrenic acid, omega-6 fatty acid found in animal products.", importance: "low", unit: "g" },
    "PUFA 22:5 c": { category: "Fatty Acids", explanation: "Cis-docosapentaenoic acid, omega-3 fatty acid.", importance: "medium", unit: "g" },
    "PUFA 22:5 n-3 (DPA)": { category: "Fatty Acids", explanation: "Docosapentaenoic acid, marine omega-3 with cardiovascular benefits.", importance: "high", unit: "g" },
    "PUFA 22:6 c": { category: "Fatty Acids", explanation: "Cis-DHA, natural form of this crucial brain omega-3.", importance: "high", unit: "g" },
    "PUFA 22:6 n-3 (DHA)": { category: "Fatty Acids", explanation: "Docosahexaenoic acid, omega-3 essential for brain and eye health.", importance: "high", unit: "g" },

    // TRANS FATTY ACIDS (TFA)
    "Fatty acids, total trans": { category: "Fatty Acids", explanation: "Total trans fats, artificial fats that should be minimized in diet.", importance: "high", unit: "g" },
    "Fatty acids, total trans-monoenoic": { category: "Fatty Acids", explanation: "Trans monounsaturated fats, harmful artificial fats.", importance: "medium", unit: "g" },
    "Fatty acids, total trans-dienoic": { category: "Fatty Acids", explanation: "Trans polyunsaturated fats with two double bonds.", importance: "medium", unit: "g" },
    "Fatty acids, total trans-polyenoic": { category: "Fatty Acids", explanation: "Trans polyunsaturated fats with multiple double bonds.", importance: "medium", unit: "g" },
    "TFA 14:1 t": { category: "Fatty Acids", explanation: "Trans-myristoleic acid, artificial trans fat to avoid.", importance: "low", unit: "g" },
    "TFA 16:1 t": { category: "Fatty Acids", explanation: "Trans-palmitoleic acid, harmful artificial trans fat.", importance: "low", unit: "g" },
    "TFA 18:1 t": { category: "Fatty Acids", explanation: "Trans-oleic acid, most common harmful trans fat in processed foods.", importance: "medium", unit: "g" },
    "TFA 18:2 t": { category: "Fatty Acids", explanation: "Trans-linoleic acid, harmful artificial polyunsaturated trans fat.", importance: "medium", unit: "g" },
    "TFA 18:2 t not further defined": { category: "Fatty Acids", explanation: "Unspecified trans-linoleic acid isomers.", importance: "low", unit: "g" },
    "TFA 18:3 t": { category: "Fatty Acids", explanation: "Trans-alpha-linolenic acid, harmful trans form of omega-3.", importance: "low", unit: "g" },
    "TFA 20:1 t": { category: "Fatty Acids", explanation: "Trans-eicosenoic acid, long-chain trans fat.", importance: "low", unit: "g" },
    "TFA 22:1 t": { category: "Fatty Acids", explanation: "Trans-erucic acid, very long-chain trans fat.", importance: "low", unit: "g" },

    // CAROTENOIDS & ANTIOXIDANTS
    "Carotene, alpha": { category: "Antioxidants", explanation: "Carotenoid with vitamin A activity, found in orange vegetables.", importance: "medium", unit: "µg" },
    "Carotene, beta": { category: "Antioxidants", explanation: "Most important provitamin A carotenoid with strong antioxidant properties.", importance: "high", unit: "µg" },
    "cis-beta-Carotene": { category: "Antioxidants", explanation: "Natural isomer of beta-carotene with vitamin A activity.", importance: "medium", unit: "µg" },
    "trans-beta-Carotene": { category: "Antioxidants", explanation: "Most common and active form of beta-carotene.", importance: "high", unit: "µg" },
    "Cryptoxanthin, alpha": { category: "Antioxidants", explanation: "Carotenoid with vitamin A activity found in some fruits.", importance: "low", unit: "µg" },
    "Cryptoxanthin, beta": { category: "Antioxidants", explanation: "Carotenoid with vitamin A activity found in orange fruits.", importance: "medium", unit: "µg" },
    "Lutein": { category: "Antioxidants", explanation: "Carotenoid important for eye health, found in leafy greens.", importance: "high", unit: "µg" },
    "Lutein + zeaxanthin": { category: "Antioxidants", explanation: "Combined eye-protective carotenoids that filter blue light.", importance: "high", unit: "µg" },
    "cis-Lutein/Zeaxanthin": { category: "Antioxidants", explanation: "Natural isomers of eye-protective carotenoids.", importance: "medium", unit: "µg" },
    "Zeaxanthin": { category: "Antioxidants", explanation: "Carotenoid concentrated in the macula, essential for eye health.", importance: "high", unit: "µg" },
    "Lycopene": { category: "Antioxidants", explanation: "Powerful antioxidant carotenoid found in tomatoes, may protect against cancer.", importance: "high", unit: "µg" },
    "cis-Lycopene": { category: "Antioxidants", explanation: "Natural isomer of lycopene with enhanced bioavailability.", importance: "medium", unit: "µg" },
    "trans-Lycopene": { category: "Antioxidants", explanation: "Most common form of lycopene in fresh tomatoes.", importance: "high", unit: "µg" },
    "Phytoene": { category: "Antioxidants", explanation: "Colorless carotenoid precursor with antioxidant properties.", importance: "low", unit: "µg" },
    "Phytofluene": { category: "Antioxidants", explanation: "Colorless carotenoid with potential health benefits.", importance: "low", unit: "µg" },

    // STEROLS & PHYTOCHEMICALS
    "Beta-sitosterol": { category: "Phytosterols", explanation: "Plant sterol that helps lower cholesterol levels.", importance: "medium", unit: "mg" },
    "Campesterol": { category: "Phytosterols", explanation: "Plant sterol with cholesterol-lowering properties.", importance: "medium", unit: "mg" },
    "Stigmasterol": { category: "Phytosterols", explanation: "Plant sterol found in vegetable oils with health benefits.", importance: "medium", unit: "mg" },
    "Phytosterols": { category: "Phytosterols", explanation: "Total plant sterols that help reduce cholesterol absorption.", importance: "high", unit: "mg" },

    // CHOLINE COMPOUNDS
    "Choline, total": { category: "Vitamins", explanation: "Essential nutrient important for brain development and liver function.", importance: "high", unit: "mg" },
    "Choline, free": { category: "Vitamins", explanation: "Unbound choline readily available for biological functions.", importance: "medium", unit: "mg" },
    "Choline, from glycerophosphocholine": { category: "Vitamins", explanation: "Choline bound to glycerophosphate, found in lecithin.", importance: "low", unit: "mg" },
    "Choline, from phosphocholine": { category: "Vitamins", explanation: "Choline in phosphorylated form, intermediate in metabolism.", importance: "low", unit: "mg" },
    "Choline, from phosphotidyl choline": { category: "Vitamins", explanation: "Choline from phosphatidylcholine (lecithin), major dietary source.", importance: "medium", unit: "mg" },
    "Choline, from sphingomyelin": { category: "Vitamins", explanation: "Choline from sphingomyelin, found in animal products.", importance: "low", unit: "mg" },
    "Betaine": { category: "Other Compounds", explanation: "Methylated derivative of choline with potential cardiovascular benefits.", importance: "medium", unit: "mg" },

    // ISOFLAVONES
    "Daidzein": { category: "Phytoestrogens", explanation: "Soy isoflavone with potential hormonal and cardiovascular effects.", importance: "medium", unit: "mg" },
    "Daidzin": { category: "Phytoestrogens", explanation: "Glycoside form of daidzein found in soybeans.", importance: "low", unit: "mg" },
    "Genistein": { category: "Phytoestrogens", explanation: "Soy isoflavone with antioxidant and potential anti-cancer properties.", importance: "medium", unit: "mg" },
    "Genistin": { category: "Phytoestrogens", explanation: "Glycoside form of genistein found in soy products.", importance: "low", unit: "mg" },
    "Glycitin": { category: "Phytoestrogens", explanation: "Soy isoflavone glycoside with mild estrogenic activity.", importance: "low", unit: "mg" },

    // OTHER COMPOUNDS
    "Caffeine": { category: "Other Compounds", explanation: "Stimulant compound that enhances alertness and may have health benefits.", importance: "medium", unit: "mg" },
    "Theobromine": { category: "Other Compounds", explanation: "Mild stimulant found in chocolate with mood-enhancing properties.", importance: "low", unit: "mg" },
    "Citric acid": { category: "Organic Acids", explanation: "Natural preservative and flavor enhancer found in citrus fruits.", importance: "low", unit: "g" },
    "Malic acid": { category: "Organic Acids", explanation: "Organic acid found in apples that contributes to tartness.", importance: "low", unit: "g" },
    "Oxalic acid": { category: "Organic Acids", explanation: "Organic acid found in spinach and other greens, can interfere with mineral absorption.", importance: "low", unit: "g" },
    "Pyruvic acid": { category: "Organic Acids", explanation: "Intermediate in glucose metabolism and energy production.", importance: "low", unit: "g" },
    "Quinic acid": { category: "Organic Acids", explanation: "Organic acid found in coffee beans and cranberries.", importance: "low", unit: "g" }
};

// Utility functions for the nutrient database
class NutrientDatabase {
    static getNutrientInfo(nutrientName) {
        return NUTRIENT_DATABASE[nutrientName] || null;
    }

    static getAllNutrients() {
        return Object.keys(NUTRIENT_DATABASE);
    }

    static getCategories() {
        const categories = new Set();
        Object.values(NUTRIENT_DATABASE).forEach(nutrient => {
            categories.add(nutrient.category);
        });
        return Array.from(categories).sort();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NUTRIENT_DATABASE, NutrientDatabase };
} else if (typeof window !== 'undefined') {
    window.NUTRIENT_DATABASE = NUTRIENT_DATABASE;
    window.NutrientDatabase = NutrientDatabase;
} 