# ── BACKEND ──────────────────────────────────────────────────────────────────
FROM node:20-alpine AS backend

WORKDIR /app

COPY shared/ ./shared/

COPY backend/package*.json ./backend/
RUN cd backend && npm install

COPY backend/ ./backend/

EXPOSE 3000
CMD ["npm", "run", "start", "--prefix", "backend"]


# ── FRONTEND (build) ──────────────────────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /app

COPY shared/ ./shared/

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY frontend/ ./frontend/

RUN cd frontend && npm run build


# ── FRONTEND (serve) ──────────────────────────────────────────────────────────
FROM nginx:alpine AS frontend

COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]