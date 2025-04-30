const cliente = require("../../config/connectToRedis");

  async function GetRedis(req) {
    try {
      const key = req.req.query?.key;
  
      if (key) {
        // Obtener el valor desde Redis (sin RedisJSON, usando el comando estándar GET)
        const value = await cliente.get(key);
  
        return JSON.parse(value);
      } else {
        // Obtener todas las claves desde Redis
        const allKeys = await cliente.keys("*");
        
        if (!allKeys || allKeys.length === 0) {
          return "No se encontraron las keys";
        }
  
        // Array para almacenar los resultados
        const allData = [];
  
        // Iterar sobre todas las claves obtenidas
        for (const key of allKeys) {
          // Obtener el valor de cada clave
          const value = await cliente.get(key);
  
          // Verificar si se obtuvo un valor
          if (value) {
            try {
              // Intentar parsear el valor si es posible
              allData.push({ key, value: JSON.parse(value) });
            } catch (parseError) {
              // Si no se puede parsear, almacenar el valor tal cual
              allData.push({ key, value });
            }
          }
        }
  
        // Devolver todos los resultados
        return allData;
      }
    } catch (error) {
      throw new Error(`Error al obtener los datos de  Redis: ${error.message}`);
    }
  }
//-----------------------------------
async function AddOnePricesHistoryRedis(req) {
    try {
      const key = req.req.query?.key; 
      const newPrices = req.req.body?.prices;
  
     
      if (!key) {
        throw new Error("El parámetro 'key' es obligatorio."); 
      }
  
     
      const keyExists = await cliente.exists(key);
      if (keyExists) {
        return `La clave '${key}' ya existe en Redis. Por favor utiliza otra clave o actualiza los datos existentes.`; 
      }
  
      
      const validateEntityStructure = (prices) => {
        if (
          !prices.ID ||
          !prices.DATE ||
          !prices.OPEN ||
          !prices.HIGH ||
          !prices.LOW ||
          !prices.CLOSE ||
          !prices.VOLUME
        ) {
          return "La estructura del objeto no coincide con la entidad 'priceshistory'."; 
        }
      };
  
      
      validateEntityStructure(newPrices);
  
     
      newPrices.DETAIL_ROW = [
        {
          ACTIVED: true, 
          DELETED: false, 
          DETAIL_ROW_REG: [
            {
              CURRENT: true, 
              REGDATE: new Date().toISOString().split("T")[0], 
              REGTIME: new Date().toISOString().split("T")[1], 
              REGUSER: "system_user", 
            },
          ],
        },
      ];
  
     
      const valueToStore = JSON.stringify(newPrices);
  
     
      await cliente.set(key, valueToStore);
  
     
      const storedData = await cliente.get(key);
  
      return {
        "Datos insertados": JSON.parse(storedData),
      };
    } catch (error) {
    
      console.error("Error:", error.message);
      throw new Error(`Error al agregar datos a Redis: ${error.message}`);
    }
  }


  module.exports = { GetRedis,AddOnePricesHistoryRedis,};