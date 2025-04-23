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

// async function AddOnePricesHistory(req){
//     try{
//         const newPrices = req.req.body.prices;
//         let pricesHistory;
//         pricesHistory = await ztpriceshistory.insertMany(newPrices, {order: true});
//         return(JSON.parse(JSON.stringify(pricesHistory)));
//     }catch(error){
//         return error;
//     }
// } 

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

  

 //async function DeleteOnePricesHistory(req){
   //  try{
     //    const idPrice = req.req.query?.IdPrice


    //     const deletionResult = await ztpriceshistory.findOneAndDelete(
   //          { ID: idPrice }  // Filtro por ID
   //      );

   //      return(JSON.parse(JSON.stringify({deletionResult})));
   //  }catch(error){
  //       console.log(error)
   //      return error;
   //  }
 //}


module.exports = { 
    GetAllPricesHistory, 
    // AddOnePricesHistory, 
     UpdateOnePricesHistory
    // DeleteOnePricesHistory 
};