import Groq from "groq-sdk";
import 'dotenv/config';

class RecipeController {
  /**
   * Generar receta con IA usando Groq
   */
  static async generate(req, res) {
    try {
      const { ingredient } = req.body;
      const apiKey = process.env.GROQ_API_KEY;

      if (!apiKey) {
        console.error("❌ ERROR: Falta GROQ_API_KEY en el .env");
        return res.status(500).json({ 
          success: false,
          error: "Falta API Key de Groq" 
        });
      }

      if (!ingredient) {
        return res.status(400).json({ 
          success: false,
          error: "El ingrediente es requerido" 
        });
      }

      console.log(`👨‍🍳 Generando receta con Groq (Llama 3): ${ingredient}...`);

      const groq = new Groq({ apiKey: apiKey });

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Eres un chef experto. Responde SOLO con JSON válido."
          },
          {
            role: "user",
            content: `Crea una receta creativa y breve usando: ${ingredient}.
                      FORMATO JSON OBLIGATORIO (sin markdown, sin explicaciones):
                      {
                        "title": "Nombre del Plato",
                        "ingredients": ["Ingrediente 1", "Ingrediente 2"],
                        "instructions": ["Paso 1", "Paso 2"]
                      }`
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
      });

      let text = completion.choices[0]?.message?.content || "";
      
      // Limpieza por si la IA pone ```json
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const recipe = JSON.parse(text);
      
      console.log("✅ ¡RECETA GENERADA CON GROQ!");
      
      res.json({
        success: true,
        data: recipe
      });

    } catch (error) {
      console.error("❌ Error con Groq:", error.message);
      
      // Respuesta de emergencia
      res.json({
        success: true,
        data: {
          title: `Plato Rápido de ${req.body.ingredient}`,
          ingredients: [req.body.ingredient, "Sal", "Aceite"],
          instructions: ["Cocinar a fuego lento.", "Servir."]
        }
      });
    }
  }
}

export default RecipeController;