// Comprehensive Nutrient Database with all 218 USDA nutrients
const NUTRIENT_DATABASE = {
    // ENERGY & MACRONUTRIENTS
    "Energy": { category: "Energy", explanation: "Total energy content of food, measured in calories (kcal) or kilojoules (kJ). Essential for all body functions." },
    "Energy (Atwater General Factors)": { category: "Energy", explanation: "Energy calculated using Atwater general factors (4-4-9 system for protein-carbohydrate-fat)." },
    "Energy (Atwater Specific Factors)": { category: "Energy", explanation: "Energy calculated using food-specific Atwater factors for more accurate energy estimation." },
    "Protein": { category: "Macronutrients", explanation: "Essential macronutrient made of amino acids. Builds and repairs tissues, makes enzymes and hormones." },
    "Total lipid (fat)": { category: "Macronutrients", explanation: "Total fat content including all types of fats. Essential for energy, hormone production, and nutrient absorption." },
    "Total fat (NLEA)": { category: "Macronutrients", explanation: "Total fat content as defined by Nutrition Labeling and Education Act regulations." },
    "Carbohydrate, by difference": { category: "Macronutrients", explanation: "Total carbohydrates calculated by subtracting protein, fat, ash, and water from total weight." },
    "Carbohydrate, by summation": { category: "Macronutrients", explanation: "Total carbohydrates calculated by adding individual carbohydrate components." },
    "Water": { category: "Basic Components", explanation: "Water content of food. Important for hydration and affects food texture and preservation." },
    "Ash": { category: "Basic Components", explanation: "Mineral content remaining after burning organic matter. Indicates total mineral content." },
    "Nitrogen": { category: "Basic Components", explanation: "Total nitrogen content, used to calculate protein content (N × 6.25)." },
    "Alcohol, ethyl": { category: "Other Compounds", explanation: "Ethyl alcohol content in alcoholic beverages. Provides energy but no nutrients." },

    // VITAMINS
    "Vitamin A": { category: "Fat-Soluble Vitamins", explanation: "Fat-soluble vitamin essential for vision, immune function, and cell growth." },
    "Vitamin A, RAE": { category: "Fat-Soluble Vitamins", explanation: "Vitamin A expressed as Retinol Activity Equivalents. Essential for vision, immune function, and cell growth." },
    "Vitamin A, IU": { category: "Fat-Soluble Vitamins", explanation: "Vitamin A expressed in International Units, an older measurement system." },
    "Retinol": { category: "Fat-Soluble Vitamins", explanation: "Pre-formed vitamin A found in animal products. Directly usable by the body." },
    "Vitamin C, total ascorbic acid": { category: "Water-Soluble Vitamins", explanation: "Water-soluble antioxidant vitamin. Essential for collagen synthesis and immune function." },
    "Vitamin D (D2 + D3)": { category: "Fat-Soluble Vitamins", explanation: "Fat-soluble vitamin essential for bone health and calcium absorption. Made in skin from sunlight." },
    "Vitamin D (D2 + D3), International Units": { category: "Fat-Soluble Vitamins", explanation: "Vitamin D expressed in International Units, commonly used in supplements." },
    "Vitamin D2 (ergocalciferol)": { category: "Fat-Soluble Vitamins", explanation: "Plant-derived form of vitamin D. Less effective than D3 at raising blood levels." },
    "Vitamin D3 (cholecalciferol)": { category: "Fat-Soluble Vitamins", explanation: "Animal-derived form of vitamin D. More effective at raising blood levels than D2." },
    "Vitamin E (alpha-tocopherol)": { category: "Vitamin E", explanation: "Most active form of vitamin E. Fat-soluble antioxidant protecting cell membranes." },
    "Vitamin E, added": { category: "Vitamin E", explanation: "Vitamin E added during food processing or fortification." },
    "Tocopherol, beta": { category: "Vitamin E", explanation: "Form of vitamin E with lower biological activity than alpha-tocopherol." },
    "Tocopherol, gamma": { category: "Vitamin E", explanation: "Form of vitamin E with antioxidant properties, complementary to alpha-tocopherol." },
    "Tocopherol, delta": { category: "Vitamin E", explanation: "Form of vitamin E with antioxidant properties but lower activity." },
    "Tocotrienol, alpha": { category: "Vitamin E", explanation: "Form of vitamin E with unique properties including neuroprotective effects." },
    "Tocotrienol, beta": { category: "Vitamin E", explanation: "Form of vitamin E with potential cardiovascular benefits." },
    "Tocotrienol, gamma": { category: "Vitamin E", explanation: "Form of vitamin E with cholesterol-lowering properties." },
    "Tocotrienol, delta": { category: "Vitamin E", explanation: "Form of vitamin E with antioxidant and anti-inflammatory properties." },
    "Vitamin K (phylloquinone)": { category: "Fat-Soluble Vitamins", explanation: "Vitamin K1. Essential for blood clotting. Found in leafy green vegetables." },
    "Vitamin K (Menaquinone-4)": { category: "Fat-Soluble Vitamins", explanation: "Vitamin K2 form important for bone health and cardiovascular function." },
    "Vitamin K (Dihydrophylloquinone)": { category: "Fat-Soluble Vitamins", explanation: "Vitamin K derivative found in processed foods, with reduced biological activity." },
    "Thiamin": { category: "B Vitamins", explanation: "Vitamin B1. Essential for energy metabolism and nervous system function. Found in whole grains." },
    "Riboflavin": { category: "B Vitamins", explanation: "Vitamin B2. Important for energy production and antioxidant function. Found in dairy and leafy greens." },
    "Niacin": { category: "B Vitamins", explanation: "Vitamin B3. Essential for energy metabolism and DNA repair. Found in meat, fish, and grains." },
    "Pantothenic acid": { category: "B Vitamins", explanation: "Vitamin B5. Essential for fat metabolism and synthesis of hormones and neurotransmitters." },
    "Vitamin B-6": { category: "B Vitamins", explanation: "Essential for protein metabolism, brain function, and immune system. Found in meat and vegetables." },
    "Biotin": { category: "B Vitamins", explanation: "Vitamin B7. Essential for fat synthesis, amino acid metabolism, and gene regulation." },
    "Folate, DFE": { category: "Folate", explanation: "Dietary Folate Equivalents. Essential for DNA synthesis and cell division. Critical during pregnancy." },
    "Folate, total": { category: "Folate", explanation: "Total folate from all sources including natural and synthetic forms." },
    "Folate, food": { category: "Folate", explanation: "Natural folate found in foods, excluding synthetic folic acid." },
    "Folic acid": { category: "Folate", explanation: "Synthetic form of folate used in supplements and fortified foods." },
    "5-methyl tetrahydrofolate (5-MTHF)": { category: "Folate", explanation: "Active form of folate in the body, important for methylation reactions." },
    "10-Formyl folic acid (10HCOFA)": { category: "Folate", explanation: "Formylated derivative of folic acid involved in one-carbon metabolism." },
    "5-Formyltetrahydrofolic acid (5-HCOH4": { category: "Folate", explanation: "Stable form of folate that serves as a vitamin cofactor." },
    "Vitamin B-12": { category: "B Vitamins", explanation: "Essential for nerve function and red blood cell formation. Found only in animal products." },
    "Vitamin B-12, added": { category: "B Vitamins", explanation: "Vitamin B12 added during food processing or fortification." },

    // MINERALS
    "Calcium, Ca": { category: "Major Minerals", explanation: "Essential mineral for bone and teeth health, muscle function, and nerve signaling." },
    "Iron, Fe": { category: "Trace Minerals", explanation: "Essential for oxygen transport in blood and energy metabolism. Deficiency causes anemia." },
    "Magnesium, Mg": { category: "Major Minerals", explanation: "Essential for over 300 enzyme reactions, bone health, and muscle function." },
    "Phosphorus, P": { category: "Major Minerals", explanation: "Essential for bone health, energy storage, and cell membrane structure." },
    "Potassium, K": { category: "Major Minerals", explanation: "Essential for heart function, muscle contractions, and blood pressure regulation." },
    "Sodium, Na": { category: "Major Minerals", explanation: "Essential for fluid balance and nerve function. Excess intake linked to high blood pressure." },
    "Zinc, Zn": { category: "Trace Minerals", explanation: "Essential for immune function, wound healing, and protein synthesis." },
    "Copper, Cu": { category: "Trace Minerals", explanation: "Essential for iron metabolism, connective tissue formation, and antioxidant function." },
    "Manganese, Mn": { category: "Trace Minerals", explanation: "Essential for bone development, wound healing, and antioxidant enzyme function." },
    "Selenium, Se": { category: "Trace Minerals", explanation: "Essential antioxidant mineral. Important for thyroid function and immune system." },
    "Molybdenum, Mo": { category: "Trace Minerals", explanation: "Essential trace mineral needed for enzyme function and sulfur metabolism." },
    "Iodine, I": { category: "Trace Minerals", explanation: "Essential for thyroid hormone production and metabolic regulation." },
    "Fluoride, F": { category: "Trace Minerals", explanation: "Helps prevent tooth decay and may strengthen bones in small amounts." },

    // FIBER & CARBOHYDRATES
    "Fiber, total dietary": { category: "Fiber", explanation: "Indigestible plant material that promotes digestive health and helps control blood sugar." },
    "Total dietary fiber (AOAC 2011.25)": { category: "Fiber", explanation: "Dietary fiber measured using AOAC method 2011.25, includes resistant starch." },
    "Fiber, soluble": { category: "Fiber", explanation: "Soluble fiber that dissolves in water, helps lower cholesterol and blood sugar." },
    "Fiber, insoluble": { category: "Fiber", explanation: "Insoluble fiber that promotes digestive health and prevents constipation." },
    "Sugars, Total": { category: "Sugars", explanation: "Total sugar content including natural and added sugars. Provides quick energy." },
    "Total Sugars": { category: "Sugars", explanation: "Alternative measurement of total sugar content in foods." },
    "Glucose": { category: "Sugars", explanation: "Simple sugar that is the body's primary energy source. Found in fruits and honey." },
    "Fructose": { category: "Sugars", explanation: "Simple sugar found in fruits, honey, and some vegetables. Sweetest natural sugar." },
    "Galactose": { category: "Sugars", explanation: "Simple sugar that combines with glucose to form lactose (milk sugar)." },
    "Sucrose": { category: "Sugars", explanation: "Table sugar composed of glucose and fructose. Found in sugar cane and sugar beets." },
    "Lactose": { category: "Sugars", explanation: "Milk sugar composed of glucose and galactose. Found only in dairy products." },
    "Maltose": { category: "Sugars", explanation: "Malt sugar composed of two glucose units. Found in malted grains and some fruits." },
    "Starch": { category: "Complex Carbohydrates", explanation: "Complex carbohydrate that provides sustained energy. Found in grains, potatoes, and legumes." },
    "Raffinose": { category: "Complex Carbohydrates", explanation: "Complex sugar found in beans and vegetables. Can cause digestive gas." },
    "Stachyose": { category: "Complex Carbohydrates", explanation: "Complex sugar found in legumes. Can cause digestive discomfort." },
    "Verbascose": { category: "Complex Carbohydrates", explanation: "Complex sugar found in legumes and some vegetables." },

    // FATTY ACIDS
    "Fatty acids, total saturated": { category: "Fatty Acid Totals", explanation: "Total saturated fats. Should be limited in diet as excess may raise cholesterol levels." },
    "Fatty acids, total monounsaturated": { category: "Fatty Acid Totals", explanation: "Total monounsaturated fats. Generally considered heart-healthy fats." },
    "Fatty acids, total polyunsaturated": { category: "Fatty Acid Totals", explanation: "Total polyunsaturated fats including omega-3 and omega-6 fatty acids." },
    "Cholesterol": { category: "Lipids", explanation: "Waxy substance found in animal products. Body makes cholesterol, dietary intake less important than once thought." },

    // AMINO ACIDS
    "Alanine": { category: "Amino Acids", explanation: "Non-essential amino acid important for energy production and immune function." },
    "Arginine": { category: "Amino Acids", explanation: "Semi-essential amino acid important for wound healing and immune function." },
    "Aspartic acid": { category: "Amino Acids", explanation: "Non-essential amino acid that plays a role in hormone production and nervous system function." },
    "Cysteine": { category: "Amino Acids", explanation: "Semi-essential amino acid important for protein structure and antioxidant production." },
    "Cystine": { category: "Amino Acids", explanation: "Dimeric form of cysteine, important for protein structure and hair/nail health." },
    "Glutamic acid": { category: "Amino Acids", explanation: "Non-essential amino acid important for brain function and metabolism." },
    "Glycine": { category: "Amino Acids", explanation: "Non-essential amino acid important for collagen production and sleep quality." },
    "Histidine": { category: "Amino Acids", explanation: "Essential amino acid important for growth and tissue repair." },
    "Hydroxyproline": { category: "Amino Acids", explanation: "Modified amino acid found primarily in collagen, important for skin and joint health." },
    "Isoleucine": { category: "Amino Acids", explanation: "Essential branched-chain amino acid important for muscle metabolism and energy." },
    "Leucine": { category: "Amino Acids", explanation: "Essential branched-chain amino acid crucial for muscle protein synthesis." },
    "Lysine": { category: "Amino Acids", explanation: "Essential amino acid important for protein synthesis and calcium absorption." },
    "Methionine": { category: "Amino Acids", explanation: "Essential amino acid important for metabolism and detoxification." },
    "Phenylalanine": { category: "Amino Acids", explanation: "Essential amino acid important for neurotransmitter production." },
    "Proline": { category: "Amino Acids", explanation: "Non-essential amino acid important for collagen production and wound healing." },
    "Serine": { category: "Amino Acids", explanation: "Non-essential amino acid important for protein synthesis and brain function." },
    "Threonine": { category: "Amino Acids", explanation: "Essential amino acid important for protein synthesis and immune function." },
    "Tryptophan": { category: "Amino Acids", explanation: "Essential amino acid precursor to serotonin, important for mood and sleep." },
    "Tyrosine": { category: "Amino Acids", explanation: "Non-essential amino acid important for neurotransmitter production." },
    "Valine": { category: "Amino Acids", explanation: "Essential branched-chain amino acid important for muscle metabolism." },

    // SATURATED FATTY ACIDS (SFA)
    "SFA 4:0": { category: "Saturated Fatty Acids", explanation: "Butyric acid, short-chain saturated fatty acid found in dairy products." },
    "SFA 5:0": { category: "Saturated Fatty Acids", explanation: "Valeric acid, short-chain saturated fatty acid." },
    "SFA 6:0": { category: "Saturated Fatty Acids", explanation: "Caproic acid, medium-chain saturated fatty acid found in dairy." },
    "SFA 7:0": { category: "Saturated Fatty Acids", explanation: "Enanthic acid, saturated fatty acid found in some plant oils." },
    "SFA 8:0": { category: "Saturated Fatty Acids", explanation: "Caprylic acid, medium-chain saturated fatty acid with antimicrobial properties." },
    "SFA 9:0": { category: "Saturated Fatty Acids", explanation: "Pelargonic acid, saturated fatty acid found in some plant oils." },
    "SFA 10:0": { category: "Saturated Fatty Acids", explanation: "Capric acid, medium-chain saturated fatty acid found in coconut oil." },
    "SFA 11:0": { category: "Saturated Fatty Acids", explanation: "Undecanoic acid, saturated fatty acid found in some animal fats." },
    "SFA 12:0": { category: "Saturated Fatty Acids", explanation: "Lauric acid, saturated fatty acid with antimicrobial properties found in coconut oil." },
    "SFA 13:0": { category: "Saturated Fatty Acids", explanation: "Tridecanoic acid, saturated fatty acid found in some dairy products." },
    "SFA 14:0": { category: "Saturated Fatty Acids", explanation: "Myristic acid, saturated fatty acid found in dairy and tropical oils." },
    "SFA 15:0": { category: "Saturated Fatty Acids", explanation: "Pentadecanoic acid, saturated fatty acid found in dairy products." },
    "SFA 16:0": { category: "Saturated Fatty Acids", explanation: "Palmitic acid, most common saturated fatty acid in foods." },
    "SFA 17:0": { category: "Saturated Fatty Acids", explanation: "Margaric acid, saturated fatty acid found in ruminant fats." },
    "SFA 18:0": { category: "Saturated Fatty Acids", explanation: "Stearic acid, saturated fatty acid that doesn't raise cholesterol levels." },
    "SFA 20:0": { category: "Saturated Fatty Acids", explanation: "Arachidic acid, long-chain saturated fatty acid found in peanuts." },
    "SFA 21:0": { category: "Saturated Fatty Acids", explanation: "Heneicosanoic acid, long-chain saturated fatty acid." },
    "SFA 22:0": { category: "Saturated Fatty Acids", explanation: "Behenic acid, very long-chain saturated fatty acid." },
    "SFA 23:0": { category: "Saturated Fatty Acids", explanation: "Tricosanoic acid, very long-chain saturated fatty acid." },
    "SFA 24:0": { category: "Saturated Fatty Acids", explanation: "Lignoceric acid, very long-chain saturated fatty acid." },

    // MONOUNSATURATED FATTY ACIDS (MUFA)
    "MUFA 12:1": { category: "Monounsaturated Fatty Acids", explanation: "Lauroleic acid, monounsaturated fatty acid found in some plant oils." },
    "MUFA 14:1": { category: "Monounsaturated Fatty Acids", explanation: "Myristoleic acid, monounsaturated fatty acid found in fish and dairy." },
    "MUFA 14:1 c": { category: "Monounsaturated Fatty Acids", explanation: "Cis-myristoleic acid, natural form of myristoleic acid." },
    "MUFA 15:1": { category: "Monounsaturated Fatty Acids", explanation: "Pentadecenoic acid, monounsaturated fatty acid found in some marine oils." },
    "MUFA 16:1": { category: "Monounsaturated Fatty Acids", explanation: "Palmitoleic acid, monounsaturated fatty acid with potential health benefits." },
    "MUFA 16:1 c": { category: "Monounsaturated Fatty Acids", explanation: "Cis-palmitoleic acid, natural form of palmitoleic acid." },
    "MUFA 17:1": { category: "Monounsaturated Fatty Acids", explanation: "Heptadecenoic acid, monounsaturated fatty acid found in ruminant fats." },
    "MUFA 17:1 c": { category: "Monounsaturated Fatty Acids", explanation: "Cis-heptadecenoic acid, natural form found in dairy products." },
    "MUFA 18:1": { category: "Monounsaturated Fatty Acids", explanation: "Oleic acid, most common monounsaturated fatty acid with heart benefits." },
    "MUFA 18:1 c": { category: "Monounsaturated Fatty Acids", explanation: "Cis-oleic acid, natural heart-healthy form of oleic acid." },
    "MUFA 20:1": { category: "Monounsaturated Fatty Acids", explanation: "Eicosenoic acid, monounsaturated fatty acid found in some plant oils." },
    "MUFA 20:1 c": { category: "Monounsaturated Fatty Acids", explanation: "Cis-eicosenoic acid, natural form found in olive oil." },
    "MUFA 22:1": { category: "Monounsaturated Fatty Acids", explanation: "Erucic acid, monounsaturated fatty acid found in some plant oils." },
    "MUFA 22:1 c": { category: "Monounsaturated Fatty Acids", explanation: "Cis-erucic acid, natural form with potential concerns in high amounts." },
    "MUFA 22:1 n-11": { category: "Monounsaturated Fatty Acids", explanation: "Cetoleic acid, omega-11 monounsaturated fatty acid." },
    "MUFA 22:1 n-9": { category: "Monounsaturated Fatty Acids", explanation: "Erucic acid, omega-9 monounsaturated fatty acid." },
    "MUFA 24:1 c": { category: "Monounsaturated Fatty Acids", explanation: "Nervonic acid, very long-chain monounsaturated fatty acid important for brain health." },

    // POLYUNSATURATED FATTY ACIDS (PUFA)
    "PUFA 18:2": { category: "Polyunsaturated Fatty Acids", explanation: "Linoleic acid, essential omega-6 fatty acid important for skin health." },
    "PUFA 18:2 CLAs": { category: "Polyunsaturated Fatty Acids", explanation: "Conjugated linoleic acids with potential body composition benefits." },
    "PUFA 18:2 c": { category: "Polyunsaturated Fatty Acids", explanation: "Cis-linoleic acid, natural form of essential omega-6 fatty acid." },
    "PUFA 18:2 n-6 c,c": { category: "Polyunsaturated Fatty Acids", explanation: "Linoleic acid in cis configuration, essential omega-6 fatty acid." },
    "PUFA 18:3": { category: "Polyunsaturated Fatty Acids", explanation: "Alpha-linolenic acid, essential omega-3 fatty acid from plants." },
    "PUFA 18:3 c": { category: "Polyunsaturated Fatty Acids", explanation: "Cis-alpha-linolenic acid, natural form of plant omega-3." },
    "PUFA 18:3 n-3 c,c,c (ALA)": { category: "Polyunsaturated Fatty Acids", explanation: "Alpha-linolenic acid, essential omega-3 fatty acid from plants like flax." },
    "PUFA 18:3 n-6 c,c,c": { category: "Polyunsaturated Fatty Acids", explanation: "Gamma-linolenic acid, omega-6 fatty acid with anti-inflammatory properties." },
    "PUFA 18:3i": { category: "Polyunsaturated Fatty Acids", explanation: "Conjugated alpha-linolenic acid isomer." },
    "PUFA 18:4": { category: "Polyunsaturated Fatty Acids", explanation: "Stearidonic acid, omega-3 fatty acid found in some plant oils." },
    "PUFA 20:2 c": { category: "Polyunsaturated Fatty Acids", explanation: "Eicosadienoic acid, omega-6 fatty acid." },
    "PUFA 20:2 n-6 c,c": { category: "Polyunsaturated Fatty Acids", explanation: "Eicosadienoic acid, intermediate in omega-6 metabolism." },
    "PUFA 20:3": { category: "Polyunsaturated Fatty Acids", explanation: "Eicosatrienoic acid, intermediate in fatty acid metabolism." },
    "PUFA 20:3 c": { category: "Polyunsaturated Fatty Acids", explanation: "Cis-eicosatrienoic acid, intermediate in omega-6 pathway." },
    "PUFA 20:3 n-3": { category: "Polyunsaturated Fatty Acids", explanation: "Eicosatrienoic acid, omega-3 fatty acid." },
    "PUFA 20:3 n-6": { category: "Polyunsaturated Fatty Acids", explanation: "Dihomo-gamma-linolenic acid, omega-6 fatty acid with anti-inflammatory potential." },
    "PUFA 20:3 n-9": { category: "Polyunsaturated Fatty Acids", explanation: "Mead acid, omega-9 fatty acid produced during essential fatty acid deficiency." },
    "PUFA 20:4": { category: "Polyunsaturated Fatty Acids", explanation: "Arachidonic acid, omega-6 fatty acid important for brain function." },
    "PUFA 20:4 n-6": { category: "Polyunsaturated Fatty Acids", explanation: "Arachidonic acid, omega-6 fatty acid that can be pro-inflammatory in excess." },
    "PUFA 20:4c": { category: "Polyunsaturated Fatty Acids", explanation: "Cis-arachidonic acid, natural form found in animal products." },
    "PUFA 20:5 n-3 (EPA)": { category: "Polyunsaturated Fatty Acids", explanation: "Eicosapentaenoic acid, marine omega-3 with anti-inflammatory properties." },
    "PUFA 20:5c": { category: "Polyunsaturated Fatty Acids", explanation: "Cis-EPA, natural form of this important marine omega-3." },
    "PUFA 21:5": { category: "Polyunsaturated Fatty Acids", explanation: "Heneicosapentaenoic acid, uncommon long-chain omega-3." },
    "PUFA 22:2": { category: "Polyunsaturated Fatty Acids", explanation: "Docosadienoic acid, long-chain omega-6 fatty acid." },
    "PUFA 22:3": { category: "Polyunsaturated Fatty Acids", explanation: "Docosatrienoic acid, long-chain fatty acid." },
    "PUFA 22:4": { category: "Polyunsaturated Fatty Acids", explanation: "Adrenic acid, omega-6 fatty acid found in animal products." },
    "PUFA 22:5 c": { category: "Polyunsaturated Fatty Acids", explanation: "Cis-docosapentaenoic acid, omega-3 fatty acid." },
    "PUFA 22:5 n-3 (DPA)": { category: "Polyunsaturated Fatty Acids", explanation: "Docosapentaenoic acid, marine omega-3 with cardiovascular benefits." },
    "PUFA 22:6 c": { category: "Polyunsaturated Fatty Acids", explanation: "Cis-DHA, natural form of this crucial brain omega-3." },
    "PUFA 22:6 n-3 (DHA)": { category: "Polyunsaturated Fatty Acids", explanation: "Docosahexaenoic acid, omega-3 essential for brain and eye health." },

    // TRANS FATTY ACIDS (TFA)
    "Fatty acids, total trans": { category: "Trans Fatty Acids", explanation: "Total trans fats, artificial fats that should be minimized in diet." },
    "Fatty acids, total trans-monoenoic": { category: "Trans Fatty Acids", explanation: "Trans monounsaturated fats, harmful artificial fats." },
    "Fatty acids, total trans-dienoic": { category: "Trans Fatty Acids", explanation: "Trans polyunsaturated fats with two double bonds." },
    "Fatty acids, total trans-polyenoic": { category: "Trans Fatty Acids", explanation: "Trans polyunsaturated fats with multiple double bonds." },
    "TFA 14:1 t": { category: "Trans Fatty Acids", explanation: "Trans-myristoleic acid, artificial trans fat to avoid." },
    "TFA 16:1 t": { category: "Trans Fatty Acids", explanation: "Trans-palmitoleic acid, harmful artificial trans fat." },
    "TFA 18:1 t": { category: "Trans Fatty Acids", explanation: "Trans-oleic acid, most common harmful trans fat in processed foods." },
    "TFA 18:2 t": { category: "Trans Fatty Acids", explanation: "Trans-linoleic acid, harmful artificial polyunsaturated trans fat." },
    "TFA 18:2 t not further defined": { category: "Trans Fatty Acids", explanation: "Unspecified trans-linoleic acid isomers." },
    "TFA 18:3 t": { category: "Trans Fatty Acids", explanation: "Trans-alpha-linolenic acid, harmful trans form of omega-3." },
    "TFA 20:1 t": { category: "Trans Fatty Acids", explanation: "Trans-eicosenoic acid, long-chain trans fat." },
    "TFA 22:1 t": { category: "Trans Fatty Acids", explanation: "Trans-erucic acid, very long-chain trans fat." },

    // CAROTENOIDS & ANTIOXIDANTS
    "Carotene, alpha": { category: "Carotenoids", explanation: "Carotenoid with vitamin A activity, found in orange vegetables." },
    "Carotene, beta": { category: "Carotenoids", explanation: "Most important provitamin A carotenoid with strong antioxidant properties." },
    "cis-beta-Carotene": { category: "Carotenoids", explanation: "Natural isomer of beta-carotene with vitamin A activity." },
    "trans-beta-Carotene": { category: "Carotenoids", explanation: "Most common and active form of beta-carotene." },
    "Cryptoxanthin, alpha": { category: "Carotenoids", explanation: "Carotenoid with vitamin A activity found in some fruits." },
    "Cryptoxanthin, beta": { category: "Carotenoids", explanation: "Carotenoid with vitamin A activity found in orange fruits." },
    "Lutein": { category: "Carotenoids", explanation: "Carotenoid important for eye health, found in leafy greens." },
    "Lutein + zeaxanthin": { category: "Carotenoids", explanation: "Combined eye-protective carotenoids that filter blue light." },
    "cis-Lutein/Zeaxanthin": { category: "Carotenoids", explanation: "Natural isomers of eye-protective carotenoids." },
    "Zeaxanthin": { category: "Carotenoids", explanation: "Carotenoid concentrated in the macula, essential for eye health." },
    "Lycopene": { category: "Carotenoids", explanation: "Powerful antioxidant carotenoid found in tomatoes, may protect against cancer." },
    "cis-Lycopene": { category: "Carotenoids", explanation: "Natural isomer of lycopene with enhanced bioavailability." },
    "trans-Lycopene": { category: "Carotenoids", explanation: "Most common form of lycopene in fresh tomatoes." },
    "Phytoene": { category: "Carotenoids", explanation: "Colorless carotenoid precursor with antioxidant properties." },
    "Phytofluene": { category: "Carotenoids", explanation: "Colorless carotenoid with potential health benefits." },

    // STEROLS & PHYTOCHEMICALS
    "Beta-sitosterol": { category: "Phytosterols", explanation: "Plant sterol that helps lower cholesterol levels." },
    "Campesterol": { category: "Phytosterols", explanation: "Plant sterol with cholesterol-lowering properties." },
    "Stigmasterol": { category: "Phytosterols", explanation: "Plant sterol found in vegetable oils with health benefits." },
    "Phytosterols": { category: "Phytosterols", explanation: "Total plant sterols that help reduce cholesterol absorption." },

    // CHOLINE COMPOUNDS
    "Choline, total": { category: "Choline", explanation: "Essential nutrient important for brain development and liver function." },
    "Choline, free": { category: "Choline", explanation: "Unbound choline readily available for biological functions." },
    "Choline, from glycerophosphocholine": { category: "Choline", explanation: "Choline bound to glycerophosphate, found in lecithin." },
    "Choline, from phosphocholine": { category: "Choline", explanation: "Choline in phosphorylated form, intermediate in metabolism." },
    "Choline, from phosphotidyl choline": { category: "Choline", explanation: "Choline from phosphatidylcholine (lecithin), major dietary source." },
    "Choline, from sphingomyelin": { category: "Choline", explanation: "Choline from sphingomyelin, found in animal products." },
    "Betaine": { category: "Choline", explanation: "Methylated derivative of choline with potential cardiovascular benefits." },

    // ISOFLAVONES
    "Daidzein": { category: "Isoflavones", explanation: "Soy isoflavone with potential hormonal and cardiovascular effects." },
    "Daidzin": { category: "Isoflavones", explanation: "Glycoside form of daidzein found in soybeans." },
    "Genistein": { category: "Isoflavones", explanation: "Soy isoflavone with antioxidant and potential anti-cancer properties." },
    "Genistin": { category: "Isoflavones", explanation: "Glycoside form of genistein found in soy products." },
    "Glycitin": { category: "Isoflavones", explanation: "Soy isoflavone glycoside with mild estrogenic activity." },

    // OTHER COMPOUNDS
    "Caffeine": { category: "Other Compounds", explanation: "Stimulant compound that enhances alertness and may have health benefits." },
    "Theobromine": { category: "Other Compounds", explanation: "Mild stimulant found in chocolate with mood-enhancing properties." },
    "Citric acid": { category: "Organic Acids", explanation: "Natural preservative and flavor enhancer found in citrus fruits." },
    "Malic acid": { category: "Organic Acids", explanation: "Organic acid found in apples that contributes to tartness." },
    "Oxalic acid": { category: "Organic Acids", explanation: "Organic acid found in spinach and other greens, can interfere with mineral absorption." },
    "Pyruvic acid": { category: "Organic Acids", explanation: "Intermediate in glucose metabolism and energy production." },
    "Quinic acid": { category: "Organic Acids", explanation: "Organic acid found in coffee beans and cranberries." }
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