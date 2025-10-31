package es.ual.tfg.backend.chat.config;

import com.google.genai.Client;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Optional;

@Configuration
public class GeminiConfig {

  @Bean
  public Client genaiClient(
      @Value("ApiKEy") String apiKey,
      @Value("https://generativelanguage.googleapis.com") String baseUrl
  ) {
    // Forzamos Developer API (no Vertex) fijando el base URL del Gemini API
    Client.setDefaultBaseUrls(Optional.of(baseUrl), Optional.empty()); // usa Dev API
    // El Builder permite pasar la API key directamente
    return Client.builder()
        .apiKey(apiKey)
        .build();
  }
}