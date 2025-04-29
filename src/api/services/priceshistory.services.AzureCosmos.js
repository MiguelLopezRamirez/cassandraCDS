const { conectionAzureCosmosDB } = require('../../config/connectToAzureCosmosDB'); // Asegúrate de que esté correctamente importado
//Funcion GetAll
async function GetAllPricesHistoryCosmos(req) {
  try {
    const container = conectionAzureCosmosDB('ztpriceshistory'); // Conectar al contenedor "ZTPricesHistory"
    
    // Realizar la consulta
    const { resources: pricesHistory } = await container.items.query('SELECT * FROM c').fetchAll();
    
    if (pricesHistory && pricesHistory.length > 0) {
      return { value: pricesHistory };  // Devolver los resultados obtenidos
    } else {
      return { value: [] };  // Si no hay registros, devolver un array vacío
    }
  } catch (error) {
    console.error('Error al obtener datos de Cosmos DB:', error);
    return { error: 'No se pudieron obtener los datos de Cosmos DB' };
  }
}
//Funcion POST
async function AddOnePricesHistoryCosmos(req) {
  try {
      const container = conectionAzureCosmosDB('ztpriceshistory');
      const newPrice = req.data.prices;
      
      // Validación de campos requeridos
      const requiredFields = ['ID', 'DATE', 'OPEN', 'HIGH', 'LOW', 'CLOSE', 'VOLUME'];
      const missingFields = requiredFields.filter(field => !newPrice[field]);
      
      if (missingFields.length > 0) {
          throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
      }

      // Convertir DATE a formato ISO si es necesario
      if (typeof newPrice.DATE === 'string') {
          newPrice.DATE = new Date(newPrice.DATE).toISOString();
      }

      // Insertar en Cosmos DB
      const { resource: createdItem } = await container.items.create(newPrice);
      
      // Limpiar metadatos de Cosmos
      const { _rid, _self, _etag, _attachments, _ts, ...cleanItem } = createdItem;
      
      return [cleanItem];
      
  } catch (error) {
      console.error('Error en AddOnePricesHistoryCosmos:', error);
      throw new Error(`Error Cosmos DB: ${error.message}`);
  }
}
module.exports = { GetAllPricesHistoryCosmos, AddOnePricesHistoryCosmos };