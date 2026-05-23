FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV DATABASE_URL="postgresql://brasux_user:Brasux%402026@postgres:5432/brasux_auth_db"

RUN npx prisma generate

RUN npm run build

EXPOSE 3333

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]