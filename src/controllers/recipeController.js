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
            content: "Eres un chef experto y creativo que escribe recetas detalladas y fáciles de seguir. Tus instrucciones son claras, específicas y motivadoras. Cada paso debe ser CORTO (máximo 2 líneas) y enfocarse en UNA SOLA acción. Responde SOLO con JSON válido sin markdown ni explicaciones adicionales."
          },
          {
            role: "user",
            content: `Crea ${count} receta(s) diferente(s) y creativa(s) usando principalmente estos ingredientes: ${ingredientsList}.
                      ${count > 1 ? 'Cada receta debe ser única y variada (desayuno, almuerzo, cena o postre).' : ''}
                      
                      CRÍTICO - REGLAS PARA LOS PASOS:
                      - Cada paso debe ser CORTO (máximo 2 líneas, idealmente 1)
                      - UN paso = UNA acción específica
                      - Divide acciones complejas en varios pasos simples
                      - Usa verbos de acción al inicio de cada paso
                      - Mínimo 8-12 pasos por receta para que sea fácil de seguir
                      
                      EJEMPLO DE PASOS BUENOS:
                      ✅ "Precalienta el horno a 180°C."
                      ✅ "Bate los 2 huevos en un bowl durante 2 minutos hasta que estén espumosos."
                      ✅ "Agrega 200g de harina tamizada poco a poco mientras mezclas."
                      ✅ "Engrasa un molde de 20cm con mantequilla."
                      
                      EJEMPLO DE PASOS MALOS (NO HACER):
                      ❌ "Precalienta el horno a 180°C. Bate los huevos con el azúcar durante 5 minutos hasta que estén esponjosos y luego agrega la harina poco a poco mientras sigues batiendo..."
                      
                      INGREDIENTES:
                      - Los ingredientes deben incluir cantidades EXACTAS (ej: "2 huevos", "200g de harina", "1 cucharadita de sal")
                      - Usa medidas estándar y claras
                      
                      FORMATO JSON OBLIGATORIO (sin \`\`\`json, sin explicaciones):
                      {
                        "recipes": [
                          ${Array.from({length: count}, (_, i) => `{
                            "title": "Nombre Creativo y Apetitoso del Plato ${i + 1}",
                            "difficulty": "Fácil/Media/Difícil",
                            "time": "XX min",
                            "servings": 2,
                            "ingredients": [
                              "Cantidad exacta + Ingrediente 1",
                              "Cantidad exacta + Ingrediente 2",
                              "Cantidad exacta + Ingrediente 3"
                            ],
                            "instructions": [
                              "Paso 1: Una acción simple y específica (máx 2 líneas)",
                              "Paso 2: Otra acción simple y específica",
                              "Paso 3: Siguiente acción simple",
                              "... (8-12 pasos totales)"
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