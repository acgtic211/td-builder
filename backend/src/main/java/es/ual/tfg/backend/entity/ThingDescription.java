package es.ual.tfg.backend.entity;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "thingdescriptions")
public class ThingDescription {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;

  @NotBlank(message = "Name is mandatory")
  @Column(name = "name")
  private String name; // "id" que introduces en el front

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "td_json", nullable = false, columnDefinition = "jsonb")
  private JsonNode td; // el TD completo serializado a JSON

  @ManyToOne
  @JoinColumn(name = "owner_id", nullable = false, referencedColumnName = "id")
  @JsonIgnore
  private User owner;

  public long getId(){ return this.id; }
  public void setId(long id) { this.id = id; }

  public String getName() { return name; }
  public void setName(String name) { this.name = name; }

  public JsonNode getTd() { return td; }
  public void setTd(JsonNode td) { this.td = td; }

  public User getOwner() { return owner; }
  public void setOwner(User owner) { this.owner = owner; }
}
