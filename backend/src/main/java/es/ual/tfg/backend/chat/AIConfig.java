package es.ual.tfg.backend.chat;

import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

@Configuration
public class AIConfig {

  @Bean
  WebClient geminiWebClient(
      @Value("${gemini.base.url}") String baseUrl,
      @Value("${webclient.connect.timeout-ms:5000}") long connectTimeoutMs,
      @Value("${webclient.read.timeout-ms:30000}") long readTimeoutMs) {

    var httpClient = HttpClient.create()
        .responseTimeout(Duration.ofMillis(readTimeoutMs));

    return WebClient.builder()
        .clientConnector(new ReactorClientHttpConnector(httpClient))
        .baseUrl(baseUrl)
        .build();
  }
}