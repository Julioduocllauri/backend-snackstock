import Groq from "groq-sdk";
import 'dotenv/config';

class ReceiptService {
  /**
   * Limpiar y extraer productos de texto OCR usando Groq AI
   */
  static async cleanReceiptText(rawText) {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      console.error("❌ ERROR: Falta GROQ_API_KEY");
      throw new Error('Falta configuración de API Key');
    }

    const groq = new Groq({ apiKey: apiKey });

    try {
      // Le pedimos a Groq que limpie la boleta
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Eres un asistente experto en estructurar datos de compras. Tu trabajo es extraer alimentos y bebidas de textos OCR sucios."
          },
          {
            role: "user",
            content: `Analiza el texto de esta boleta y extrae SOLO los alimentos/bebidas.
                      Ignora: Propina, Total, RUT, Direcciones, Mesas, Personas.
                      Arregla nombres mal escritos (ej: "L3che" -> "Leche").
                      
                      IMPORTANTE: Para cada producto, detecta automáticamente cuántos días durará según su tipo:
                      - Lácteos (leche, yogurt, queso fresco): 5-7 días
                      - Frutas/verduras frescas: 3-5 días
                      - Carnes frescas: 2-3 días
                      - Productos envasados: 30+ días
                      - Congelados: 90+ días
                      - Productos secos (arroz, pasta): 365+ días
                      
                      TEXTO OCR:
                      "${rawText}"

                      FORMATO RESPUESTA (Solo JSON Array válido):
                      [
                        {"name": "Nombre Producto", "quantity": 1, "days_left": <número calculado>, "category": "Lácteos"}
                      ]
                      
                      Las categorías válidas son: Lácteos, Frutas, Verduras, Carnes, Despensa, Congelados, Bebidas`
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1, // Temperatura baja para que sea muy preciso
      });

      let text = completion.choices[0]?.message?.content || "";
      
      // Limpieza de formato JSON
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const items = JSON.parse(text);

      // Filtro de seguridad extra (JavaScript)
      const forbiddenWords = [
        "BOLETA", "RUT", "TOTAL", "SUBTOTAL", "MESA", "CAJA", "LOCAL", 
        "SANTIAGO", "VITACURA", "TICKET", "PROPINA", "FECHA", "HORA", 
        "CLIENTE", "FISCAL", "COMENTARIO"
      ];
      
      const filteredItems = items.filter(item => {
        const upperName = item.name.toUpperCase();
        if (item.name.length < 3) return false;
        return !forbiddenWords.some(word => upperName.includes(word));
      });

      return filteredItems;

    } catch (error) {
      console.error("❌ Error en Escáner (Groq):", error.message);
      throw error;
    }
  }

  /**
   * Procesar boleta completa: limpiar y preparar para guardar
   */
  static async processReceipt(rawText, userId) {
    const items = await this.cleanReceiptText(rawText);

    if (items.length === 0) {
      throw new Error("No se encontraron alimentos en la boleta");
    }

    // Preparamos los artículos para insertar en la base de datos
    const itemsToInsert = items.map(item => {
      // Calculamos la fecha de vencimiento basada en la estimación
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (item.days_left || 7)); // Default 7 días

      return {
        user_id: userId,
        name: item.name,
        quantity: item.quantity || 1,
        category: item.category || 'General',
        expiry_date: expiryDate.toISOString().split('T')[0]
      };
    });

    return itemsToInsert;
  }
}

export default ReceiptService;