const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Team project API - Library Management System',
        description: 'API for managing books, users, genres and loans',
    },
    host: 'http://localhost:3000',
    schemes: ['http'],
}; 

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);