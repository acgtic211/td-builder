package es.ual.tfg.backend.chat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

public class JsonUtil {
  private static final ObjectMapper MAPPER = new ObjectMapper();
  @SuppressWarnings("unchecked")
  public static Map<String,Object> parse(String json) throws Exception {
    return MAPPER.readValue(json, Map.class);
  }
}