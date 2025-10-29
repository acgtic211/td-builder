package es.ual.tfg.backend.chat.controller;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import es.ual.tfg.backend.chat.GeminiClient;
import es.ual.tfg.backend.chat.TdSchemaFactory;
import es.ual.tfg.backend.chat.DTO.ChatDtos.ChatRequest;
import es.ual.tfg.backend.chat.DTO.ChatDtos.ChatResponse;

@RestController
@RequestMapping("/ai")
public class ChatController {

  private final GeminiClient gemini;
  private final String appContext;

  // ✅ Inyección por constructor: inicializa los final
  public ChatController(
      GeminiClient gemini,
      @Value("${app.context:}") String contextFromProps) {

    this.gemini = gemini;
    this.appContext = (contextFromProps != null && !contextFromProps.isBlank())
        ? contextFromProps
        : defaultContext();
  }

  // ✅ Método con tipo de retorno (ChatResponse)
  @PostMapping(
      path = "/chat",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE
  )
  public ChatResponse chat(@RequestBody @Valid ChatRequest req) {
    ChatResponse out = new ChatResponse();
    out.mode = req.mode.name();

    switch (req.mode) {
      case td -> {
        var schema = TdSchemaFactory.schema();
        var json = gemini.generateTd(req.message, appContext, schema);
        out.json = json;
      }
      case faq -> {
        var text = gemini.faq(req.message, appContext);
        out.text = text;
      }
    }
    return out;
  }

  private static String defaultContext() {
    return """
      - La app edita/genera Thing Descriptions.
      - Atributos COMUN (conservar al cambiar type): forms, uriVariables, unit, readOnly, writeOnly...
      - Backend expone /api; en dev front usa proxy /api a :8080.
    """;
  }
}