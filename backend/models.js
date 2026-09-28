const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const State = sequelize.define('State', {
  name: { type: DataTypes.STRING, unique: true }
});

const Department = sequelize.define('Department', {
  name: DataTypes.STRING
});
Department.belongsTo(State);

const User = sequelize.define('User', {
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password_hash: DataTypes.STRING,
  role: DataTypes.STRING,
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});
User.belongsTo(State);
User.belongsTo(Department);

const Project = sequelize.define('Project', {
  id: { type: DataTypes.STRING, primaryKey: true },
  name: DataTypes.STRING,
  sector: DataTypes.STRING,
  budget: DataTypes.FLOAT,
  spent: { type: DataTypes.FLOAT, defaultValue: 0 },
  progress: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: DataTypes.STRING,
  start_date: DataTypes.STRING,
  expected_completion: DataTypes.STRING
});
Project.belongsTo(State);
Project.belongsTo(Department);

const Asset = sequelize.define('Asset', {
  id: { type: DataTypes.STRING, primaryKey: true },
  name: DataTypes.STRING,
  type: DataTypes.STRING,
  sector: DataTypes.STRING,
  cost: DataTypes.STRING,
  health_score: DataTypes.INTEGER,
  status: DataTypes.STRING,
  next_inspection_date: DataTypes.STRING
});
Asset.belongsTo(State);
Asset.belongsTo(Project);
Asset.belongsTo(Department);

const AuditLog = sequelize.define('AuditLog', {
  user_name_snapshot: DataTypes.STRING,
  user_role: DataTypes.STRING,
  action: DataTypes.STRING,
  entity_type: DataTypes.STRING,
  entity_id: DataTypes.STRING,
  old_data: DataTypes.TEXT,
  new_data: DataTypes.TEXT,
  reason: DataTypes.TEXT
});
AuditLog.belongsTo(User);
AuditLog.belongsTo(State);
AuditLog.belongsTo(Department);

module.exports = { State, Department, User, Project, Asset, AuditLog, sequelize };
