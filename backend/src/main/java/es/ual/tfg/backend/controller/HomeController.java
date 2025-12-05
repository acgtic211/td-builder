package es.ual.tfg.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;

@CrossOrigin(origins = "http://localhost")
@RestController
public class HomeController {
  @GetMapping("/user-logged")
  public Object getUserDetails(Authentication authentication) {
    if (authentication != null && authentication.getPrincipal() instanceof OAuth2User) {
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        return oauthUser.getAttributes();
    }
    return "No user is currently authenticated";
  }
}
