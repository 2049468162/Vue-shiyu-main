import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database.js'

interface LoginAttemptAttributes {
  id: number
  account: string              // 尝试登录的账号
  failed_attempts: number      // 失败次数
  is_frozen: boolean           // 是否被冻结
  frozen_until?: Date          // 冻结到期时间
  last_attempt_at: Date        // 最后尝试时间
  created_at?: Date
  updated_at?: Date
}

interface LoginAttemptCreationAttributes extends Optional<LoginAttemptAttributes, 'id' | 'created_at' | 'updated_at'> {}

class LoginAttempt extends Model<LoginAttemptAttributes, LoginAttemptCreationAttributes> implements LoginAttemptAttributes {
  declare id: number
  declare account: string
  declare failed_attempts: number
  declare is_frozen: boolean
  declare frozen_until?: Date
  declare last_attempt_at: Date
  declare created_at?: Date
  declare updated_at?: Date
}

LoginAttempt.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    account: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    failed_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_frozen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    frozen_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_attempt_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
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
    tableName: 'login_attempts',
    timestamps: false,
  }
)

export { LoginAttempt, LoginAttemptAttributes, LoginAttemptCreationAttributes }
