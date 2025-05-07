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
  async function UpdateOnePriceHistoryRedis(req) {
    try {
      const key = req.req.query?.key;
      const newPrices = req.req.body?.prices;
      const regUser = req.req.body?.user || "unknown_user";
  
      if (!key) {
        throw new Error("El parámetro 'key' es obligatorio.");
      }
  
      if (!newPrices || Object.keys(newPrices).length === 0) {
        throw new Error("El body debe contener los datos que se actualizarán.");
      }
  
      const exists = await cliente.exists(key);
      if (!exists) {
        throw new Error(`La clave '${key}' no existe en Redis.`);
      }
  
      
      const currentDataStr = await cliente.get(key);
      const currentData = JSON.parse(currentDataStr);
  
      
      const validFields = ["DATE", "OPEN", "HIGH", "LOW", "CLOSE", "VOLUME"];
  
      
      validFields.forEach(field => {
        if (newPrices[field] !== undefined) {
          currentData[field] = newPrices[field];
        }
      });
  
      // if (!Array.isArray(currentData.DETAIL_ROW) || currentData.DETAIL_ROW.length === 0) {
      //   throw new Error("El objeto no contiene un arreglo DETAIL_ROW válido.");
      // }
  
      // const detailRow = currentData.DETAIL_ROW[0]; 
  
      
      // if (!Array.isArray(detailRow.DETAIL_ROW_REG)) {
      //   detailRow.DETAIL_ROW_REG = [];
      // } else {
        
      //   detailRow.DETAIL_ROW_REG.forEach(reg => {
      //     reg.CURRENT = false;
      //   });
      // }
  
      
      // const now = new Date();
      // const regDate = now.toISOString().split("T")[0]; 
      // const regTime = now.toTimeString().split(" ")[0]; 
  
      
      // currentData.DETAIL_ROW_REG.push({
      //   CURRENT: true,
      //   REGDATE: regDate,
      //   REGTIME: regTime,
      //   REGUSER: regUser
      // });
  
      
      await cliente.set(key, JSON.stringify(currentData));
  
      return {
        message: `Los datos con la clave '${key}' fueron actualizados exitosamente.`,
        updatedData: currentData
      };
    } catch (error) {
      console.error("Error:", error.message);
      throw new Error(`Error al actualizar datos en Redis: ${error.message}`);
    }
  }

  async function DeleteOnePricesHistoryRedis(req) {
    try {
      const key = req.req.query?.key;
      const tipoBorrado = req.req.query?.borrado || "logic";
      const user = req.req.query?.user || "system_user";
  
      if (!key) {
        throw new Error("El parámetro 'key' es obligatorio.");
      }
  
      if (tipoBorrado !== "logic" && tipoBorrado !== "fisic") {
        throw new Error("El parámetro 'borrado' debe ser 'logic' o 'fisic'.");
      }
  
      const exists = await cliente.exists(key);
      if (!exists) {
        throw new Error(`La clave '${key}' no existe en Redis.`);
      }
  
      const currentDataStr = await cliente.get(key);
      const currentData = JSON.parse(currentDataStr);
      // const currentData = currentDataStr

      if (!currentData.DETAIL_ROW) {
        throw new Error("No se encontró la propiedad DETAIL_ROW en el objeto.");
      }
  
      
      const now = new Date();
      const regDate = now.toISOString().split("T")[0];
      const regTime = now.toTimeString().split(" ")[0];
      
      // Acceder directamente al objeto DETAIL_ROW
      const detailRow = currentData.DETAIL_ROW;
      
      // Asegurar que DETAIL_ROW_REG sea un arreglo
      if (!Array.isArray(detailRow.DETAIL_ROW_REG)) {
        detailRow.DETAIL_ROW_REG = [];
      } else {
        // Marcar los registros existentes como no actuales
        detailRow.DETAIL_ROW_REG.forEach((r) => {
          r.CURRENT = false;
        });
      }
      
      // Agregar nuevo registro de auditoría
      detailRow.DETAIL_ROW_REG.push({
        CURRENT: true,
        REGDATE: regDate,
        REGTIME: regTime,
        REGUSER: user,
      });
      
      // Marcar como inactivo y, si corresponde, eliminado
      detailRow.ACTIVED = false;
      if (tipoBorrado === "fisic") {
        detailRow.DELETED = true;
      }
  
    
      await cliente.set(key, JSON.stringify(currentData));
  
      return {
        message: `La clave '${key}' fue marcada como eliminada (${tipoBorrado === "logic" ?       "lógica" : "física"}) exitosamente.`,
        updatedData: currentData,
      };
    } catch (error) {
      throw new Error(`Error al eliminar datos de Redis: ${error.message}`);
    }
  }

  module.exports = { GetRedis,AddOnePricesHistoryRedis, UpdateOnePriceHistoryRedis, DeleteOnePricesHistoryRedis};