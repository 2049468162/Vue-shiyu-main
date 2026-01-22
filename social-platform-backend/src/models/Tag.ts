import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database.js'

interface TagAttributes {
  id: number
  name: string
  category: 'entertainment' | 'food' | 'movie' | 'travel'
  display_order: number
  created_at?: Date
}

interface TagCreationAttributes extends Optional<TagAttributes, 'id' | 'created_at'> {}

class Tag extends Model<TagAttributes, TagCreationAttributes> implements TagAttributes {
  declare id: number
  declare name: string
  declare category: 'entertainment' | 'food' | 'movie' | 'travel'
  declare display_order: number
  declare created_at?: Date
}

Tag.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('entertainment', 'food', 'movie', 'travel'),
      allowNull: false,
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'tags',
    timestamps: false,
  }
)

export { Tag, TagAttributes, TagCreationAttributes }

