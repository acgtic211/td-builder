package es.ual.tfg.backend.repository;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

import es.ual.tfg.backend.entity.User;

@RepositoryRestResource
public interface UserRepository extends CrudRepository<User, String> {
  Optional<User> findById(String id);

  @Override
  @RestResource(exported = false)
  <S extends User> S save(S entity);
  @RestResource(path = "saveUser", rel = "saveUser")
  default User saveUser(User user) {
    return save(user);
  }
}