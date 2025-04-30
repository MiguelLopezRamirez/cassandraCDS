//1.-importacion de las librerias
const cds = require ('@sap/cds');
const { GetRedis,AddOnePricesHistoryRedis  } = require("../services/inv-priceshistory-service-redis");
  

//2.-importar el servicio
// aun no esta creado el servicio
//const servicioCassandra = require('../services/inv-priceshistory-service-cassandra')
//const servicioMongo = require('../services/inv-priceshistory-service-mongodb')
//const { GetAllPricesHistoryCosmos, AddOnePricesHistoryCosmos } = require('../services/priceshistory.services.AzureCosmos');

//3.- estructura princiapl  de la clas de contorller


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

        return await super.init();


    };


};

module.exports = InvestionsClass;

