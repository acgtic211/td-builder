package es.ual.tfg.backend.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateThingDescriptionRequest(
  @NotBlank String name,
  @NotNull com.fasterxml.jackson.databind.JsonNode tdJson
) {}
