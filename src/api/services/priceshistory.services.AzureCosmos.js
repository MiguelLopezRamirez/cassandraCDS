const { conectionAzureCosmosDB } = require('../../config/conectionToAzureCosmosDB'); // Asegúrate de que esté correctamente importado
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

//Funcion PUT
async function UpdateByIdPricesHistoryCosmos(req) {
  try {
    //Constantes que obtendran la data
      const { ID, DATE, OPEN, HIGH, LOW, CLOSE, VOLUME } = req.data;
    //En caso de no contener ID
      if (!ID) return { error: 'El campo ID es requerido' };
    //En caso de que ID no se un valor numerico
      const numericId = parseInt(ID, 10);
      if (isNaN(numericId)) return { error: 'ID debe ser un número válido' };

      const container = conectionAzureCosmosDB('ztpriceshistory');
      //Consulta primerop el valor a actualizar
      const query = {
          query: "SELECT * FROM c WHERE c.ID = @id",
          parameters: [{ name: "@id", value: numericId }]
      };
      //Ejecucion de la busqieda
      const { resources: results } = await container.items.query(query).fetchAll();
      //En caso de no encontrar el registro
      if (results.length === 0) return { error: "Registro no encontrado" };

      //Generar los datos que se actualizaran 
      let itemToUpdate = results[0];
      itemToUpdate.DATE = DATE || itemToUpdate.DATE;
      itemToUpdate.OPEN = OPEN || itemToUpdate.OPEN;
      itemToUpdate.HIGH = HIGH || itemToUpdate.HIGH;
      itemToUpdate.LOW = LOW || itemToUpdate.LOW;
      itemToUpdate.CLOSE = CLOSE || itemToUpdate.CLOSE;
      itemToUpdate.VOLUME = VOLUME || itemToUpdate.VOLUME;

      //Ejecutar la actualizacion
      const { resource: updatedItem } = await container.item(itemToUpdate.id).replace(itemToUpdate);

      const { _rid, _self, _etag, _attachments, _ts, ...cleanItem } = updatedItem;
      return [cleanItem];

  } catch (error) {
      console.error('Error al actualizar en Cosmos DB:', error);
      return { error: 'No se pudo actualizar el dato en Cosmos DB' };
  }
}

//Funcion para eliminar dato
async function DeleteByIdPricesHistoryCosmos(req) {
  try {
      const { ID } = req.data; // Obtener el ID desde la solicitud
      if (!ID) {
          return { error: 'ID es requerido' };
      }

      const numericId = parseInt(ID, 10); // Convertir ID a número
      if (isNaN(numericId)) {
          return { error: 'ID debe ser un número válido' };
      }

      const container = conectionAzureCosmosDB('ztpriceshistory'); // Conectar al contenedor

      // Buscar el item con el ID
      const query = {
          query: "SELECT * FROM c WHERE c.ID = @id",
          parameters: [{ name: "@id", value: numericId }]
      };

      const { resources: results } = await container.items.query(query).fetchAll();

      if (results.length > 0) {
        const itemToDelete = results[0];

       // Eliminar con `id` y `PartitionKey` correcto
          await container.item(itemToDelete.id, itemToDelete.partitionKey).delete();

        return { success: true, message: "Registro eliminado correctamente" };
    } else {
        return { error: "Registro no encontrado" };
    }
  } catch (error) {
      console.error('Error al eliminar el dato de Cosmos DB:', error);
      return { error: 'No se pudo eliminar el dato de Cosmos DB' };
  }
}
module.exports = { 
  GetAllPricesHistoryCosmos, 
  AddOnePricesHistoryCosmos,
  UpdateByIdPricesHistoryCosmos,
  DeleteByIdPricesHistoryCosmos };