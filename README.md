# ipinfo server
This is a work-in-progress of a GraphQL server for queries of website metadata.

## getting started
To start the dev server, run the following commands:
```
npm install
npm run start:dev
```

Once the server is up and running, you can load the GraphQL Playground at [localhost:3000/graphql].
Here's a sample query for you to try:
```
query {
  getIPInfo(domain:"lobste.rs", services:[IPAPI, VirusTotal]) {
    service
    data
    error
  }
}
```


To build and start the project for a production environment (not advised):
```
npm run build
npm run start
```

## to do
* move API keys to a secret storage service
* add automatic generation of schema-types.ts based on schema.graphql file
* add GraphQL response types based on each external API's response data
* add code to handle requests when workers are not ready
* message queue - would solve double-callback issue
* add a message queue to handle requests when workers are down and to prevent the callback from being invoked twice (see WorkerManager.ts line 48)
* move resolver method (processIPInfoQuery) to a dataSource class to allow for one instance per request instead of one per application

