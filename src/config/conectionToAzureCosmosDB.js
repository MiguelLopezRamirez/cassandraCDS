//Para conectarnos a la base de datos de Azure Cosmos DB
const { CosmosClient } = require('@azure/cosmos');
const dotenvxconfig = require('./dotenvXConfig');

// Crear una instancia del cliente Cosmos DB de manera síncrona
const client = new CosmosClient({
    endpoint: dotenvxconfig.COSMOSDB_ENDPOINT,
    key: dotenvxconfig.COSMOSDB_KEY
});

// Conectar a la base de datos de Cosmos DB
const database = client.database(dotenvxconfig.COSMOSDB_DATABASE);

// Asegúrate de que la base de datos esté conectada
client
    .getDatabaseAccount()
    .then(response => {
        console.log('Database connected to Cosmos DB: ', database.id);
    })
    .catch(error => {
        console.log('Error connecting to Cosmos DB: ', error);
    });

module.exports = {
    client,
    conectionAzureCosmosDB: (containerName) => client.database(dotenvxconfig.COSMOSDB_DATABASE).container(containerName)
};