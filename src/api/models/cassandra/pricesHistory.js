// src/models/cassandra/pricesHistory.js
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
    const { limit = 100 } = options;
    
    const query = `
      SELECT * FROM ${this.keyspace}.${this.table}
      LIMIT ?`;
    
    try {
      const result = await client.execute(query, [limit], { 
        prepare: true,
      });
      
      return {
        items: result.rows,
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
      const result = await client.execute(query, 
        [minVolume, maxVolume, limit], 
        { prepare: true }
      );
      
      return {
        items: result.rows,
      };
    } catch (error) {
      console.error('Error en PricesHistoryModel.getByVolumeRange:', error);
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