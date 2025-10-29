package es.ual.tfg.backend.chat;

import java.util.*;

public class TdSchemaFactory {

  public static Map<String,Object> schema() {
    // JSON Schema-like (estructura que Gemini entiende en response_schema)
    Map<String,Object> props = new LinkedHashMap<>();
    props.put("nombre", Map.of("type","string"));
    props.put("title", Map.of("type","string"));
    props.put("description", Map.of("type","string"));
    props.put("@type", Map.of("type","string"));
    props.put("type", Map.of("type","string", "enum", List.of("string","number","integer","boolean","array","object")));

    // uriVariables: diccionario clave-valor (ajústalo si tienes estructura específica)
    props.put("uriVariables", Map.of(
      "type","object",
      "additionalProperties", Map.of("type","string")
    ));

    // forms
    props.put("forms", Map.of(
      "type","array",
      "items", Map.of(
        "type","object",
        "properties", Map.of(
          "href", Map.of("type","string"),
          "contentType", Map.of("type","string"),
          "op", Map.of("type","array")
        ),
        "required", List.of("href")
      )
    ));

    // comunes típicos
    props.put("observable", Map.of("type","boolean"));
    props.put("readOnly", Map.of("type","boolean"));
    props.put("writeOnly", Map.of("type","boolean"));
    props.put("unit", Map.of("type","string"));

    Map<String,Object> root = new LinkedHashMap<>();
    root.put("type","object");
    root.put("properties", props);
    root.put("required", List.of("nombre","type"));
    return root;
  }
}