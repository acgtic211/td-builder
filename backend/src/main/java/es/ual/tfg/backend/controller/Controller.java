package es.ual.tfg.backend.controller;

import java.net.URI;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.security.core.Authentication;

import es.ual.tfg.backend.DTO.CreateThingDescriptionRequest;
import es.ual.tfg.backend.entity.ThingDescription;
import es.ual.tfg.backend.entity.User;
import es.ual.tfg.backend.repository.ThingDescriptionRepository;
import es.ual.tfg.backend.repository.UserRepository;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/save")
public class Controller {
  @Autowired
  UserRepository userRepository;

  @Autowired
  ThingDescriptionRepository thingDescriptionRepository;

  private User getCurrentUser(Authentication authentication) {
    if (authentication == null || !authentication.isAuthenticated()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
    }

    if (!(authentication.getPrincipal() instanceof OAuth2User oauth2User)) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tipo de autenticación no soportado");
    }

    // Atributos que te da Google (name, email, sub, picture, etc.)
    String id = oauth2User.getAttribute("sub");
    if (id == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No se ha podido obtener el id del usuario");
    }

    return userRepository.findById(id)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no registrado en la BD"));
  }

  @PostMapping("/thing-descriptions")
  public ResponseEntity<ThingDescription> addThingDescriptionsToCurrentUser(@Valid @RequestBody CreateThingDescriptionRequest req, Authentication authentication) {
    User user = getCurrentUser(authentication);
    if (user == null) return ResponseEntity.notFound().build();

    ThingDescription  ent = new ThingDescription();
    ent.setName(req.name());
    ent.setTd(req.tdJson());
    ent.setOwner(user);
    
    ThingDescription  saved = thingDescriptionRepository.save(ent);

    URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
    .path("/api/thing-descriptions/{id}")
    .buildAndExpand(saved.getId())
    .toUri();

    return ResponseEntity.created(location).body(saved);
  }

  @PutMapping("/thing-descriptions/{id}")
  public ResponseEntity<ThingDescription> updateTd(@PathVariable Long id, @Valid @RequestBody CreateThingDescriptionRequest req, Authentication authentication) {
    User currentUser = getCurrentUser(authentication);
    if (currentUser == null) return ResponseEntity.notFound().build();

    Optional<ThingDescription> tdOpcional = thingDescriptionRepository.findById(id);

    if (tdOpcional.isEmpty()) {
      return ResponseEntity.notFound().build();
    }
    
    ThingDescription thingDescription = tdOpcional.get();

    if (!thingDescription.getOwner().getId().equals(currentUser.getId())) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
    
    // Actualizar el td
    thingDescription.setName(req.name());
    thingDescription.setTd(req.tdJson()); 
    
    // Guardar los cambios en la base de datos
    ThingDescription updated = thingDescriptionRepository.save(thingDescription);

    return ResponseEntity.ok(updated);
  }

  @GetMapping("/thing-descriptions")
  public ResponseEntity<List<ThingDescription>> getThingDescriptionsFromCurrentUser(Authentication authentication) {
      User currentUser = getCurrentUser(authentication);
      if (currentUser == null) return ResponseEntity.notFound().build();

      List<ThingDescription> list = thingDescriptionRepository.findAllByOwner_Id(currentUser.getId());
      return ResponseEntity.ok(list);
  }

  @GetMapping("/{userId}/thing-descriptions")
  public ResponseEntity<List<ThingDescription>> searchTdByNameFromUser(@PathVariable String userId, @RequestParam(name = "name", required = false) String name) {
    List<ThingDescription> list = (name != null && !name.trim().isEmpty())
        ? thingDescriptionRepository.findAllByOwner_IdAndNameContainingIgnoreCase(userId, name.trim())
        : thingDescriptionRepository.findAllByOwner_Id(userId);

    return ResponseEntity.ok(list);
  }

  @DeleteMapping("/thing-descriptions/{thingDescriptionId}")
  public ResponseEntity<Void> deleteTd(@PathVariable Long thingDescriptionId, Authentication authentication) {
    User currentUser = getCurrentUser(authentication);
    if (currentUser == null) return ResponseEntity.notFound().build();
    
    Optional<ThingDescription> thingDescriptionOptional = thingDescriptionRepository.findById(thingDescriptionId);

    if (thingDescriptionOptional.isEmpty()) {
      return ResponseEntity.notFound().build();
    }

    ThingDescription td = thingDescriptionOptional.get();

    if (!td.getOwner().getId().equals(currentUser.getId())) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    thingDescriptionRepository.deleteById(thingDescriptionId);
    return ResponseEntity.noContent().build();
  }
}