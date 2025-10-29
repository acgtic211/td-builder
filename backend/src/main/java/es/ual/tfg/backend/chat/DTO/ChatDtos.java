package es.ual.tfg.backend.chat.DTO;

import jakarta.validation.constraints.NotBlank;

public class ChatDtos {
  public enum Mode { faq, td }

  public static class ChatRequest {
    @NotBlank public String message;
    public Mode mode = Mode.faq;
  }

  public static class ChatResponse {
    public String mode;          // "faq" | "td"
    public String text;          // para faq
    public Object json;          // para td (TD JSON)
  }
}
