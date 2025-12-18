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

# Expose ports (8080 for device API + web UI)
EXPOSE 8080

CMD [ "/run.sh" ]
