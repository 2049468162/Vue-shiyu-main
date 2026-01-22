import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database.js'

// 通知类型
export enum NotificationType {
  FRIEND_REQUEST = 'friend_request',        // 好友申请
  FRIEND_ACCEPTED = 'friend_accepted',      // 好友申请已接受
  FRIEND_REJECTED = 'friend_rejected',      // 好友申请已拒绝
  SYSTEM = 'system',                        // 系统通知
}

interface NotificationAttributes {
  id: number
  user_id: number                  // 接收通知的用户ID
  type: NotificationType           // 通知类型
  title: string                    // 通知标题
  content: string                  // 通知内容
  related_user_id?: number         // 关联用户ID（如发送好友申请的用户）
  related_data?: string            // 关联数据（JSON格式）
  is_read: boolean                 // 是否已读
  created_at?: Date
}

interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'id' | 'created_at' | 'is_read'> {}

class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  declare id: number
  declare user_id: number
  declare type: NotificationType
  declare title: string
  declare content: string
  declare related_user_id?: number
  declare related_data?: string
  declare is_read: boolean
  declare created_at?: Date
}

Notification.init(
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
    type: {
      type: DataTypes.ENUM(...Object.values(NotificationType)),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    related_user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    related_data: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: false,
  }
)

export { Notification, NotificationAttributes, NotificationCreationAttributes }
