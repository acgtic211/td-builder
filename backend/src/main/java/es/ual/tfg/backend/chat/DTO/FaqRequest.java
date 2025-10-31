package es.ual.tfg.backend.chat.DTO;

import jakarta.validation.constraints.NotBlank;

public class FaqRequest {
  @NotBlank public String message;
}