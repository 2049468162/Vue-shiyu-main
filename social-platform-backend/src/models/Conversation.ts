import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database.js'

interface ConversationAttributes {
  id: number
  type: 'private' | 'group' | 'ai'
  created_at?: Date
}

interface ConversationCreationAttributes extends Optional<ConversationAttributes, 'id' | 'created_at'> {}

class Conversation extends Model<ConversationAttributes, ConversationCreationAttributes> implements ConversationAttributes {
  declare id: number
  declare type: 'private' | 'group' | 'ai'
  declare created_at?: Date
}

Conversation.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM('private', 'group', 'ai'),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'conversations',
    timestamps: false,
  }
)

export { Conversation, ConversationAttributes, ConversationCreationAttributes }
