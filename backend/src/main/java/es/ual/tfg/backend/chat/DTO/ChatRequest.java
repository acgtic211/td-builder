package es.ual.tfg.backend.chat.DTO;

import jakarta.validation.constraints.NotBlank;

public class ChatRequest {
  @NotBlank public String mode;
  @NotBlank public String message;
}