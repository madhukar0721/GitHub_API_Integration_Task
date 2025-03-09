
FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./


RUN npm install

# Copy everthing
# I am also copyin .env as of now but this needs to be changed
COPY . .

# Build the TypeScript code
RUN npm run build

EXPOSE 8080

CMD ["node", "dist/index.js"]