FROM mhart/alpine-node:14

# install dependencies
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
# RUN curl -f https://get.pnpm.io/v6.7.js | node - add --global pnpm@6
RUN npm install -g pnpm
RUN pnpm install --quiet

# Copy all local files into the image.
COPY . .

RUN pnpm run build

###
# Only copy over the Node pieces we need
# ~> Saves 35MB
###
FROM mhart/alpine-node:slim-14

WORKDIR /app
COPY --from=0 /app .
COPY . .


ENV HOST=0.0.0.0 PORT=3000

EXPOSE ${PORT}
CMD ["node", "./build"]
