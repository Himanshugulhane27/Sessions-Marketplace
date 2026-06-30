FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# These are set at runtime via env_file in docker-compose
# Next.js reads NEXT_PUBLIC_* at runtime in dev mode
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

CMD ["npm", "run", "dev"]
