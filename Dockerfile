# Dockerfile для серверной части
FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json для корневого проекта
COPY package*.json ./

# Устанавливаем зависимости корневого проекта, включая devDependencies для sequelize-cli
RUN npm install

# Копируем остальные файлы проекта
COPY . .

# Устанавливаем зависимости сервера отдельно
WORKDIR /app/server
RUN npm install --omit=dev

# Возвращаемся в корневую директорию
WORKDIR /app

# Запускаем миграции и сидеры
RUN npx sequelize db:migrate
RUN npx sequelize db:seed:all

# Открываем порт, на котором работает сервер
EXPOSE 3000

# Команда для запуска сервера
CMD ["node", "server/server.js"]
