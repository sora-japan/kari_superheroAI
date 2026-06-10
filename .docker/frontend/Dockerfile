FROM node:22-alpine

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]
