package es.ual.tfg.backend.service;

import org.springframework.stereotype.Service;

import es.ual.tfg.backend.entity.User;
import es.ual.tfg.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;

@Service
public class UserService {
  @Autowired
  private UserRepository userRepository;

  public User findById(String id) {
    return userRepository.findById(id).orElse(null);
  }

  public User saveUser(User user) {
    return userRepository.saveUser(user);
  }

  public User findOrCreateUser(String id, String picture) {
    try {
      return userRepository.findById(id)
        .orElseGet(() -> {
          User newUser = new User();
          newUser.setId(id);
          newUser.setPictureUrl(picture);

          return userRepository.saveUser(newUser);
        });
    } catch (DataAccessException e) {
      System.err.println("Error al crear o guardar el usuario: " + e.getMessage());
      return null;
    }
  }
}