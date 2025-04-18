// src/models/cassandra/pricesHistory.js
const cassandra = require('cassandra-driver');
const { client } = require('../../../config/connectToCasssandra.config');

const PricesHistoryModel = {
  keyspace: 'db_esecurity',
  table: 'priceshistory',
  columns: {
    id: 'int',
    date: 'timestamp',
    open: 'decimal',
    high: 'decimal',
    low: 'decimal',
    close: 'decimal',
    volume: 'decimal'
  },

  // Método para obtener un registro por ID
  async getById(id) {
    const query = `
      SELECT * FROM ${this.keyspace}.${this.table}
      WHERE id = ?`;
    
    try {
      const result = await client.execute(query, [id], { prepare: true });
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error en PricesHistoryModel.getById:', error);
      throw error;
    }
  },

  // Método para obtener todos los registros (sin orden garantizado)
  async getAll(options = {}) {
    const { limit = 100, pageState } = options;
    
    const query = `
      SELECT * FROM ${this.keyspace}.${this.table}
      LIMIT ?`;
    
    try {
      const result = await client.execute(query, [limit], { 
        prepare: true,
        pageState: pageState
      });
      
      return {
        items: result.rows,
        pageState: result.pageState
      };
    } catch (error) {
      console.error('Error en PricesHistoryModel.getAll:', error);
      throw error;
    }
  },

  // Método para buscar por rango de volumen
  async getByVolumeRange(minVolume, maxVolume, options = {}) {
    const { limit = 100 } = options;
    
    const query = `
      SELECT * FROM ${this.keyspace}.${this.table}
      WHERE volume >= ? AND volume <= ?
      LIMIT ? 
      ALLOW FILTERING`;
    
    try {
      const result = await this.executeQuery(query, [minVolume, maxVolume, limit], { 
        prepare: true, 
      });
      
      return {
        items: result.rows,
      };
    } catch (error) {
      console.error('Error en PricesHistoryModel.getByVolumeRange:', error);
      throw error;
    }
  },

  // Método interno para ejecutar consultas (abstracción del cliente)
  async executeQuery(query, params, options) {
    // Aquí inyectas la dependencia del cliente de tu configuración
    const { client } = require('../../../config/connectToCasssandra.config');
    return await client.execute(query, params, options);
  },

  // Método para insertar un nuevo registro
  async insert(data) {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    
    const query = `
      INSERT INTO ${this.keyspace}.${this.table} (${columns})
      VALUES (${placeholders})`;
    
    try {
      const params = Object.values(data);
      await client.execute(query, params, { prepare: true });
      return true;
    } catch (error) {
      console.error('Error en PricesHistoryModel.insert:', error);
      throw error;
    }
  },

  // Método para inicializar la tabla
  async init() {
    const columnsDef = Object.entries(this.columns)
      .map(([name, type]) => `${name} ${type}`)
      .join(', ');
    
    const query = `
      CREATE TABLE IF NOT EXISTS ${this.keyspace}.${this.table} (
        ${columnsDef},
        PRIMARY KEY (id)
      )`;
    
    await client.execute(query);
  }
};

// Inicializamos la tabla al cargar el modelo
PricesHistoryModel.init();

module.exports = PricesHistoryModel;