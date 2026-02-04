import Groq from "groq-sdk";
import 'dotenv/config';

class RecipeController {
  /**
   * Generar múltiples recetas con IA usando Groq
   */
  static async generate(req, res) {
    try {
      const { ingredients, count = 3 } = req.body; // count = cuántas recetas generar (default 3)
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
      console.log(`👨‍🍳 Generando ${count} receta(s) con Groq (Llama 3): ${ingredientsList}...`);

      const groq = new Groq({ apiKey: apiKey });

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Eres un chef experto y creativo que escribe recetas detalladas y fáciles de seguir. Tus instrucciones son claras, específicas y motivadoras. Responde SOLO con JSON válido sin markdown ni explicaciones adicionales."
          },
          {
            role: "user",
            content: `Crea ${count} receta(s) diferente(s) y creativa(s) usando principalmente estos ingredientes: ${ingredientsList}.
                      ${count > 1 ? 'Cada receta debe ser única y variada (desayuno, almuerzo, cena o postre).' : ''}
                      
                      IMPORTANTE:
                      - Las instrucciones deben ser DETALLADAS y ESPECÍFICAS (mínimo 5-8 pasos)
                      - Incluye temperaturas, tiempos de cocción exactos, y técnicas culinarias
                      - Explica el "por qué" de cada paso cuando sea relevante
                      - Usa lenguaje motivador y descriptivo
                      - Los ingredientes deben incluir cantidades específicas (ej: "2 huevos", "200g de harina")
                      - Añade consejos y trucos cuando sea apropiado
                      
                      FORMATO JSON OBLIGATORIO (sin \`\`\`json, sin explicaciones):
                      {
                        "recipes": [
                          ${Array.from({length: count}, (_, i) => `{
                            "title": "Nombre Creativo del Plato ${i + 1}",
                            "difficulty": "Fácil/Media/Difícil",
                            "time": "XX min",
                            "servings": 2,
                            "ingredients": ["Cantidad + Ingrediente 1", "Cantidad + Ingrediente 2", "etc"],
                            "instructions": [
                              "Paso 1 con detalles específicos sobre temperatura/tiempo/técnica",
                              "Paso 2 explicando el proceso claramente",
                              "Paso 3 con consejos adicionales",
                              "etc (5-8 pasos mínimo)"
                            ]
                          }`).join(',\n                          ')}
                        ]
                      }`
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7, // Más creatividad
      });

      let text = completion.choices[0]?.message?.content || "";
      
      console.log("📝 Respuesta de Groq:", text.substring(0, 200) + "...");
      
      // Limpieza agresiva del JSON
      text = text.trim();
      
      // Remover markdown
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Buscar el primer { y el último }
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        text = text.substring(firstBrace, lastBrace + 1);
      }

      const result = JSON.parse(text);
      
      if (!result.recipes || !Array.isArray(result.recipes)) {
        throw new Error("Formato de respuesta inválido");
      }
      
      console.log("✅ ¡RECETAS GENERADAS CON GROQ!");
      console.log(`📋 ${result.recipes.length} recetas creadas`);
      
      res.json({
        success: true,
        data: result.recipes
      });

    } catch (error) {
      console.error("❌ Error con Groq:", error.message);
      console.error("Stack:", error.stack);
      
      // Respuesta de emergencia
      const { count = 3, ingredients } = req.body;
      const ingredientsList = Array.isArray(ingredients) ? ingredients[0] : ingredients;
      
      const fallbackRecipes = Array.from({ length: count }, (_, i) => {
        const types = [
          { title: `Salteado de ${ingredientsList}`, difficulty: "Fácil", time: "15 min" },
          { title: `${ingredientsList} al horno`, difficulty: "Media", time: "30 min" },
          { title: `Ensalada con ${ingredientsList}`, difficulty: "Fácil", time: "10 min" }
        ];
        const type = types[i % 3];
        return {
          title: type.title,
          difficulty: type.difficulty,
          time: type.time,
          servings: 2,
          ingredients: [ingredientsList, "Sal", "Aceite", "Especias"],
          instructions: ["Preparar ingredientes", "Cocinar según preferencia", "Servir caliente"]
        };
      });
      
      res.json({
        success: true,
        data: fallbackRecipes
      });
    }
  }
}

export default RecipeController;