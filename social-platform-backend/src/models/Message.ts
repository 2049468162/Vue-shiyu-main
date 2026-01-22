import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database.js'

interface MessageAttributes {
  id: number
  conversation_id: number
  sender_id: number
  content: string
  created_at?: Date
}

interface MessageCreationAttributes extends Optional<MessageAttributes, 'id' | 'created_at'> {}

class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  declare id: number
  declare conversation_id: number
  declare sender_id: number
  declare content: string
  declare created_at?: Date
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    conversation_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    sender_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'messages',
    timestamps: false,
  }
)

export { Message, MessageAttributes, MessageCreationAttributes }
