import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database.js'

interface UserAttributes {
  id: number
  account_id: string
  email: string
  password_hash: string
  nickname?: string
  avatar_url?: string
  gender?: 'male' | 'female' | 'other'
  age?: number
  is_profile_set: boolean
  is_member: boolean
  member_expire_date?: Date
  created_at?: Date
  updated_at?: Date
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at' | 'updated_at'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number
  declare account_id: string
  declare email: string
  declare password_hash: string
  declare nickname?: string
  declare avatar_url?: string
  declare gender?: 'male' | 'female' | 'other'
  declare age?: number
  declare is_profile_set: boolean
  declare is_member: boolean
  declare member_expire_date?: Date
  declare created_at?: Date
  declare updated_at?: Date
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    account_id: {
      type: DataTypes.CHAR(6),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    avatar_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true,
    },
    age: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
    },
    is_profile_set: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    is_member: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    member_expire_date: {
      type: DataTypes.DATE,
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
    tableName: 'users',
    timestamps: false,
  }
)

export { User, UserAttributes, UserCreationAttributes }

