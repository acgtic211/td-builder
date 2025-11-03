package es.ual.tfg.backend.chat.controller;

import es.ual.tfg.backend.chat.service.FaqService;

import es.ual.tfg.backend.chat.DTO.FaqRequest;
import es.ual.tfg.backend.chat.DTO.FaqResponse;
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
  public FaqResponse chat(@RequestBody FaqRequest req) {
    try {
      var out = new FaqResponse();
      out.text = faq.answer(req.message); 
      return out;
    } catch (Exception e) {
      throw new ResponseStatusException(
          HttpStatus.BAD_GATEWAY,
          "Error generando respuesta de IA: " + e.getMessage(), e
      );
    }
  }
}