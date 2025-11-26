ARG BUILD_FROM
# hadolint ignore=DL3006
FROM $BUILD_FROM

# Install Node.js and npm
# hadolint ignore=DL3018
RUN apk add --no-cache nodejs npm

# Set working directory
WORKDIR /app

# Copy the vendor server source code
COPY vendor/nolongerevil/server/package*.json ./
COPY vendor/nolongerevil/server/tsconfig.json ./
COPY vendor/nolongerevil/server/src ./src

# Install dependencies and build TypeScript
RUN npm install && npm run build

# Copy run script and set up data directory
COPY run.sh /
RUN chmod a+x /run.sh && mkdir -p /data

# Expose ports (80 for proxy, 8081 for control API)
EXPOSE 80 8081

CMD [ "/run.sh" ]
