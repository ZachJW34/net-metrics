FROM oven/bun:debian
RUN apt-get update && apt-get install -y curl && \
    curl -s https://packagecloud.io/install/repositories/ookla/speedtest-cli/script.deb.sh | bash && \
    apt-get install -y speedtest
WORKDIR /app
COPY bun.lock package.json ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run --bun build
ENTRYPOINT [ "bun", "--smol", "run", "--bun", "src/index.ts" ]
