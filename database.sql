CREATE DATABASE IF NOT EXISTS authentication_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE authentication_db;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username)
);

CREATE TABLE IF NOT EXISTS positions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  position_code VARCHAR(100) NOT NULL,
  position_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_positions_position_code (position_code)
);
