package es.ual.tfg.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

  @Autowired
  private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

  @Value("${frontend.url}")
  private String frontendUrl;

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
      .csrf(AbstractHttpConfigurer::disable)
      .cors(cors->cors.configurationSource(corsConfiguration()))
      .authorizeHttpRequests(auth -> {
        auth.requestMatchers("/").permitAll();
        auth.anyRequest().authenticated();
      })
      .oauth2Login(oauth2 -> {
        oauth2.successHandler(oAuth2LoginSuccessHandler);
        oauth2.failureHandler(new LoginFailureHandler());
        oauth2.loginPage("/oauth2/authorization/google");
      })
      .logout(logout -> logout
        .logoutUrl("/logout")             // URL de logout: /api/logout
        .deleteCookies("JSESSIONID")      // borra la cookie de sesión
        .invalidateHttpSession(true)      // invalida la sesión en el servidor
        .logoutSuccessHandler((request, response, authentication) -> {
            response.sendRedirect(frontendUrl);
        })
      );
        
    return http.build();
  }

  @Bean
  CorsConfigurationSource corsConfiguration() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of(frontendUrl));
    configuration.addAllowedHeader("*");
    configuration.addAllowedMethod("*");
    configuration.setAllowCredentials(true);
    configuration.addExposedHeader("Location");
    configuration.addExposedHeader("Authorization");
    configuration.addExposedHeader("Content-Type");

    UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
    urlBasedCorsConfigurationSource.registerCorsConfiguration("/**", configuration);

    
    return urlBasedCorsConfigurationSource;
  }
}



