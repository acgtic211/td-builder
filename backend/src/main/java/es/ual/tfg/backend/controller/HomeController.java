package es.ual.tfg.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;

@CrossOrigin(origins = "http://localhost")
@RestController
public class HomeController {
  @GetMapping("/user-logged")
  public ResponseEntity<?> getUserDetails(Authentication authentication) {
    if (authentication != null && authentication.getPrincipal() instanceof OAuth2User oauthUser) {
      return ResponseEntity.ok(oauthUser.getAttributes());
    }
    return ResponseEntity.status(401).body("No user is currently authenticated");
  }
}
