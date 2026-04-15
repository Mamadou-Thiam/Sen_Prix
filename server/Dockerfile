FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

ENV NODE_ENV=production

# Variables d'environnement par défaut si non définies
ENV PORT=5000
ENV JWT_SECRET=${JWT_SECRET:-senprix_secret_key_2024_secure}
ENV JWT_EXPIRE=7d
ENV MONGODB_URI=${MONGODB_URI:-mongodb+srv://thiammamadou0020:azerty@cluster0.j58n439.mongodb.net/senprix}

CMD ["node", "index.js"]
