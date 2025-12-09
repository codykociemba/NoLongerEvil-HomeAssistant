ARG BUILD_FROM
FROM $BUILD_FROM

# Install Python and Node.js
RUN apk add --no-cache python3 py3-pip nodejs npm

# Build Python server
WORKDIR /server
COPY server/pyproject.toml server/README.md ./
COPY server/src ./src
RUN pip3 install --no-cache-dir --break-system-packages .

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
