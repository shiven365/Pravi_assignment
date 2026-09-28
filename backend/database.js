const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './govinfra360.sqlite',
  logging: false
});

module.exports = sequelize;
