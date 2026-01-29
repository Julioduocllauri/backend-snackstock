// Base de datos de calorías por producto (promedio por 100g o porción estándar)
export const CALORIES_DB = {
  // Lácteos
  'leche': 60,
  'yogurt': 60,
  'queso': 350,
  'mantequilla': 717,
  'crema': 345,
  
  // Frutas
  'manzana': 52,
  'plátano': 89,
  'naranja': 47,
  'uva': 67,
  'sandía': 30,
  'piña': 50,
  'frutilla': 32,
  'pera': 57,
  
  // Verduras
  'lechuga': 15,
  'tomate': 18,
  'zanahoria': 41,
  'cebolla': 40,
  'papa': 77,
  'brócoli': 34,
  'espinaca': 23,
  'pimiento': 31,
  
  // Carnes
  'pollo': 165,
  'carne': 250,
  'pescado': 206,
  'cerdo': 242,
  'pavo': 135,
  
  // Pan y cereales
  'pan': 265,
  'arroz': 130,
  'pasta': 131,
  'avena': 389,
  'cereal': 375,
  
  // Otros
  'huevo': 155,
  'aceite': 884,
  'azúcar': 387,
  'sal': 0,
  'agua': 0,
  'ginger ale': 124,
  'agua con gas': 0,
  'galleta': 450
};

/**
 * Estimar calorías de un producto
 */
export function estimateCalories(productName, quantity = 1) {
  const normalizedName = productName.toLowerCase().trim();
  
  // Buscar coincidencia exacta
  if (CALORIES_DB[normalizedName]) {
    return CALORIES_DB[normalizedName] * quantity;
  }
  
  // Buscar coincidencia parcial
  for (const [key, value] of Object.entries(CALORIES_DB)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value * quantity;
    }
  }
  
  // Valor por defecto
  return 100 * quantity;
}
