package es.ual.tfg.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import es.ual.tfg.backend.entity.User;

public interface UserRepository extends JpaRepository<User, String> {
  Optional<User> findById(@Param("id") String id);
}