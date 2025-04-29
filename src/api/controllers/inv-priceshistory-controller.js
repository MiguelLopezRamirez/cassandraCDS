//1.-importacion de las librerias
const cds = require ('@sap/cds');

//2.-importar el servicio
// aun no esta creado el servicio
const servicioCassandra = require('../services/inv-priceshistory-service-cassandra')
const servicioMongo = require('../services/inv-priceshistory-service-mongodb')
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
        return await super.init();
    };


};

module.exports = InvestionsClass;