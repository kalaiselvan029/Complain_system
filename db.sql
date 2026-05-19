CREATE DATABASE complaint_db;
USE complaint_db;

CREATE TABLE complaints (

    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100),

    email VARCHAR(100),

    category VARCHAR(100),

    complaint TEXT,

    priority VARCHAR(50) DEFAULT 'Medium',

    status VARCHAR(50) DEFAULT 'Pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);