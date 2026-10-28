FROM node:20-alpine

WORKDIR /app

# Копируем манифесты зависимостей
COPY package*.json ./
RUN npm install

# Копируем исходный код
COPY . .

# Порт Vite сервера
EXPOSE 5173

# Запуск dev-сервера Vite с доступом снаружи контейнера
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
