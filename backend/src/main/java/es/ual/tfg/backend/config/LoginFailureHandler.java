package es.ual.tfg.backend.config;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

public class LoginFailureHandler implements AuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(
          HttpServletRequest request,
          HttpServletResponse response,
          AuthenticationException exception) throws IOException {
      
      System.err.println("Authentication failed: " + exception.getMessage());
      return;
    }
}
