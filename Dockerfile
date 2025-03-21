FROM node:20-slim AS development

RUN apt update && apt install -y openssl

WORKDIR /usr/src/app

COPY --chown=node:node ./package.json ./

RUN yarn

COPY --chown=node:node . .

RUN rm ./yarn.lock && yarn install 
#RUN yarn run prisma:generate
#RUN yarn run prisma:generate-sql
#RUN dpkg -r --force-all apt apt-get && dpkg -r --force-all debconf dpkg

FROM node:20-slim AS build

WORKDIR /usr/src/app

COPY --chown=node:node ./package.json ./yarn.lock ./
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .

#RUN yarn build

#FROM node:20-slim AS production

#COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
#COPY --chown=node:node --from=build /usr/src/app/dist ./dist

RUN chmod +x ./entrypoint.sh
RUN chown -R node:node /usr/src/app
USER node

## THis is overridden in k8s deployment
#CMD [ "node", "dist/main.js" ]
#CMD ["sh", "-c", "yarn build && node dist/main.js"]
