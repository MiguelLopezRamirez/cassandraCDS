const PricesHistoryModel = require('../models/cassandra/pricesHistory');

async function GetAllPricesHistory(req) {
    try {
        const idPrice = parseInt(req.req.query?.IdPrice);
        const initVolume = parseInt(req.req.query?.initVolume);
        const endVolume = parseInt(req.req.query?.endVolume);
        
        let priceHistory;

        // Caso 1: Búsqueda por ID específico
        if (idPrice > 0) {
            priceHistory = await PricesHistoryModel.getById(idPrice);
            return priceHistory ? [priceHistory] : [];
        }
        // Caso 2: Búsqueda por rango de volumen (requiere tabla adicional)
        else if (initVolume >= 0  && endVolume >= 0) {
            const result = await PricesHistoryModel.getByVolumeRange(initVolume, endVolume);
            priceHistory = result.items;
        }
        // Caso 3: Obtener todos los registros (con paginación)
        else {
            const result = await PricesHistoryModel.getAll({ limit: 100 });
            priceHistory = result.items;
        }

        return priceHistory || [];
    } catch(e) {
        console.error("Error en GetAllPricesHistory:", e);
        throw e; // Es mejor propagar el error para manejarlo en el controlador
    }
}

async function AddManyPricesHistory(pricesArray) {
    try {
        // Validación básica
        if (!Array.isArray(pricesArray)) {
            throw new Error('Se esperaba un array de precios');
        }
        
        // Procesar cada elemento
        const processedData = pricesArray.map(price => {
            // Conversión de fecha
            let cassandraDate;
            if (price.DATE) {
                if (typeof price.DATE === 'number') {
                    cassandraDate = new Date(price.DATE).toISOString();
                } else {
                    cassandraDate = price.DATE;
                }
            } else {
                cassandraDate = new Date().toISOString();
            }

            return {
                id: parseInt(price.ID),
                date: cassandraDate,
                open: parseFloat(price.OPEN),
                high: parseFloat(price.HIGH),
                low: parseFloat(price.LOW),
                close: parseFloat(price.CLOSE),
                volume: parseFloat(price.VOLUME)
            };
        });

        return await PricesHistoryModel.insertMany(processedData);
    } catch(e) {
        console.error("Error en AddManyPricesHistory:", e);
        throw e;
    }
}

 async function UpdateOnePricesHistory(req){
     try{
         const idPrice = req.req.query?.IdPrice
         const newData = req.req.body.price;


         const updatedPrice = await ztpriceshistory.findOneAndUpdate(
             { ID: idPrice },       // Filtro por ID
             newData,          // Datos a actualizar
             { new: true }     // Devuelve el documento actualizado
       );

         return(JSON.parse(JSON.stringify({updatedPrice})));
     }catch(error){
         console.log(error)
         return error;
    }
 }

 async function DeleteOnePricesHistory(req){
    try {
      const idPrice = parseInt(req.req.query?.IdPrice);
      if (!idPrice) throw new Error("Se requiere el parámetro IdPrice");
  
      const result = await PricesHistoryModel.deleteById(idPrice);
      return result;
    } catch(error) {
      console.error("Error en DeleteOnePricesHistory:", error);
      throw error;
    }
  }


module.exports = { 
    GetAllPricesHistory, 
    AddManyPricesHistory,
    UpdateOnePricesHistory,
    DeleteOnePricesHistory 
};