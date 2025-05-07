//import model
using {inv as myph} from '../models/inv-inversions';

@impl: 'src/api/controllers/inv-priceshistory-controller.js'
service PricesHistoryRoute @(path:'/api/inv') {
    //instance the entity
    entity priceshistory as projection on myph.priceshistory;
    entity strategies as projection on myph.strategies;
    entity pricehistoryinput2 as projection on myph.pricehistoryinput2;
    
    //MARL: Ger Some Prices History
    //localhost:3333 /api/priceshistory/getall
    //Cassandra
    @Core.Description:'get-all-prices-history'
    @path : 'getallCassandra'
    function getallCassandra()
    returns array of priceshistory;

    @Core.Description: 'add-oneormanny-prices-history'
    @path: 'addmanyCassandra'
    action addmanyCassandra(prices: array of pricehistoryinput2)
    returns array of priceshistory;

    @Core.Description: 'update-one-prices-history'
    @path: 'updateoneCassandra'
    action updateoneCassandra(price:priceshistory) 
    returns array of priceshistory;

    @Core.Description: 'delete-one-prices-history'
    @path: 'deleteoneCassandra'
    function deleteoneCassandra() 
    returns array of priceshistory;

    //MongoDb
        @Core.Description:'get-all-prices-history'
    @path : 'getall'
    function getallMongo()
    returns array of priceshistory;

    @Core.Description: 'add-one-prices-history'
    @path: 'addone'
    action addoneMongo(prices:priceshistory) returns array of priceshistory;

    @Core.Description: 'update-one-prices-history'
    @path: 'updateone'
    action updateoneMongo(price:priceshistory) 
    returns array of priceshistory;

    @Core.Description: 'delete-one-prices-history'
    @path: 'deleteone'
    function deleteoneMongo() 
    returns array of priceshistory;

     // -- AZURE COSMOS --
    @Core.Description: 'get-all-prices-inversions'
    @path :'getallCosmos'
    function getallCosmos() returns array of priceshistory ;

    @Core.Description: 'addOne-prices-history-cosmos'  
    @path :'addOneCosmos'  
    action addOneCosmos(prices : priceshistory) returns array of priceshistory;
    
    //--REDIS---
    @Core.Description: 'Get Redis'  
    @path :'getRedis'  
    function getRedis() returns array of priceshistory;
    
    @Core.Description: 'add-one-id-prices-history-redis'
    @path            : 'addOneRedis'
    action   addOneRedis(prices : priceshistory) returns        array of priceshistory;

    @Core.Description: 'update-one-id-prices-history-redis'
    @path            : 'updateOneRedis'
    action   updateOneRedis(prices : priceshistory) returns array of priceshistory;
    
    @Core.Description: 'delete-one-prices-history-redis'
    @path            : 'deleteOneRedis'
    action   deleteOneRedis() returns array of priceshistory;


    @Core.Description: 'update-by-id-prices-inversions'
    @path :'updateByIdCosmos'
    action updateByIdCosmos(
    ID: Integer, 
    DATE: String, 
    OPEN: Decimal, 
    HIGH: Decimal, 
    LOW: Decimal, 
    CLOSE: Decimal, 
    VOLUME: Integer
    ) returns priceshistory;

    @Core.Description: 'delete-by-id-prices-inversions'
    @path :'deleteByIdCosmos'
    action deleteByIdCosmos(ID: Integer) returns Boolean;
    

    //  NEO4J
    //Get All
    @Core.Description: 'get-all-prices-history-Neo4j'
    @path            : 'N4GetALL'
    function N4GetALL()                                             
    returns array of LargeString;//Indica que devolverá múltiples registros en formato JSON stringificado

    @Core.Description: 'add-one-node-4j'
    @path: 'addnode'
    function addnode(body:priceshistory)
    returns array of LargeString;

    @Core.Description: 'update-one-node-4j'
  @path: 'updatenode'
    function updatenode(body:priceshistory)
    returns array of LargeString;
    @Core.Description: 'delete-one-node-4j'
  @path: 'deletenode'
    function deletenode()
    returns array of LargeString;
    
};
