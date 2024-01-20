# Filename: Dockerfile

FROM node:slim

# FROM public.ecr.aws/lambda/nodejs:14.2022.09.09.11
# Create working directory
WORKDIR /usr/src/app

RUN apt-get update -y && apt-get install -y openssl

RUN --mount=type=secret,id=ENV,dst=/etc/secrets/ENV cat /etc/secrets/ENV > .env

# Copy package.json
COPY . ./

# Install NPM dependencies for function
RUN npm install && npm run build

#  Expose app
EXPOSE 8080

# Run app
CMD ["node", "dist/src/main.js"]