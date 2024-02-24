'use strict';

const mongoose = require('mongoose');

mongoose.connection.on('error', function (err) {
  console.error('mongodb connection error:', err);
  process.exit(1);
});

mongoose.connection.once('open', function () {
  console.info('Connected to mongodb.');
});

// Usamos la variable de entorno MONGODB_URI. Si no está definida, usamos una dirección predeterminada.
const mongoDBUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1/nodepop';

const connectionPromise = mongoose.connect(mongoDBUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// exportamos la promesa de la conexión (https://mongoosejs.com/docs/connections.html)
module.exports = connectionPromise;
