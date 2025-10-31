package es.ual.tfg.backend.chat.controller;

import es.ual.tfg.backend.chat.service.FaqService;

import es.ual.tfg.backend.chat.DTO.ChatRequest;
import es.ual.tfg.backend.chat.DTO.ChatResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/ai")
public class ChatController {

  private final FaqService faq;

  public ChatController(FaqService faq) {
    this.faq = faq;
  }

  @PostMapping("/faq")
  public ChatResponse chat(@RequestBody ChatRequest req) {
    try {
      var out = new ChatResponse();
      faq.answer(req.message); 
      return out;
    } catch (Exception e) {
      throw new ResponseStatusException(
          HttpStatus.BAD_GATEWAY,
          "Error generando respuesta de IA: " + e.getMessage(), e
      );
    }
  }
}