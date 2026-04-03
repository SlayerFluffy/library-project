const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Team project API - Library Management System',
        description: 'API for managing books, users, genres and loans',
    },
    host: 'library-project-ioy4.onrender.com',
    schemes: ['https'],
}; 

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);