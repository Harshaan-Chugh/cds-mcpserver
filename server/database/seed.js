import { pool } from './db.js';

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🌱 Seeding database...');

    // Insert users
    console.log('👥 Inserting users...');
    const usersResult = await client.query(`
      INSERT INTO users (email, username, first_name, last_name, created_at, last_login, is_active)
      VALUES 
        ('john.doe@example.com', 'johndoe', 'John', 'Doe', NOW() - INTERVAL '6 months', NOW() - INTERVAL '2 days', true),
        ('jane.smith@example.com', 'janesmith', 'Jane', 'Smith', NOW() - INTERVAL '4 months', NOW() - INTERVAL '1 day', true),
        ('bob.wilson@example.com', 'bobwilson', 'Bob', 'Wilson', NOW() - INTERVAL '3 months', NOW() - INTERVAL '5 days', true),
        ('alice.johnson@example.com', 'alicejohnson', 'Alice', 'Johnson', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 hour', true),
        ('charlie.brown@example.com', 'charliebrown', 'Charlie', 'Brown', NOW() - INTERVAL '1 month', NOW() - INTERVAL '3 days', true),
        ('diana.prince@example.com', 'dianaprince', 'Diana', 'Prince', NOW() - INTERVAL '5 months', NOW() - INTERVAL '7 days', false),
        ('edward.norton@example.com', 'ednorton', 'Edward', 'Norton', NOW() - INTERVAL '45 days', NOW() - INTERVAL '10 days', true),
        ('fiona.gallagher@example.com', 'fionagal', 'Fiona', 'Gallagher', NOW() - INTERVAL '60 days', NOW() - INTERVAL '1 day', true),
        ('george.martin@example.com', 'gmartin', 'George', 'Martin', NOW() - INTERVAL '90 days', NOW() - INTERVAL '6 hours', true),
        ('hannah.montana@example.com', 'hmontana', 'Hannah', 'Montana', NOW() - INTERVAL '120 days', NOW() - INTERVAL '2 hours', true)
      RETURNING id
    `);
    console.log(`   ✓ Inserted ${usersResult.rowCount} users`);

    // Insert categories
    console.log('📂 Inserting categories...');
    const categoriesResult = await client.query(`
      INSERT INTO categories (name, description)
      VALUES 
        ('Electronics', 'Electronic devices and accessories'),
        ('Books', 'Physical and digital books'),
        ('Clothing', 'Apparel and fashion items'),
        ('Home & Garden', 'Home improvement and garden supplies'),
        ('Sports & Outdoors', 'Sports equipment and outdoor gear'),
        ('Toys & Games', 'Toys, games, and hobbies')
      RETURNING id
    `);
    console.log(`   ✓ Inserted ${categoriesResult.rowCount} categories`);

    // Insert products
    console.log('📦 Inserting products...');
    const productsResult = await client.query(`
      INSERT INTO products (name, description, price, category_id, stock_quantity)
      VALUES 
        -- Electronics
        ('Wireless Headphones', 'Premium noise-cancelling wireless headphones', 199.99, 1, 50),
        ('Smart Watch', 'Fitness tracking smartwatch with heart rate monitor', 299.99, 1, 30),
        ('Laptop Stand', 'Adjustable aluminum laptop stand', 49.99, 1, 100),
        ('USB-C Hub', '7-in-1 USB-C hub with HDMI and ethernet', 79.99, 1, 75),
        ('Wireless Mouse', 'Ergonomic wireless mouse with 6 buttons', 39.99, 1, 120),
        
        -- Books
        ('The Art of Programming', 'Comprehensive guide to software development', 45.99, 2, 200),
        ('Database Design Patterns', 'Advanced database design techniques', 52.99, 2, 150),
        ('Web Development 101', 'Beginner-friendly web development guide', 29.99, 2, 180),
        ('Machine Learning Basics', 'Introduction to machine learning concepts', 59.99, 2, 90),
        
        -- Clothing
        ('Cotton T-Shirt', 'Comfortable 100% cotton t-shirt', 19.99, 3, 500),
        ('Denim Jeans', 'Classic fit denim jeans', 59.99, 3, 250),
        ('Running Shoes', 'Lightweight running shoes with cushioned sole', 89.99, 3, 100),
        ('Winter Jacket', 'Waterproof winter jacket with thermal lining', 149.99, 3, 60),
        
        -- Home & Garden
        ('LED Desk Lamp', 'Adjustable LED desk lamp with USB charging port', 34.99, 4, 85),
        ('Plant Starter Kit', 'Indoor herb garden starter kit', 24.99, 4, 150),
        ('Tool Set', '100-piece home repair tool set', 79.99, 4, 40),
        
        -- Sports & Outdoors
        ('Yoga Mat', 'Non-slip eco-friendly yoga mat', 29.99, 5, 200),
        ('Water Bottle', 'Insulated stainless steel water bottle 32oz', 24.99, 5, 300),
        ('Camping Tent', '4-person weatherproof camping tent', 199.99, 5, 25),
        
        -- Toys & Games
        ('Board Game Collection', 'Classic board games family pack', 44.99, 6, 80),
        ('LEGO Building Set', '1000-piece creative building set', 69.99, 6, 100),
        ('Puzzle Set', '500-piece landscape puzzle', 19.99, 6, 150)
      RETURNING id
    `);
    console.log(`   ✓ Inserted ${productsResult.rowCount} products`);

    // Insert orders
    console.log('🛒 Inserting orders...');
    const ordersResult = await client.query(`
      INSERT INTO orders (user_id, total_amount, status, created_at)
      VALUES 
        (1, 249.98, 'completed', NOW() - INTERVAL '30 days'),
        (1, 89.99, 'completed', NOW() - INTERVAL '15 days'),
        (2, 479.96, 'completed', NOW() - INTERVAL '25 days'),
        (2, 149.99, 'shipped', NOW() - INTERVAL '3 days'),
        (3, 119.98, 'completed', NOW() - INTERVAL '40 days'),
        (3, 299.99, 'processing', NOW() - INTERVAL '1 day'),
        (4, 79.99, 'completed', NOW() - INTERVAL '20 days'),
        (4, 199.98, 'completed', NOW() - INTERVAL '10 days'),
        (5, 159.97, 'shipped', NOW() - INTERVAL '2 days'),
        (6, 54.98, 'cancelled', NOW() - INTERVAL '35 days'),
        (7, 299.99, 'completed', NOW() - INTERVAL '18 days'),
        (8, 89.98, 'completed', NOW() - INTERVAL '12 days'),
        (9, 374.96, 'processing', NOW() - INTERVAL '1 day'),
        (10, 44.99, 'completed', NOW() - INTERVAL '5 days')
      RETURNING id
    `);
    console.log(`   ✓ Inserted ${ordersResult.rowCount} orders`);

    // Insert order items
    console.log('📝 Inserting order items...');
    await client.query(`
      INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
      VALUES 
        -- Order 1
        (1, 1, 1, 199.99),
        (1, 5, 1, 39.99),
        (1, 10, 1, 19.99),
        
        -- Order 2
        (2, 13, 1, 89.99),
        
        -- Order 3
        (3, 2, 1, 299.99),
        (3, 4, 2, 79.99),
        (3, 14, 1, 34.99),
        
        -- Order 4
        (4, 14, 1, 149.99),
        
        -- Order 5
        (5, 5, 2, 39.99),
        (5, 10, 2, 19.99),
        
        -- Order 6
        (6, 2, 1, 299.99),
        
        -- Order 7
        (7, 4, 1, 79.99),
        
        -- Order 8
        (8, 1, 1, 199.99),
        
        -- Order 9
        (9, 10, 3, 19.99),
        (9, 18, 1, 29.99),
        (9, 19, 2, 24.99),
        (9, 15, 1, 24.99),
        
        -- Order 10
        (10, 10, 1, 19.99),
        (10, 11, 1, 59.99),
        
        -- Order 11
        (11, 2, 1, 299.99),
        
        -- Order 12
        (12, 18, 2, 29.99),
        (12, 10, 1, 19.99),
        
        -- Order 13
        (13, 1, 1, 199.99),
        (13, 3, 1, 49.99),
        (13, 5, 2, 39.99),
        (13, 14, 1, 34.99),
        
        -- Order 14
        (14, 21, 1, 44.99)
    `);
    console.log('   ✓ Inserted order items');

    await client.query('COMMIT');
    
    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: 10`);
    console.log(`   - Categories: 6`);
    console.log(`   - Products: 22`);
    console.log(`   - Orders: 14`);
    console.log(`   - Order Items: 28`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
