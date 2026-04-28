import { DataTypes } from 'sequelize';
import db from '../utils/db';

const user = db.define('users', {
  id: {
    type: DataTypes.BIGINT,  
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: false
});

export default user;