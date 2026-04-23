const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Tienda Ferretería',
      version: '1.0.0',
      description: 'Documentación de la API con Swagger y JWT'
    },
    servers: [
      {
        url: 'http://localhost'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  // 👇 Esta línea debe estar dentro del objeto options
  apis: ['./index.js'], // aquí se leerán los comentarios de tus rutas
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };

