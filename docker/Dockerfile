FROM registry.gitlab.com/cencosud-ds/utils/docker-images/node:12.19.0-alpine3.10

RUN mkdir -p /home/node/app
RUN chown node:node /home/node/app

RUN apk update && apk add openjdk8 && rm -rf /var/cache/apk/*
ENV JAVA_HOME=/usr/lib/jvm/java-1.8-openjdk

RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

USER node

COPY --chown=1000:node ./dist /home/node/app/dist
COPY --chown=1000:node ./node_modules /home/node/app/node_modules

WORKDIR /home/node/app
EXPOSE 5005

ENV NODE_OPTIONS="--max-old-space-size=1536"
CMD ["node", "--max-old-space-size=1536", "dist/main.js"]
