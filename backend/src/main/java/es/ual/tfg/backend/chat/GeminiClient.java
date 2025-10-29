package es.ual.tfg.backend.chat;

import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class GeminiClient {

  private final WebClient webClient;
  private final String apiKey;
  private final String modelFaq;
  private final String modelTd;

  public GeminiClient(
      WebClient geminiWebClient,
      @Value("${gemini.api.key}") String apiKey,
      @Value("${gemini.model.faq}") String modelFaq,
      @Value("${gemini.model.td}") String modelTd) {
    this.webClient = geminiWebClient;
    this.apiKey = apiKey;
    this.modelFaq = modelFaq;
    this.modelTd = modelTd;
  }

  /** generateContent para FAQ (texto) */
  public String faq(String userMsg, String context) {
    var body = Map.of(
      "contents", List.of(
        Map.of("role","user","parts", List.of(
          Map.of("text", buildFaqPrompt(context, userMsg))
        ))
      )
    );

    var path = String.format("/v1beta/models/%s:generateContent?key=%s", modelFaq, apiKey);

    var resp = webClient.post()
        .uri(path)
        .contentType(MediaType.APPLICATION_JSON)
        .bodyValue(body)
        .retrieve()
        .bodyToMono(Map.class)
        .block();

    return extractText(resp);
  }

  /** generateContent para TD (JSON) con salida estructurada */
  public Object generateTd(String userMsg, String context, Map<String,Object> responseSchema) {
    var generationConfig = Map.of(
      "response_mime_type", "application/json",
      "response_schema", responseSchema,
      "temperature", 0.2
    );

    var body = Map.of(
      "contents", List.of(
        Map.of("role","user","parts", List.of(
          Map.of("text", buildTdPrompt(context, userMsg))
        ))
      ),
      "generationConfig", generationConfig
    );

    var path = String.format("/v1beta/models/%s:generateContent?key=%s", modelTd, apiKey);

    var resp = webClient.post()
        .uri(path)
        .contentType(MediaType.APPLICATION_JSON)
        .bodyValue(body)
        .retrieve()
        .bodyToMono(Map.class)
        .block();

    // La respuesta ya debería ser JSON válido según el esquema
    var text = extractText(resp);
    // Intentamos parsearlo a Map; si falla, devolvemos el raw string
    try {
      return JsonUtil.parse(text);
    } catch (Exception e) {
      return text;
    }
  }

  private String buildFaqPrompt(String context, String userMsg) {
    return """
      Eres el asistente de TD Builder (ChatWoT).
      Responde en español, claro y conciso.
      Contexto de la app:
      """ + context + """

      Pregunta del usuario:
      """ + userMsg + """
      """;
  }

  private String buildTdPrompt(String context, String userMsg) {
    return """
      Eres el asistente de TD Builder (ChatWoT).
      Debes DEVOLVER EXCLUSIVAMENTE JSON válido según el esquema indicado por el servidor.
      Ajusta la Thing Description al formato que usa la app (nombres de campos y tipos).
      Contexto de la app:
      """ + context + """

      Solicitud de TD:
      """ + userMsg + """
      """;
  }

  @SuppressWarnings({ "unchecked", "rawtypes" })
  private String extractText(Map resp) {
    if (resp == null) return "";
    var candidates = (List<Map<String,Object>>) resp.get("candidates");
    if (candidates == null || candidates.isEmpty()) return "";
    var content = (Map<String,Object>) candidates.get(0).get("content");
    if (content == null) return "";
    var parts = (List<Map<String,Object>>) content.get("parts");
    if (parts == null || parts.isEmpty()) return "";
    var first = parts.get(0);
    var text = (String) first.get("text");
    return text != null ? text : "";
  }
}