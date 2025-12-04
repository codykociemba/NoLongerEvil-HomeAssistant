ARG BUILD_FROM
FROM $BUILD_FROM

# Install Node.js and npm
RUN apk add --no-cache nodejs npm

# Build vendor server
WORKDIR /server
COPY vendor/nolongerevil/server/package*.json ./
COPY vendor/nolongerevil/server/tsconfig.json ./
COPY vendor/nolongerevil/server/src ./src
RUN npm install && npm run build

# Build frontend
WORKDIR /frontend
COPY frontend/package*.json ./
COPY frontend/tsconfig.json ./
COPY frontend/src ./src
RUN npm install && npm run build

# Copy run script and set up data directory
COPY run.sh /
RUN chmod a+x /run.sh && mkdir -p /data

# Expose ports
EXPOSE 8000 8081 8082

CMD [ "/run.sh" ]
