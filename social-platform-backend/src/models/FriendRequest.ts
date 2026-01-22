import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database.js'

// 好友请求状态
export enum FriendRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

interface FriendRequestAttributes {
  id: number
  from_user_id: number      // 发起者
  to_user_id: number        // 接收者
  status: FriendRequestStatus
  message?: string          // 申请留言
  created_at?: Date
  updated_at?: Date
}

interface FriendRequestCreationAttributes extends Optional<FriendRequestAttributes, 'id' | 'created_at' | 'updated_at'> {}

class FriendRequest extends Model<FriendRequestAttributes, FriendRequestCreationAttributes> implements FriendRequestAttributes {
  declare id: number
  declare from_user_id: number
  declare to_user_id: number
  declare status: FriendRequestStatus
  declare message?: string
  declare created_at?: Date
  declare updated_at?: Date
}

FriendRequest.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    from_user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    to_user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(FriendRequestStatus)),
      defaultValue: FriendRequestStatus.PENDING,
    },
    message: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'friend_requests',
    timestamps: false,
  }
)

export { FriendRequest, FriendRequestAttributes, FriendRequestCreationAttributes }
