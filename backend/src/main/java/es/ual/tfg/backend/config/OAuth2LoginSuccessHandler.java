package es.ual.tfg.backend.config;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;

import org.springframework.security.oauth2.core.user.DefaultOAuth2User;

import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import es.ual.tfg.backend.entity.User;
import es.ual.tfg.backend.service.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2LoginSuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {

  @Autowired
  private UserService userService;

  @Value("${frontend.url}")
  private String frontendUrl;
  
  @Override
  public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
    OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;

    if("google".equals(token.getAuthorizedClientRegistrationId())) {
      DefaultOAuth2User principal = (DefaultOAuth2User) token.getPrincipal();
      Map<String, Object> attributes = principal.getAttributes();
      
      String sub = (String) attributes.get("sub");
      if (sub == null) {
          response.setStatus(500);
          response.getWriter().write("Missing 'sub' claim from Google user");
          return;
      }
      
      String pictureUrl = (String) attributes.get("picture");

      User user = userService.findById(sub);

      if (user == null) {
        user = new User();
        user.setId(sub);
        user.setPictureUrl(pictureUrl);

        userService.saveUser(user);
      }
    }
    response.sendRedirect(frontendUrl);
  }
}
