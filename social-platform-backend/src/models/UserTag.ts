import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database.js'
import type { Tag } from './Tag.js'

interface UserTagAttributes {
  id: number
  user_id: number
  tag_id: number
  created_at?: Date
}

interface UserTagCreationAttributes extends Optional<UserTagAttributes, 'id' | 'created_at'> {}

class UserTag extends Model<UserTagAttributes, UserTagCreationAttributes> implements UserTagAttributes {
  declare id: number
  declare user_id: number
  declare tag_id: number
  declare created_at?: Date
  
  // 关联属性
  declare tag?: Tag
}

UserTag.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    tag_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'user_tags',
    timestamps: false,
  }
)

export { UserTag, UserTagAttributes, UserTagCreationAttributes }

