# Etapa de build
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# copiar solo pom para cachear dependencias
COPY backend/pom.xml ./
RUN mvn -B -DskipTests dependency:go-offline

# copiar código y recursos
COPY backend/src ./src
COPY backend/src/main/resources/application.properties ./src/main/resources/

RUN sed -i \
    -e 's|localhost:5432/db|postgres:5432/db|' \
    -e 's|http://localhost:4200|http://localhost|' \
    src/main/resources/application.properties

RUN mvn -B -DskipTests package

# Etapa de runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-XX:TieredStopAtLevel=1","-Djava.security.egd=file:/dev/./urandom","-XshowSettings:vm","-jar","/app/app.jar"]