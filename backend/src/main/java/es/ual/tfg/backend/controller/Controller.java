package es.ual.tfg.backend.controller;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

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

   @PostMapping("/addUser")
    public ResponseEntity<Void> createUser(@RequestBody Map<String, String> body) {
      String userId = body.get("id");
      if (userId == null || userId.isBlank()) {
        return ResponseEntity.badRequest().build();
      }
      User aux = userRepository.findById(userId).orElse(null);
      if (aux == null) {
        aux = new User();
        aux.setId(userId);
        userRepository.save(aux);
      }
      return ResponseEntity.ok().build();
    }

  @PostMapping("/{userId}/addThingDescriptions")
  public ResponseEntity<ThingDescription> addThingDescriptionsToUser(@PathVariable String userId, @Valid @RequestBody CreateThingDescriptionRequest req) {
      User user = userRepository.findById(userId).orElse(null);
      if (user == null) return ResponseEntity.notFound().build();

      var ent = new ThingDescription();
      ent.setName(req.name());
      ent.setTd(req.tdJson());     // mapeas explícitamente
      ent.setOwner(user);
      
      var saved = thingDescriptionRepository.save(ent);

      URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
      .path("/api/users/{userId}/thing-descriptions/{id}")
      .buildAndExpand(userId, saved.getId())
      .toUri();

      return ResponseEntity.created(location).body(saved);
  }

  @PutMapping("/update/{id}")
  public ResponseEntity<ThingDescription> updateTd(@PathVariable Long id, @Valid @RequestBody CreateThingDescriptionRequest req) {
    Optional<ThingDescription> tdOpcional = thingDescriptionRepository.findById(id);
    
    if (tdOpcional.isPresent()) {
        ThingDescription thingDescription = tdOpcional.get();
        
        // Actualizar el td
        thingDescription.setName(req.name());
        thingDescription.setTd(req.tdJson()); 
        
        // Guardar los cambios en la base de datos
        thingDescriptionRepository.save(thingDescription);

        return ResponseEntity.ok(thingDescription);
    } else {
        return ResponseEntity.notFound().build();
    }
  }

  @GetMapping("/{userId}/getThingDescriptions")
  public ResponseEntity<List<ThingDescription>> getThingDescriptionsFromUser(@PathVariable String userId) {
      List<ThingDescription> list = thingDescriptionRepository.findAllByOwner_Id(userId);
      return ResponseEntity.ok(list);
  }

  @GetMapping("/{userId}/thing-descriptions")
  public ResponseEntity<List<ThingDescription>> searchTdByNameFromUser(@PathVariable String userId, @RequestParam(name = "name", required = false) String name) {
    List<ThingDescription> list = (name != null && !name.trim().isEmpty())
        ? thingDescriptionRepository.findAllByOwner_IdAndNameContainingIgnoreCase(userId, name.trim())
        : thingDescriptionRepository.findAllByOwner_Id(userId);

    return ResponseEntity.ok(list);
  }

  @DeleteMapping("/delete-td/{thingDescriptionId}")
  public ResponseEntity<Void> deleteTd(@PathVariable Long thingDescriptionId) {
    Optional<ThingDescription> thingDescriptionOptional = thingDescriptionRepository.findById(thingDescriptionId);

    if (thingDescriptionOptional.isPresent()) {
        thingDescriptionRepository.deleteById(thingDescriptionId);
        return ResponseEntity.noContent().build(); // Retorna 204 No Content si el td se elimina con éxito
    } else
        return ResponseEntity.notFound().build(); // Retorna 404 Not Found si el td no se encuentra
  }
}
