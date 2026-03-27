# Fetching the minified node image on Alpine Linux
FROM node:slim

# Declaring environment variables
ARG PORT=3000
ENV NODE_ENV=production
ENV PORT=${PORT}

# Setting up the work directory
WORKDIR /express-docker

# Copying all the files in our project
COPY . .

# Installing dependencies
RUN npm install

# Installing pm2 globally
RUN npm install pm2 -g

# Exposing server port
EXPOSE ${PORT}

# Starting our application with PM2
CMD ["sh", "-c", "pm2 start process.yml && pm2 logs"]
