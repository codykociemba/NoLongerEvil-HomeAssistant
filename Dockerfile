ARG BUILD_FROM
FROM $BUILD_FROM

# Install Node.js and npm
RUN apk add --no-cache nodejs npm

# Set working directory
WORKDIR /app

# Copy the vendor server source code
COPY vendor/nolongerevil/server/package*.json ./
COPY vendor/nolongerevil/server/tsconfig.json ./
COPY vendor/nolongerevil/server/src ./src

# Install dependencies
RUN npm install

# Build TypeScript
RUN npm run build

# Copy run script
COPY run.sh /
RUN chmod a+x /run.sh

# Set up data directory for SQLite
RUN mkdir -p /data

# Expose ports (80 for proxy, 8081 for control API)
EXPOSE 80 8081

CMD [ "/run.sh" ]
