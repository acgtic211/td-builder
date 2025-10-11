package es.ual.tfg.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.web.bind.annotation.CrossOrigin;

import es.ual.tfg.backend.entity.ThingDescription;

import java.util.List;

@RepositoryRestResource
@CrossOrigin(originPatterns = "", allowCredentials = "true", allowedHeaders = "")
public interface ThingDescriptionRepository extends JpaRepository<ThingDescription, Long> {
  List<ThingDescription> findAllByOwner_Id(String ownerId);
  List<ThingDescription> findAllByOwner_IdAndNameContainingIgnoreCase(String ownerId, String name);
}
