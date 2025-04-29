// src/config/dotenvXConfig.js
const dotEnvX = require('@dotenvx/dotenvx');
dotEnvX.config()
module.exports = {
    
    HOST: process.env.HOST || 'NO ENCONTRE VARIABLE DE ENTORNO',
    PORT: process.env.PORT || 'NO ENCONTRE PORT',
    API_URL: process.env.API_URL || 'NO SE ENCONTRO VARIABLE DE ENTORNO',
    // Cassandra
    CASSANDRA_HOST: process.env.CASSANDRA_HOST || 'NO SE ENCONTRO VARIABLE DE ENTORNO',
    CASSANDRA_DATACENTER: process.env.CASSANDRA_DATACENTER || 'NO SE ENCONTRO VARIABLE DE ENTORNO',
    CASSANDRA_KEYSPACE: process.env.CASSANDRA_KEYSPACE || 'NO SE ENCONTRO VARIABLE DE ENTORNO',
    CASSANDRA_USERNAME: process.env.CASSANDRA_USERNAME || 'NO SE ENCONTRO VARIABLE DE ENTORNO',
    CASSANDRA_PASSWORD: process.env.CASSANDRA_PASSWORD || 'NO SE ENCONTRO VARIABLE DE ENTORNO',
    // Mongo
    CONNECTION_STRING: process.env.CONNECTION_STRING || 'NO SE ENCONTRO VARIABLE DE ENTORNO', 
    DATABASE: process.env.DATABASE || 'NO SE ENCONTRO VARIABLE DE ENTORNO',  
    DB_USER: process.env.DB_USER || 'NO SE ENCONTRO VARIABLE DE ENTORNO',  
    DB_PASSWORD: process.env.DB_PASSWORD || 'NO SE ENCONTRO VARIABLE DE ENTORNO',

    //Redis
    REDIS_URL : process.env.REDIS_URL || "No encontré variable para conexión a Redis",

      //Variables de entorno para Azure Cosmos DB
    COSMOSDB_ENDPOINT: process.env.COSMOSDB_ENDPOINT,
    COSMOSDB_KEY: process.env.COSMOSDB_KEY,
    COSMOSDB_DATABASE: process.env.COSMOSDB_DATABASE,
    COSMOSDB_CONTAINER: process.env.COSMOSDB_CONTAINER,

    //NEO4J
    NEO4J_URI: process.env.NEO4J_URI || 'No se puede conectar a Neo4j',
    NEO4J_USER: process.env.NEO4J_USER || 'neo4j',
    NEO4J_PASSWORD: process.env.NEO4J_PASSWORD || 'neo4j'
};