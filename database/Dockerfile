# ============================================
# Stage 1: Prepare init scripts
# ============================================
FROM alpine AS prep

WORKDIR /scripts
COPY init.sql .

# ============================================
# Stage 2: Production PostgreSQL image
# ============================================
FROM postgres:15-alpine

# Environment variables (can be overridden by docker-compose)
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=testdb

# Copy init script — runs automatically on first start
COPY --from=prep /scripts/init.sql /docker-entrypoint-initdb.d/

EXPOSE 5432

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD pg_isready -U postgres -d testdb || exit 1
