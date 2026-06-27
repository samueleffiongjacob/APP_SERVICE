# ---------- Stage 1: Build ----------
# Use a full JDK + Maven image only to compile; this layer is discarded
# from the final image, so build tools never ship to production.
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /build

# Copy pom.xml first and pre-fetch dependencies. Docker caches this layer,
# so dependency downloads are skipped on rebuilds unless pom.xml changes.
COPY pom.xml .
RUN mvn -B dependency:go-offline

# Now copy source and build. Source changes invalidate only this layer,
# not the dependency-download layer above.
COPY src ./src
RUN mvn -B clean package -DskipTests

# ---------- Stage 2: Runtime ----------
# eclipse-temurin JRE (not JDK) — no compiler, no Maven, smaller attack
# surface and smaller image. Alpine variant keeps it lean further.
FROM eclipse-temurin:21-jre-alpine AS runtime

# Run as a non-root user. Running containers as root is a common and
# avoidable security mistake — if the app is ever compromised, a non-root
# user limits what an attacker can do to the host.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only the built jar from the build stage — nothing else crosses over.
COPY --from=build /build/target/*.jar app.jar

# Curl is needed for the Docker HEALTHCHECK below; alpine doesn't include
# it by default.
RUN apk add --no-cache curl

USER appuser

EXPOSE 8080

# Container-level health check, independent of anything docker-compose or
# an orchestrator does — Docker itself can see if the app is alive.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# JAVA_OPTS lets you tune heap size etc. at deploy time without rebuilding
# the image, e.g. -e JAVA_OPTS="-Xmx512m -Xms256m"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
