ARG BUILD_FROM
FROM $BUILD_FROM

# Install dependencies
RUN apk add --no-cache python3 py3-pip

# Build Python server
WORKDIR /server
COPY server/pyproject.toml server/README.md ./
COPY server/src ./src
RUN pip3 install --no-cache-dir --break-system-packages .

# Copy run script and set up data directory
COPY run.sh /
RUN chmod a+x /run.sh && mkdir -p /data

# Expose ports (8000 for device API, 8082 for control API + web UI)
EXPOSE 8000 8082

CMD [ "/run.sh" ]
