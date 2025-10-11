package es.ual.tfg.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Table;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "users")
public class User {
    
    @Id
    private String id;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<ThingDescription> thingDescriptions;

    public String getId(){ return this.id; }
    public void setId(String id) { this.id = id; }

    public List<ThingDescription> getThingDescriptions() { return thingDescriptions; }
    public void setThingDescriptions(List<ThingDescription> thingDescriptions) { this.thingDescriptions = thingDescriptions; }
}
