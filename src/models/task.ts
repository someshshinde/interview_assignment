import { DataTypes } from 'sequelize';
import db from '../utils/db';

const task = db.define('tasks', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'REPORTED'
  },
  materials_requested: {
    type: DataTypes.TEXT,
    allowNull: true
  },
   material_request_reason:{
    type: DataTypes.TEXT,
    allowNull: true
   },
  priority: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'MEDIUM'
  },
  machine_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  requested_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  reported_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  requested_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
}, {
  tableName: 'tasks',
  timestamps: false
});

export default task;