import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database.js'

interface CardKeyAttributes {
  id: number
  card_key: string
  status: 'unused' | 'used'
  duration_days: number
  created_at?: Date
  used_at?: Date
  used_by?: number
}

interface CardKeyCreationAttributes extends Optional<CardKeyAttributes, 'id' | 'created_at' | 'used_at' | 'used_by'> {}

class CardKey extends Model<CardKeyAttributes, CardKeyCreationAttributes> implements CardKeyAttributes {
  declare id: number
  declare card_key: string
  declare status: 'unused' | 'used'
  declare duration_days: number
  declare created_at?: Date
  declare used_at?: Date
  declare used_by?: number
}

CardKey.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    card_key: {
      type: DataTypes.STRING(19),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM('unused', 'used'),
      defaultValue: 'unused',
      allowNull: false,
    },
    duration_days: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 30,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    used_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    used_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'card_keys',
    timestamps: false,
  }
)

export { CardKey, CardKeyAttributes, CardKeyCreationAttributes }
