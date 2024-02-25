DROP TABLE IF EXISTS RefreshToken;

CREATE TABLE RefreshToken (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, 
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);