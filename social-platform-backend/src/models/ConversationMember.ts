import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database.js'

interface ConversationMemberAttributes {
  id: number
  conversation_id: number
  user_id: number
  joined_at?: Date
}

interface ConversationMemberCreationAttributes extends Optional<ConversationMemberAttributes, 'id' | 'joined_at'> {}

class ConversationMember extends Model<ConversationMemberAttributes, ConversationMemberCreationAttributes> implements ConversationMemberAttributes {
  declare id: number
  declare conversation_id: number
  declare user_id: number
  declare joined_at?: Date
}

ConversationMember.init(
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
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    joined_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'conversation_members',
    timestamps: false,
  }
)

export { ConversationMember, ConversationMemberAttributes, ConversationMemberCreationAttributes }
