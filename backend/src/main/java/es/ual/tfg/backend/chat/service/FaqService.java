package es.ual.tfg.backend.chat.service;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.core.io.Resource;

@Service
public class FaqService {

  private final Client client;
  private final String model;
  private final String systemPrompt;

  public FaqService(
      Client client,
      @Value("${gemini.model.faq:gemini-2.5-flash}") String model,
      @Value("classpath:prompts/faqPrompt.txt") Resource promptFile
  ) throws Exception {
    this.client = client;
    this.model = model;
    this.systemPrompt = new String(promptFile.getInputStream().readAllBytes());
  }

  /** Genera una respuesta de FAQ en texto (sin mantener historial). */
  public String answer(String userQuestion) {
    try {
      // Mensaje del usuario
      Content user = Content.fromParts(Part.fromText(userQuestion));

      // Instrucción de sistema (opcional pero recomendado)
      GenerateContentConfig cfg = GenerateContentConfig.builder()
          .systemInstruction(Content.fromParts(Part.fromText(systemPrompt)))
          .temperature(0.2f) // estable
          .build();

      // Llamada directa (stateless): 1 entrada + config
      GenerateContentResponse res = client.models.generateContent(
          model,
          user,
          cfg
      );
      String text = res.text();
      return text != null ? text : "";
    } catch (Exception e) {
      // Lanza un error claro hacia el controlador
      throw new RuntimeException("Error generando respuesta FAQ: " + e.getMessage(), e);
    }
  }
}
