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
    OAuth2AuthenticationToken oAuth2AuthenticationToken = (OAuth2AuthenticationToken) authentication;

    if("google".equals(oAuth2AuthenticationToken.getAuthorizedClientRegistrationId())) {
      DefaultOAuth2User principal = (DefaultOAuth2User) authentication.getPrincipal();
      Map<String, Object> attributes = principal.getAttributes();
      
      Object subObj = attributes.get("sub");

      if (subObj == null) {
          System.err.println("El atributo 'sub' es nulo");
          response.sendRedirect("/error");
          return;
      }

      String sub = (String) subObj;
      
      String pictureUrl = (String) attributes.get("picture");

      User user = userService.findById(sub);

      if (user == null) {
        user = new User();
        user.setId(sub);
        user.setPictureUrl(pictureUrl);

        userService.saveUser(user);

        DefaultOAuth2User newUserDetails = new DefaultOAuth2User(
            Collections.emptyList(),  // No autoridades
            attributes, "id");
    
        Authentication newAuth = new OAuth2AuthenticationToken(
            newUserDetails, 
            Collections.emptyList(),  // No autoridades
            oAuth2AuthenticationToken.getAuthorizedClientRegistrationId());

        SecurityContextHolder.getContext().setAuthentication(newAuth);
      }
    }
    this.setAlwaysUseDefaultTargetUrl(true);
    this.setDefaultTargetUrl(frontendUrl);
    super.onAuthenticationSuccess(request, response, authentication);
  }
}
