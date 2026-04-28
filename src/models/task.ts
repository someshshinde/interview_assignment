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
  priority: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'MEDIUM'
  },
  machine_id: {
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
  }
}, {
  tableName: 'tasks',
  timestamps: false
});

export default task;