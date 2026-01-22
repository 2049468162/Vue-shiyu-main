// 设置模型之间的关联关系
import { User } from './User.js'
import { Tag } from './Tag.js'
import { UserTag } from './UserTag.js'
import { Conversation } from './Conversation.js'
import { ConversationMember } from './ConversationMember.js'
import { Message } from './Message.js'
import { Friend } from './Friend.js'
import { FriendRequest } from './FriendRequest.js'
import { Notification } from './Notification.js'
import { LoginAttempt } from './LoginAttempt.js'

// UserTag 关联 Tag
UserTag.belongsTo(Tag, {
  foreignKey: 'tag_id',
  as: 'tag',
})

// UserTag 关联 User
UserTag.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
})

// User 可以有多个 UserTag
User.hasMany(UserTag, {
  foreignKey: 'user_id',
  as: 'userTags',
})

// Tag 可以有多个 UserTag
Tag.hasMany(UserTag, {
  foreignKey: 'tag_id',
  as: 'userTags',
})

// Conversation 和 ConversationMember 关联
Conversation.hasMany(ConversationMember, {
  foreignKey: 'conversation_id',
  as: 'members',
})

ConversationMember.belongsTo(Conversation, {
  foreignKey: 'conversation_id',
  as: 'conversation',
})

ConversationMember.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
})

// Conversation 和 Message 关联
Conversation.hasMany(Message, {
  foreignKey: 'conversation_id',
  as: 'messages',
})

Message.belongsTo(Conversation, {
  foreignKey: 'conversation_id',
  as: 'conversation',
})

// Message 和 User (sender) 关联
Message.belongsTo(User, {
  foreignKey: 'sender_id',
  as: 'sender',
})

User.hasMany(Message, {
  foreignKey: 'sender_id',
  as: 'sentMessages',
})

// Friend 关联
Friend.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
})

Friend.belongsTo(User, {
  foreignKey: 'friend_id',
  as: 'friend',
})

User.hasMany(Friend, {
  foreignKey: 'user_id',
  as: 'friends',
})

// FriendRequest 关联
FriendRequest.belongsTo(User, {
  foreignKey: 'from_user_id',
  as: 'fromUser',
})

FriendRequest.belongsTo(User, {
  foreignKey: 'to_user_id',
  as: 'toUser',
})

User.hasMany(FriendRequest, {
  foreignKey: 'from_user_id',
  as: 'sentRequests',
})

User.hasMany(FriendRequest, {
  foreignKey: 'to_user_id',
  as: 'receivedRequests',
})

// Notification 关联
Notification.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
})

Notification.belongsTo(User, {
  foreignKey: 'related_user_id',
  as: 'relatedUser',
})

User.hasMany(Notification, {
  foreignKey: 'user_id',
  as: 'notifications',
})

export { User, Tag, UserTag, Conversation, ConversationMember, Message, Friend, FriendRequest, Notification, LoginAttempt }
