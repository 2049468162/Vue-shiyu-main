import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database.js'

interface FriendAttributes {
  id: number
  user_id: number
  friend_id: number
  remark_name?: string
  created_at?: Date
}

interface FriendCreationAttributes extends Optional<FriendAttributes, 'id' | 'created_at'> {}

class Friend extends Model<FriendAttributes, FriendCreationAttributes> implements FriendAttributes {
  declare id: number
  declare user_id: number
  declare friend_id: number
  declare remark_name?: string
  declare created_at?: Date
}

Friend.init(
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
    friend_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    remark_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'friends',
    timestamps: false,
  }
)

export { Friend, FriendAttributes, FriendCreationAttributes }
