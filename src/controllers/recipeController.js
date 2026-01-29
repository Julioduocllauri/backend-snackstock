import Groq from "groq-sdk";
import 'dotenv/config';

class RecipeController {
  /**
   * Generar múltiples recetas con IA usando Groq
   */
  static async generate(req, res) {
    try {
      const { ingredients } = req.body; // Ahora acepta array
      const apiKey = process.env.GROQ_API_KEY;

      if (!apiKey) {
        console.error("❌ ERROR: Falta GROQ_API_KEY en el .env");
        return res.status(500).json({ 
          success: false,
          error: "Falta API Key de Groq" 
        });
      }

      if (!ingredients || ingredients.length === 0) {
        return res.status(400).json({ 
          success: false,
          error: "Se requiere al menos un ingrediente" 
        });
      }

      const ingredientsList = Array.isArray(ingredients) ? ingredients.join(', ') : ingredients;
      console.log(`👨‍🍳 Generando 3 recetas con Groq (Llama 3): ${ingredientsList}...`);

      const groq = new Groq({ apiKey: apiKey });

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Eres un chef experto. Responde SOLO con JSON válido sin markdown ni explicaciones adicionales."
          },
          {
            role: "user",
            content: `Crea 3 recetas diferentes y creativas usando estos ingredientes: ${ingredientsList}.
                      Cada receta debe ser única (desayuno, almuerzo, cena o postre).
                      
                      FORMATO JSON OBLIGATORIO (sin \`\`\`json, sin explicaciones):
                      {
                        "recipes": [
                          {
                            "title": "Nombre del Plato 1",
                            "difficulty": "Fácil",
                            "time": "20 min",
                            "servings": 2,
                            "ingredients": ["Ingrediente 1", "Ingrediente 2", "Ingrediente 3"],
                            "instructions": ["Paso 1", "Paso 2", "Paso 3"]
                          },
                          {
                            "title": "Nombre del Plato 2",
                            "difficulty": "Media",
                            "time": "30 min",
                            "servings": 3,
                            "ingredients": ["Ingrediente 1", "Ingrediente 2"],
                            "instructions": ["Paso 1", "Paso 2"]
                          },
                          {
                            "title": "Nombre del Plato 3",
                            "difficulty": "Fácil",
                            "time": "15 min",
                            "servings": 2,
                            "ingredients": ["Ingrediente 1", "Ingrediente 2"],
                            "instructions": ["Paso 1", "Paso 2"]
                          }
                        ]
                      }`
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7, // Más creatividad
      });

      let text = completion.choices[0]?.message?.content || "";
      
      // Limpieza por si la IA pone ```json
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const result = JSON.parse(text);
      
      console.log("✅ ¡3 RECETAS GENERADAS CON GROQ!");
      
      res.json({
        success: true,
        data: result.recipes
      });

    } catch (error) {
      console.error("❌ Error con Groq:", error.message);
      
      // Respuesta de emergencia con 3 recetas básicas
      const ingredientsList = Array.isArray(req.body.ingredients) ? req.body.ingredients[0] : req.body.ingredients;
      res.json({
        success: true,
        data: [
          {
            title: `Salteado de ${ingredientsList}`,
            difficulty: "Fácil",
            time: "15 min",
            servings: 2,
            ingredients: [ingredientsList, "Sal", "Aceite", "Ajo"],
            instructions: ["Calentar aceite", "Saltear el ingrediente", "Servir caliente"]
          },
          {
            title: `${ingredientsList} al horno`,
            difficulty: "Media",
            time: "30 min",
            servings: 3,
            ingredients: [ingredientsList, "Especias", "Aceite de oliva"],
            instructions: ["Precalentar horno a 180°C", "Hornear 25 min", "Servir"]
          },
          {
            title: `Ensalada con ${ingredientsList}`,
            difficulty: "Fácil",
            time: "10 min",
            servings: 2,
            ingredients: [ingredientsList, "Lechuga", "Tomate", "Limón"],
            instructions: ["Mezclar ingredientes", "Aliñar con limón", "Servir frío"]
          }
        ]
      });
    }
  }
}

export default RecipeController;