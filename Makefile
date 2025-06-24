.PHONY: up down build logs restart clean

# Docker Compose管理
up:
	docker-compose up --build

up-d:
	docker-compose up -d --build

down:
	docker-compose down

build:
	docker-compose build

logs:
	docker-compose logs -f

restart:
	docker-compose restart

clean:
	docker-compose down -v
	docker system prune -f

# 開発用
dev-frontend:
	cd frontend && npm start

dev-backend:
	cd backend && npm run dev

install:
	cd frontend && npm install
	cd backend && npm install