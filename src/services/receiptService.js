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
            content: `Eres un experto en OCR y análisis de boletas de supermercado. Tu especialidad es extraer productos alimenticios de textos OCR imperfectos.

REGLAS ESTRICTAS:
1. SOLO extraer alimentos y bebidas
2. Ignorar completamente: totales, subtotales, RUT, direcciones, fechas, números de boleta, propinas, descuentos, impuestos
3. Corregir errores comunes de OCR (ej: "L3che" → "Leche", "Y0gurt" → "Yogurt")
4. Normalizar nombres a español estándar
5. Eliminar códigos de producto y números al final
6. Si un nombre tiene precio o cantidad, separar solo el nombre del producto`
          },
          {
            role: "user",
            content: `Analiza este texto OCR de una boleta y extrae SOLO los productos alimenticios.

TEXTO OCR:
"""
${rawText}
"""

Para cada producto detectado:
1. Limpia el nombre (quita códigos, números, símbolos raros)
2. Estima cuántos días durará según su categoría:
   - Lácteos frescos (leche, yogurt): 5-7 días
   - Quesos maduros: 14-21 días
   - Frutas/verduras frescas: 3-5 días
   - Frutas/verduras maduras: 7-10 días
   - Carnes frescas: 2-3 días
   - Carnes envasadas: 5-7 días
   - Pan fresco: 2-3 días
   - Pan envasado: 7-10 días
   - Productos enlatados: 365+ días
   - Congelados: 90+ días
   - Productos secos (arroz, pasta, legumbres): 365+ días
   - Bebidas embotelladas: 90+ días
   - Bebidas gaseosas: 180+ días
   - Huevos: 21-28 días
   - Embutidos frescos: 3-5 días
   - Embutidos envasados: 14-21 días

3. Asigna la categoría correcta

RESPONDE SOLO CON UN JSON ARRAY (sin markdown, sin explicaciones):
[
  {
    "name": "Nombre del Producto Limpio",
    "quantity": 1,
    "days_left": <número>,
    "category": "<categoría>"
  }
]

Categorías válidas: Lácteos, Frutas, Verduras, Carnes, Despensa, Congelados, Bebidas, Panadería, Embutidos`
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.2, // Un poco más de creatividad para corregir errores
        max_tokens: 2000
      });

      let text = completion.choices[0]?.message?.content || "";
      
      console.log("📝 Respuesta RAW de Groq:", text.substring(0, 300));
      
      // Limpieza agresiva de formato JSON
      text = text.trim();
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Buscar el primer [ y el último ]
      const firstBracket = text.indexOf('[');
      const lastBracket = text.lastIndexOf(']');
      
      if (firstBracket !== -1 && lastBracket !== -1) {
        text = text.substring(firstBracket, lastBracket + 1);
      }

      const items = JSON.parse(text);

      // Filtro de seguridad extra (JavaScript)
      const forbiddenWords = [
        "BOLETA", "RUT", "TOTAL", "SUBTOTAL", "MESA", "CAJA", "LOCAL", 
        "SANTIAGO", "VITACURA", "TICKET", "PROPINA", "FECHA", "HORA", 
        "CLIENTE", "FISCAL", "COMENTARIO", "IVA", "NETO", "DESCUENTO",
        "VUELTO", "EFECTIVO", "TARJETA", "DEBITO", "CREDITO", "NUMERO"
      ];
      
      const filteredItems = items.filter(item => {
        const upperName = item.name.toUpperCase();
        // Filtros de validación
        if (item.name.length < 3) return false;
        if (/^[0-9\$\.,\-]+$/.test(item.name)) return false; // Solo números o símbolos
        if (forbiddenWords.some(word => upperName.includes(word))) return false;
        return true;
      });

      console.log(`✅ ${filteredItems.length} productos extraídos de la boleta`);
      
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