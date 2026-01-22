-- 社交平台数据库初始化脚本
-- 执行命令: mysql -u root -p < create_database.sql

-- 创建数据库
CREATE DATABASE IF NOT EXISTS social_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE social_platform;

-- 1. 用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `account_id` CHAR(6) UNIQUE NOT NULL COMMENT '6位随机账号',
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `nickname` VARCHAR(50) DEFAULT NULL,
  `avatar_url` VARCHAR(500) DEFAULT NULL,
  `gender` ENUM('male', 'female', 'other') DEFAULT NULL,
  `age` TINYINT UNSIGNED DEFAULT NULL,
  `is_profile_set` BOOLEAN DEFAULT FALSE COMMENT '个人信息是否设置',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_account_id` (`account_id`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 标签表
CREATE TABLE IF NOT EXISTS `tags` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `category` ENUM('entertainment', 'food', 'movie', 'travel') NOT NULL,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_name_category` (`name`, `category`),
  INDEX `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 用户标签关联表
CREATE TABLE IF NOT EXISTS `user_tags` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `tag_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_tag` (`user_id`, `tag_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 好友关系表
CREATE TABLE IF NOT EXISTS `friends` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `friend_id` INT UNSIGNED NOT NULL,
  `remark_name` VARCHAR(50) DEFAULT NULL COMMENT '备注名',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_friend` (`user_id`, `friend_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`friend_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_friend_id` (`friend_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. 好友请求表
CREATE TABLE IF NOT EXISTS `friend_requests` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `from_user_id` INT UNSIGNED NOT NULL,
  `to_user_id` INT UNSIGNED NOT NULL,
  `status` ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_from_to` (`from_user_id`, `to_user_id`),
  FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`to_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_to_user_status` (`to_user_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. 会话表
CREATE TABLE IF NOT EXISTS `conversations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `type` ENUM('private', 'group', 'ai') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. 会话成员表
CREATE TABLE IF NOT EXISTS `conversation_members` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `conversation_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_conversation_user` (`conversation_id`, `user_id`),
  FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. 消息表
CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `conversation_id` INT UNSIGNED NOT NULL,
  `sender_id` INT UNSIGNED NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_conversation_created` (`conversation_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入初始标签数据
INSERT INTO tags (name, category, display_order) VALUES
-- 娱乐类
('游戏', 'entertainment', 1),
('音乐', 'entertainment', 2),
('运动', 'entertainment', 3),
('阅读', 'entertainment', 4),
('摄影', 'entertainment', 5),
('绘画', 'entertainment', 6),
('舞蹈', 'entertainment', 7),
('唱歌', 'entertainment', 8),

-- 美食类
('中餐', 'food', 1),
('西餐', 'food', 2),
('日料', 'food', 3),
('甜点', 'food', 4),
('烘焙', 'food', 5),
('火锅', 'food', 6),
('烧烤', 'food', 7),
('咖啡', 'food', 8),

-- 电影类
('动作片', 'movie', 1),
('喜剧片', 'movie', 2),
('科幻片', 'movie', 3),
('爱情片', 'movie', 4),
('恐怖片', 'movie', 5),
('动画片', 'movie', 6),
('纪录片', 'movie', 7),
('悬疑片', 'movie', 8),

-- 旅游类
('国内游', 'travel', 1),
('出境游', 'travel', 2),
('自驾游', 'travel', 3),
('徒步', 'travel', 4),
('露营', 'travel', 5),
('海岛', 'travel', 6),
('古镇', 'travel', 7),
('美食探店', 'travel', 8);

-- 显示创建结果
SELECT 'Database created successfully!' AS status;
SELECT COUNT(*) AS tag_count FROM tags;

