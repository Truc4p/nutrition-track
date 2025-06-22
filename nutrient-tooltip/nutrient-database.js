// Comprehensive Nutrient Database with all 218 USDA nutrients
const NUTRIENT_DATABASE = {
    // ENERGY & MACRONUTRIENTS
    "Energy": { category: "Energy", explanation: "Essential for all body functions and physical activity. Excess intake leads to weight gain and obesity. Deficiency causes fatigue, weakness, and weight loss." },
    "Energy (Atwater General Factors)": { category: "Energy", explanation: "Essential for metabolic processes and cellular functions. Excess intake causes weight gain. Deficiency leads to energy depletion and muscle wasting." },
    "Energy (Atwater Specific Factors)": { category: "Energy", explanation: "Essential for maintaining body weight and energy balance. Excess intake results in fat storage. Deficiency causes metabolic slowdown." },
    "Protein": { category: "Macronutrients", explanation: "Essential for tissue repair, immune function, and enzyme production. Excess intake may strain kidneys and liver. Deficiency causes muscle wasting, poor wound healing, and weakened immunity." },
    "Total lipid (fat)": { category: "Macronutrients", explanation: "Essential for hormone production, vitamin absorption, and cell membranes. Excess intake leads to obesity and cardiovascular disease. Deficiency causes dry skin, poor wound healing, and vitamin deficiencies." },
    "Total fat (NLEA)": { category: "Macronutrients", explanation: "Essential for energy storage and insulation. Excess intake contributes to obesity and heart disease. Deficiency impairs fat-soluble vitamin absorption." },
    "Carbohydrate, by difference": { category: "Macronutrients", explanation: "Essential for brain function and quick energy. Excess intake causes blood sugar spikes and weight gain. Deficiency leads to fatigue, poor concentration, and ketosis." },
    "Carbohydrate, by summation": { category: "Macronutrients", explanation: "Essential for glucose supply to brain and muscles. Excess intake promotes fat storage. Deficiency causes low blood sugar and mental fog." },
    "Water": { category: "Basic Components", explanation: "Essential for hydration, temperature regulation, and nutrient transport. Excess intake may cause electrolyte imbalance. Deficiency leads to dehydration, kidney problems, and poor circulation." },
    "Ash": { category: "Basic Components", explanation: "Essential minerals for various body functions. Excess intake may cause mineral imbalances. Deficiency leads to poor bone health and metabolic dysfunction." },
    "Nitrogen": { category: "Basic Components", explanation: "Essential for protein synthesis and DNA formation. Excess intake may stress kidneys. Deficiency impairs protein production and growth." },
    "Alcohol, ethyl": { category: "Other Compounds", explanation: "No essential function for health. Excess intake causes liver damage, addiction, and increased disease risk. No deficiency symptoms as it's not required." },

    // VITAMINS
    "Vitamin A": { category: "Fat-Soluble Vitamins", explanation: "Essential for vision, immune function, and cell growth. Excess intake causes liver toxicity and birth defects. Deficiency leads to night blindness, dry eyes, and increased infections." },
    "Vitamin A, RAE": { category: "Fat-Soluble Vitamins", explanation: "Essential for eye health and immune system. Excess intake may cause hypervitaminosis A with liver damage. Deficiency results in vision problems and weakened immunity." },
    "Vitamin A, IU": { category: "Fat-Soluble Vitamins", explanation: "Essential for retinal function and epithelial tissue health. Excess intake leads to toxicity symptoms. Deficiency causes xerophthalmia and increased disease susceptibility." },
    "Retinol": { category: "Fat-Soluble Vitamins", explanation: "Essential for vision and cellular differentiation. Excess intake causes acute vitamin A poisoning. Deficiency leads to night blindness and keratomalacia." },
    "Vitamin C, total ascorbic acid": { category: "Water-Soluble Vitamins", explanation: "Essential for collagen synthesis, immune function, and iron absorption. Excess intake may cause digestive upset and kidney stones. Deficiency causes scurvy, poor wound healing, and bleeding gums." },
    "Vitamin D (D2 + D3)": { category: "Fat-Soluble Vitamins", explanation: "Essential for bone health, calcium absorption, and immune function. Excess intake causes hypercalcemia and kidney damage. Deficiency leads to rickets, osteomalacia, and increased fracture risk." },
    "Vitamin D (D2 + D3), International Units": { category: "Fat-Soluble Vitamins", explanation: "Essential for calcium metabolism and bone mineralization. Excess intake results in calcium toxicity. Deficiency causes bone deformities and muscle weakness." },
    "Vitamin D2 (ergocalciferol)": { category: "Fat-Soluble Vitamins", explanation: "Essential for calcium homeostasis and bone health. Excess intake may cause hypercalciuria. Deficiency leads to poor bone development and osteoporosis." },
    "Vitamin D3 (cholecalciferol)": { category: "Fat-Soluble Vitamins", explanation: "Essential for optimal calcium absorption and bone strength. Excess intake causes vitamin D toxicity. Deficiency results in soft bones and increased infection risk." },
    "Vitamin E (alpha-tocopherol)": { category: "Vitamin E", explanation: "Essential for protecting cell membranes from oxidative damage. Excess intake may increase bleeding risk and interfere with vitamin K. Deficiency causes nerve damage, muscle weakness, and immune dysfunction." },
    "Vitamin E, added": { category: "Vitamin E", explanation: "Essential for antioxidant protection and immune function. Excess intake may cause bleeding disorders. Deficiency leads to neurological problems and poor immune response." },
    "Tocopherol, beta": { category: "Vitamin E", explanation: "Essential for cellular antioxidant defense. Excess intake may disrupt vitamin balance. Deficiency contributes to oxidative stress and tissue damage." },
    "Tocopherol, gamma": { category: "Vitamin E", explanation: "Essential for anti-inflammatory protection. Excess intake may interfere with other tocopherols. Deficiency increases inflammation and oxidative damage." },
    "Tocopherol, delta": { category: "Vitamin E", explanation: "Essential for antioxidant activity and cell protection. Excess intake may cause imbalances. Deficiency leads to increased free radical damage." },
    "Tocotrienol, alpha": { category: "Vitamin E", explanation: "Essential for neuroprotection and cardiovascular health. Excess intake may affect vitamin E balance. Deficiency may increase neurodegeneration risk." },
    "Tocotrienol, beta": { category: "Vitamin E", explanation: "Essential for heart health and cholesterol regulation. Excess intake may cause vitamin imbalances. Deficiency may increase cardiovascular disease risk." },
    "Tocotrienol, gamma": { category: "Vitamin E", explanation: "Essential for cholesterol metabolism and heart protection. Excess intake may interfere with other vitamins. Deficiency may lead to elevated cholesterol levels." },
    "Tocotrienol, delta": { category: "Vitamin E", explanation: "Essential for anti-inflammatory and antioxidant functions. Excess intake may disrupt vitamin balance. Deficiency increases inflammation and oxidative stress." },
    "Vitamin K (phylloquinone)": { category: "Fat-Soluble Vitamins", explanation: "Essential for blood clotting and bone health. Excess intake may interfere with anticoagulant medications. Deficiency causes bleeding disorders and weak bones." },
    "Vitamin K (Menaquinone-4)": { category: "Fat-Soluble Vitamins", explanation: "Essential for bone mineralization and cardiovascular health. Excess intake may affect blood clotting. Deficiency leads to osteoporosis and arterial calcification." },
    "Vitamin K (Dihydrophylloquinone)": { category: "Fat-Soluble Vitamins", explanation: "Essential for blood coagulation support. Excess intake may alter clotting function. Deficiency contributes to bleeding tendencies." },
    "Thiamin": { category: "B Vitamins", explanation: "Essential for energy metabolism and nervous system function. Excess intake is rare but may cause hypotension. Deficiency causes beriberi, fatigue, and neurological problems." },
    "Riboflavin": { category: "B Vitamins", explanation: "Essential for energy production and antioxidant enzyme function. Excess intake generally safe but may cause bright yellow urine. Deficiency leads to cracked lips, sore throat, and eye problems." },
    "Niacin": { category: "B Vitamins", explanation: "Essential for energy metabolism and DNA repair. Excess intake causes flushing, liver damage, and digestive issues. Deficiency leads to pellagra, dermatitis, and mental confusion." },
    "Pantothenic acid": { category: "B Vitamins", explanation: "Essential for fat metabolism and hormone synthesis. Excess intake may cause digestive upset. Deficiency leads to fatigue, numbness, and poor wound healing." },
    "Vitamin B-6": { category: "B Vitamins", explanation: "Essential for protein metabolism, brain function, and immune system. Excess intake causes nerve damage and skin lesions. Deficiency leads to anemia, depression, and weakened immunity." },
    "Biotin": { category: "B Vitamins", explanation: "Essential for fat synthesis, amino acid metabolism, and gene regulation. Excess intake is generally safe. Deficiency causes hair loss, skin rash, and neurological symptoms." },
    "Folate, DFE": { category: "Folate", explanation: "Essential for DNA synthesis, cell division, and preventing birth defects. Excess intake may mask B12 deficiency. Deficiency causes anemia, birth defects, and poor wound healing." },
    "Folate, total": { category: "Folate", explanation: "Essential for red blood cell formation and neural tube development. Excess intake may hide vitamin B12 deficiency symptoms. Deficiency leads to megaloblastic anemia and neural tube defects." },
    "Folate, food": { category: "Folate", explanation: "Essential for cellular metabolism and DNA repair. Excess intake is rare from food sources. Deficiency causes fatigue, poor concentration, and increased disease risk." },
    "Folic acid": { category: "Folate", explanation: "Essential for preventing birth defects and supporting cell growth. Excess intake may mask B12 deficiency and affect immune function. Deficiency causes severe anemia and developmental problems." },
    "5-methyl tetrahydrofolate (5-MTHF)": { category: "Folate", explanation: "Essential for methylation reactions and neurotransmitter production. Excess intake may cause methylation imbalances. Deficiency leads to depression, cognitive decline, and cardiovascular disease." },
    "10-Formyl folic acid (10HCOFA)": { category: "Folate", explanation: "Essential for purine synthesis and DNA formation. Excess intake may disrupt folate metabolism. Deficiency impairs cellular division and growth." },
    "5-Formyltetrahydrofolic acid (5-HCOH4": { category: "Folate", explanation: "Essential for one-carbon transfer reactions. Excess intake may affect folate balance. Deficiency disrupts amino acid metabolism and DNA synthesis." },
    "Vitamin B-12": { category: "B Vitamins", explanation: "Essential for nerve function, red blood cell formation, and DNA synthesis. Excess intake is generally safe. Deficiency causes pernicious anemia, nerve damage, and cognitive decline." },
    "Vitamin B-12, added": { category: "B Vitamins", explanation: "Essential for neurological function and blood formation. Excess intake rarely causes problems. Deficiency leads to irreversible nerve damage and severe anemia." },

    // MINERALS
    "Calcium, Ca": { category: "Major Minerals", explanation: "Essential for bone and teeth health, muscle function, and nerve signaling. Excess intake may cause kidney stones and interfere with other minerals. Deficiency leads to osteoporosis, muscle cramps, and dental problems." },
    "Iron, Fe": { category: "Trace Minerals", explanation: "Essential for oxygen transport and energy metabolism. Excess intake causes iron toxicity, liver damage, and organ failure. Deficiency causes anemia, fatigue, and poor immune function." },
    "Magnesium, Mg": { category: "Major Minerals", explanation: "Essential for over 300 enzyme reactions, bone health, and muscle function. Excess intake may cause diarrhea and nausea. Deficiency leads to muscle cramps, irregular heartbeat, and weakness." },
    "Phosphorus, P": { category: "Major Minerals", explanation: "Essential for bone health, energy storage, and cell membrane structure. Excess intake may interfere with calcium absorption. Deficiency causes bone weakness, fatigue, and poor growth." },
    "Potassium, K": { category: "Major Minerals", explanation: "Essential for heart function, muscle contractions, and blood pressure regulation. Excess intake may cause hyperkalemia and heart problems. Deficiency leads to high blood pressure, muscle weakness, and fatigue." },
    "Sodium, Na": { category: "Major Minerals", explanation: "Essential for fluid balance and nerve function. Excess intake causes high blood pressure, stroke, and heart disease. Deficiency leads to muscle cramps, headaches, and weakness." },
    "Zinc, Zn": { category: "Trace Minerals", explanation: "Essential for immune function, wound healing, and protein synthesis. Excess intake may cause copper deficiency and immune suppression. Deficiency leads to poor wound healing, hair loss, and frequent infections." },
    "Copper, Cu": { category: "Trace Minerals", explanation: "Essential for iron metabolism, connective tissue formation, and antioxidant function. Excess intake causes liver toxicity and neurological problems. Deficiency leads to anemia, bone problems, and cardiovascular disease." },
    "Manganese, Mn": { category: "Trace Minerals", explanation: "Essential for bone development, wound healing, and antioxidant enzyme function. Excess intake may cause neurological toxicity. Deficiency leads to poor bone formation and impaired glucose tolerance." },
    "Selenium, Se": { category: "Trace Minerals", explanation: "Essential for antioxidant protection, thyroid function, and immune system. Excess intake causes selenosis with hair loss and nail problems. Deficiency leads to muscle weakness and increased infection risk." },
    "Molybdenum, Mo": { category: "Trace Minerals", explanation: "Essential for enzyme function and sulfur metabolism. Excess intake may cause copper deficiency. Deficiency leads to poor sulfur metabolism and neurological problems." },
    "Iodine, I": { category: "Trace Minerals", explanation: "Essential for thyroid hormone production and metabolic regulation. Excess intake may cause thyroid dysfunction. Deficiency leads to goiter, hypothyroidism, and developmental delays." },
    "Fluoride, F": { category: "Trace Minerals", explanation: "Essential for tooth enamel strength and cavity prevention. Excess intake causes dental and skeletal fluorosis. Deficiency increases tooth decay and cavity formation." },

    // FIBER & CARBOHYDRATES
    "Fiber, total dietary": { category: "Fiber", explanation: "Essential for digestive health, blood sugar control, and cholesterol reduction. Excess intake may cause bloating and nutrient malabsorption. Deficiency leads to constipation, high cholesterol, and increased disease risk." },
    "Total dietary fiber (AOAC 2011.25)": { category: "Fiber", explanation: "Essential for gut health and metabolic regulation. Excess intake may interfere with mineral absorption. Deficiency causes digestive problems and poor blood sugar control." },
    "Fiber, soluble": { category: "Fiber", explanation: "Essential for lowering cholesterol and stabilizing blood sugar. Excess intake may cause gas and digestive discomfort. Deficiency leads to elevated cholesterol and poor glucose control." },
    "Fiber, insoluble": { category: "Fiber", explanation: "Essential for preventing constipation and promoting regular bowel movements. Excess intake may cause digestive irritation. Deficiency leads to constipation and increased colon cancer risk." },
    "Sugars, Total": { category: "Sugars", explanation: "Provides quick energy for immediate needs. Excess intake causes tooth decay, weight gain, and diabetes risk. Deficiency is rare but may cause low blood sugar." },
    "Total Sugars": { category: "Sugars", explanation: "Essential for brain function and energy metabolism. Excess intake leads to obesity, diabetes, and dental problems. Deficiency causes hypoglycemia and fatigue." },
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
    "Fatty acids, total saturated": { category: "Fatty Acid Totals", explanation: "Provides energy and supports hormone production. Excess intake raises LDL cholesterol and heart disease risk. Deficiency is rare but may affect hormone synthesis." },
    "Fatty acids, total monounsaturated": { category: "Fatty Acid Totals", explanation: "Essential for heart health and inflammation reduction. Excess intake may contribute to weight gain. Deficiency may increase cardiovascular disease risk." },
    "Fatty acids, total polyunsaturated": { category: "Fatty Acid Totals", explanation: "Essential for brain function, inflammation control, and cell membranes. Excess intake may increase oxidation. Deficiency causes skin problems, poor wound healing, and cognitive issues." },
    "Cholesterol": { category: "Lipids", explanation: "Essential for hormone production and cell membrane structure. Excess intake may raise blood cholesterol in some people. Deficiency is rare as body produces cholesterol." },

    // AMINO ACIDS
    "Alanine": { category: "Amino Acids", explanation: "Essential for energy production and glucose metabolism. Excess intake is rare from food. Deficiency may impair energy production and immune response." },
    "Arginine": { category: "Amino Acids", explanation: "Essential for wound healing, immune function, and nitric oxide production. Excess intake may cause digestive upset. Deficiency leads to poor wound healing and weakened immunity." },
    "Aspartic acid": { category: "Amino Acids", explanation: "Essential for hormone production and nervous system function. Excess intake is uncommon. Deficiency may affect neurotransmitter balance." },
    "Cysteine": { category: "Amino Acids", explanation: "Essential for antioxidant production and protein structure. Excess intake may cause oxidative stress. Deficiency leads to poor antioxidant defense and hair problems." },
    "Cystine": { category: "Amino Acids", explanation: "Essential for protein structure and hair/nail health. Excess intake is rare. Deficiency causes weak hair, nails, and poor wound healing." },
    "Glutamic acid": { category: "Amino Acids", explanation: "Essential for brain function and neurotransmitter production. Excess intake may cause excitotoxicity. Deficiency may impair cognitive function." },
    "Glycine": { category: "Amino Acids", explanation: "Essential for collagen production and sleep quality. Excess intake is generally safe. Deficiency may cause poor sleep and joint problems." },
    "Histidine": { category: "Amino Acids", explanation: "Essential for growth, tissue repair, and histamine production. Excess intake may cause zinc deficiency. Deficiency leads to anemia and poor growth in children." },
    "Hydroxyproline": { category: "Amino Acids", explanation: "Essential for collagen structure and joint health. Excess intake is rare from food. Deficiency may contribute to joint problems and poor skin elasticity." },
    "Isoleucine": { category: "Amino Acids", explanation: "Essential for muscle metabolism, energy production, and immune function. Excess intake may interfere with other amino acids. Deficiency causes muscle wasting, fatigue, and poor healing." },
    "Leucine": { category: "Amino Acids", explanation: "Essential for muscle protein synthesis and tissue repair. Excess intake may reduce other amino acid absorption. Deficiency leads to muscle loss, poor wound healing, and fatigue." },
    "Lysine": { category: "Amino Acids", explanation: "Essential for protein synthesis, calcium absorption, and immune function. Excess intake may interfere with arginine. Deficiency causes poor growth, hair loss, and frequent infections." },
    "Methionine": { category: "Amino Acids", explanation: "Essential for metabolism, detoxification, and methylation reactions. Excess intake may increase homocysteine levels. Deficiency leads to fatty liver, poor detoxification, and muscle loss." },
    "Phenylalanine": { category: "Amino Acids", explanation: "Essential for neurotransmitter production and protein synthesis. Excess intake is dangerous for people with PKU. Deficiency causes depression, confusion, and poor memory." },
    "Proline": { category: "Amino Acids", explanation: "Essential for collagen production and wound healing. Excess intake is generally safe. Deficiency may contribute to poor wound healing and joint problems." },
    "Serine": { category: "Amino Acids", explanation: "Essential for protein synthesis and brain function. Excess intake is rare from food. Deficiency may affect cognitive function and muscle metabolism." },
    "Threonine": { category: "Amino Acids", explanation: "Essential for protein synthesis and immune function. Excess intake may interfere with other amino acids. Deficiency leads to poor growth, digestive problems, and weakened immunity." },
    "Tryptophan": { category: "Amino Acids", explanation: "Essential for serotonin production, mood regulation, and sleep. Excess intake may cause drowsiness. Deficiency leads to depression, insomnia, and mood disorders." },
    "Tyrosine": { category: "Amino Acids", explanation: "Essential for neurotransmitter production and stress response. Excess intake may affect thyroid function. Deficiency may cause depression, fatigue, and poor stress tolerance." },
    "Valine": { category: "Amino Acids", explanation: "Essential for muscle metabolism, tissue repair, and energy production. Excess intake may interfere with other amino acids. Deficiency causes muscle weakness, poor coordination, and growth problems." },

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