//1.-importacion de las librerias
const cds = require ('@sap/cds');
const { GetRedis,AddOnePricesHistoryRedis, UpdateOnePriceHistoryRedis, DeleteOnePricesHistoryRedis   } = require("../services/inv-priceshistory-service-redis");
  
//2.-importar el servicio
// aun no esta creado el servicio
const servicioCassandra = require('../services/inv-priceshistory-service-cassandra')
// const servicioMongo = require('../services/inv-priceshistory-service-mongodb')
// const { GetAllPricesHistoryCosmos, AddOnePricesHistoryCosmos } = require('../services/priceshistory.services.AzureCosmos');
// //Neo4j
// const {N4GetALL, AddOneNode} = require('../services/inv-neo4j-pricehistory-service');
// //3.- estructura princiapl  de la clas de contorller
// const {N4GetALL, AddOneNode, UpdateNode, DeleteNode} = require('../services/inv-neo4j-pricehistory-service');


class InvestionsClass extends cds.ApplicationService{
    
    //4.-iniciiarlizarlo de manera asincrona
    async init (){
        // Cassandra
        this.on('getallCassandra', async (req)=> {
            
            //llamada al metodo de servicio y retorna el resultado de la ruta
           return servicioCassandra.GetAllPricesHistory(req);
        });

        this.on("addmanyCassandra", async (req)=>{
            // Asegurarnos que estamos procesando el array correctamente
            const pricesArray = Array.isArray(req.data) ? req.data : req.data.prices;
            
            // Convertir fechas si es necesario
            const processedArray = pricesArray.map(item => {
                let dateValue = item.DATE;
                if (dateValue && typeof dateValue === 'number') {
                    item.DATE = new Date(dateValue).toISOString();
                }
                return item;
            });
            
            return servicioCassandra.AddManyPricesHistory(processedArray);
        });

        this.on("updateoneCassandra", async (req)=>{
            return servicioCassandra.UpdateOnePricesHistory(req);
        })

        this.on("deleteoneCassandra", async (req)=>{
            return servicioCassandra.DeleteOnePricesHistory(req);
        })
        
        //GET PARA REDIS
        this.on("getRedis", async (req) => {
            // call the service method and return the result to route.
            return GetRedis(req);
         });
         //POST PARA REDIS
         this.on("addOneRedis", async (req) => {
            return AddOnePricesHistoryRedis(req);
          });

          this.on("updateOneRedis", async (req) => {
            return UpdateOnePriceHistoryRedis(req);
          });

          this.on("deleteOneRedis", async (req) => {
            return DeleteOnePricesHistoryRedis(req);
          });
        // Mongo
        this.on('getallMongo', async (req)=> {
            
            //llamada al metodo de servicio y retorna el resultado de la ruta
           return servicioMongo.GetAllPricesHistory(req);
        });

        this.on("addoneMongo", async (req)=>{
            return servicioMongo.AddOnePricesHistory(req);
        })

        this.on("updateoneMongo", async (req)=>{
            return servicioMongo.UpdateOnePricesHistory(req);
        })

        this.on("deleteoneMongo", async (req)=>{
            return servicioMongo.DeleteOnePricesHistory(req);
        })

        // -- AZURE COSMOS --
        // GET para Cosmos DB
        this.on('getallCosmos', async (req) => {
            try {
              const pricesHistory = await GetAllPricesHistoryCosmos(req);
              return pricesHistory;  // Devolver la respuesta obtenida del servicio
            } catch (error) {
              console.error('Error al procesar la solicitud:', error);
              return { error: 'Hubo un error al obtener los datos.' };
            }
        });
        
        // POST para Cosmos DB
        this.on('addOneCosmos', async (req) => {
            try {
                return await AddOnePricesHistoryCosmos(req);
            } catch (error) {
                req.error({
                    code: 500,
                    message: error.message
                });
            }
        });
        //PUT para CosmosDB
        this.on('updateByIdCosmos', async (req) => {
            try {
                return await UpdateByIdPricesHistoryCosmos(req);
            } catch (error) {
                req.error({ code: 500, message: error.message });
            }
          });

        //DELETE para Cosmos DB
        this.on('deleteByIdCosmos', async (req) => {  
            try {  
                return await DeleteByIdPricesHistoryCosmos(req);  
            } catch (error) {  
                req.error({ code: 500, message: error.message });  
            }  
            });


         //NEO4J⚠
         this.on('N4GetALL', async (req)=> { 
            return N4GetALL(req);
         });
         this.on('addnode',async(req) =>{
            return AddOneNode(req)});
            this.on('updatenode',async (req) => {
                return UpdateNode(req);            
            });
            this.on('deletenode',async (req) => {
                return DeleteNode(req);
            });


         //PUT para CosmosDB
         this.on('updateByIdCosmos', async (req) => {
            try {
                return await UpdateByIdPricesHistoryCosmos(req);
            } catch (error) {
                req.error({ code: 500, message: error.message });
            }
          });

        //DELETE para Cosmos DB
        this.on('deleteByIdCosmos', async (req) => {  
            try {  
                return await DeleteByIdPricesHistoryCosmos(req);  
            } catch (error) {  
                req.error({ code: 500, message: error.message });  
            }  
            });



        return await super.init();


    };


};

module.exports = InvestionsClass;