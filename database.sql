CREATE DATABASE IF NOT EXISTS food_ordering;
USE food_ordering;

CREATE TABLE IF NOT EXISTS food_items (
  food_id INT AUTO_INCREMENT PRIMARY KEY,
  food_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  availability BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO food_items (food_name, category, price, description, availability) VALUES
('Classic Burger', 'Fast Food', 149.00, 'Juicy burger with fresh vegetables and sauce', TRUE),
('Margherita Pizza', 'Pizza', 249.00, 'Cheesy pizza with tomato and basil', TRUE),
('Veg Biryani', 'Indian', 179.00, 'Aromatic rice cooked with vegetables and spices', TRUE),
('French Fries', 'Snacks', 89.00, 'Crispy golden potato fries', TRUE),
('Chocolate Brownie', 'Dessert', 99.00, 'Rich chocolate brownie', TRUE);
