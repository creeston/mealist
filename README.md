# Mealist


## Prerequisites
 - install node
 - install java


## UI


Building project

 - npm i
 - npm start

Generating api clients
 1. Run API
 2. npm run generate-client 

Mac os:
 brew install openapi-generator
 openapi-generator generate -i http://localhost:3000/api-docs -g typescript-angular -o ./src/app/api


## API

Building
 - npm i
 - npm run build
 - npm start

Generating types

npm run generate-types

## DB 

docker-compose up