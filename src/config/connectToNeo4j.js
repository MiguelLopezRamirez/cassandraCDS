// Importa el driver oficial de Neo4j para Node.js
const neo4j = require('neo4j-driver');

// Importa la configuración de variables de entorno personalizada
const dotenvXConfig = require('./dotenvXConfig');

// Crea una instancia del driver de Neo4j usando:
// - La URI de conexión desde las variables de entorno
// - Autenticación básica con usuario y contraseña de las variables de entorno
const driverInstance = neo4j.driver(
  dotenvXConfig.NEO4J_URI,
  neo4j.auth.basic(dotenvXConfig.NEO4J_USER, dotenvXConfig.NEO4J_PASSWORD)
);

// Exporta la instancia del driver para que pueda ser usada en otros módulos
module.exports = driverInstance;

(async () => {
  // Crea una nueva sesión de Neo4j apuntando a la base de datos 'neo4j' (por defecto)
  const session = driverInstance.session({ database: 'neo4j' });

  try {
    // Ejecuta una consulta de sistema para obtener información de la base de datos
    const result = await session.run('CALL db.info()');
    
    // Extrae el nombre de la base de datos del primer registro devuelto
    const name = result.records[0].get('name');
    
    // Muestra en consola el nombre de la base de datos conectada
    console.log('Base de datos actual:', name);
    
    // Muestra mensaje de éxito en la conexión
    console.log('✅ Conexión exitosa a Neo4j');
  } catch (error) {
    // Si hay un error, muestra el mensaje de error en consola
    console.error('❌ Error de conexión a Neo4j:', error.message);
    
    // Cierra el driver para liberar recursos
    await driverInstance.close();
  } finally {
    // En cualquier caso (éxito o error), cierra la sesión
    await session.close();
  }
})();  