/**
 * DATABASE SEEDER - THE BIGGMART
 * Populates the database with initial data
 * 
 * Run: node seed.js
 */

require('dotenv').config();
const { connectDB } = require('./config/database');
const mongoose = require('mongoose');

// Import models
const Admin = require('./models/Admin');
const Product = require('./models/Product');
const Hero = require('./models/Hero');
const Testimonial = require('./models/Testimonial');
const Stats = require('./models/Stats');

// ======================= CONFIGURATION =======================

const SEED_CONFIG = {
  forceReset: false,
  productCount: 10,
  heroCount: 4,
  testimonialCount: 6
};

// ======================= SEEDER DATA =======================

// Admin user
const adminData = {
  username: 'admin',
  password_hash: 'admin123',
  full_name: 'Super Admin',
  email: 'admin@biggmart.com',
  role: 'admin',
  is_active: true
};

// Sample Products
const productsData = [
  {
    name: 'iPhone 15 Pro Max',
    category: 'gadgets',
    description: '6.7-inch Super Retina XDR display, A17 Pro chip, 256GB storage',
    price: 950000,
    is_sold_out: false,
    image_url: null,
    featured: true
  },
  {
    name: 'MacBook Pro 16" M3',
    category: 'gadgets',
    description: 'M3 Pro chip, 18GB RAM, 512GB SSD, 16-inch Liquid Retina XDR display',
    price: 1200000,
    is_sold_out: false,
    image_url: null,
    featured: true
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    category: 'gadgets',
    description: '6.8-inch Dynamic AMOLED 2X, 200MP camera, S Pen',
    price: 780000,
    is_sold_out: false,
    image_url: null,
    featured: true
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    category: 'gadgets',
    description: 'Industry-leading noise cancellation, 30-hour battery',
    price: 180000,
    is_sold_out: false,
    image_url: null,
    featured: false
  },
  {
    name: 'Apple Watch Ultra 2',
    category: 'gadgets',
    description: '49mm titanium case, precision GPS, 3000 nits brightness',
    price: 450000,
    is_sold_out: true,
    image_url: null,
    featured: false
  },
  {
    name: 'Sony 65" 4K OLED TV',
    category: 'electronics',
    description: 'OLED panel, 120Hz refresh rate, Google TV, Dolby Atmos',
    price: 450000,
    is_sold_out: false,
    image_url: null,
    featured: true
  },
  {
    name: 'LG Side-by-Side Refrigerator',
    category: 'electronics',
    description: '600L capacity, SmartThinQ, Door-in-Door, Ice & Water dispenser',
    price: 400000,
    is_sold_out: false,
    image_url: null,
    featured: false
  },
  {
    name: 'Samsung 8kg Washing Machine',
    category: 'electronics',
    description: 'Fully automatic front load, EcoBubble, 1400 RPM',
    price: 250000,
    is_sold_out: false,
    image_url: null,
    featured: false
  },
  {
    name: 'Dyson V15 Vacuum Cleaner',
    category: 'electronics',
    description: 'Cordless, 60-minute run time, LCD display, laser detection',
    price: 180000,
    is_sold_out: false,
    image_url: null,
    featured: false
  },
  {
    name: 'Panasonic 20L Microwave Oven',
    category: 'electronics',
    description: 'Convection, 800W, Stainless steel cavity',
    price: 85000,
    is_sold_out: false,
    image_url: null,
    featured: false
  },
  {
    name: 'Premium 3-Seater Sofa Set',
    category: 'home',
    description: 'Luxury fabric, includes 3-seater + 2-seater, 5-year warranty',
    price: 150000,
    is_sold_out: false,
    image_url: null,
    featured: true
  },
  {
    name: 'Deluxe Kitchenware Set',
    category: 'home',
    description: '15-piece set: pots, pans, knives, utensils, and more',
    price: 25000,
    is_sold_out: false,
    image_url: null,
    featured: false
  },
  {
    name: 'Queen Bed Frame with Storage',
    category: 'home',
    description: 'Queen size, hydraulic lift storage, upholstered headboard',
    price: 120000,
    is_sold_out: false,
    image_url: null,
    featured: false
  },
  {
    name: 'Smart LED Lighting System',
    category: 'home',
    description: 'WiFi enabled, RGB colors, voice control compatible, 6-pack',
    price: 22000,
    is_sold_out: false,
    image_url: null,
    featured: false
  },
  {
    name: 'Bathroom Luxury Set',
    category: 'home',
    description: 'Complete set: towels, bath mat, shower curtain, accessories',
    price: 8000,
    is_sold_out: false,
    image_url: null,
    featured: false
  }
];

// Sample Hero Images
const heroData = [
  {
    image_url: '/uploads/hero/hero1.jpg',
    title: 'All You Want in One Bigg Place',
    subtitle: 'Shop the latest gadgets, electronics, and home essentials',
    display_order: 1,
    is_active: true
  },
  {
    image_url: '/uploads/hero/hero2.jpg',
    title: 'Summer Mega Sale',
    subtitle: 'Get up to 30% off on selected items. Limited time offer!',
    display_order: 2,
    is_active: true
  },
  {
    image_url: '/uploads/hero/hero3.jpg',
    title: 'New Arrivals',
    subtitle: 'Discover our latest collection of premium products',
    display_order: 3,
    is_active: true
  },
  {
    image_url: '/uploads/hero/hero4.jpg',
    title: 'Free Delivery',
    subtitle: 'Get free delivery on orders above ₦50,000 nationwide',
    display_order: 4,
    is_active: true
  }
];

// Sample Testimonials
const testimonialsData = [
  {
    customer_name: 'Oluwaseun Adebayo',
    location: 'Lagos, Nigeria',
    content: 'The BiggMart delivered exactly what I ordered! Quality products and fast shipping. Highly recommended!',
    rating: 5,
    is_published: true
  },
  {
    customer_name: 'Chioma Eze',
    location: 'Port Harcourt, Nigeria',
    content: 'Best online shopping experience in Nigeria! Customer service is amazing and responsive. Keep it up!',
    rating: 5,
    is_published: true
  },
  {
    customer_name: 'Emmanuel Okafor',
    location: 'Abuja, Nigeria',
    content: 'Great variety of products at affordable prices. The delivery was prompt and packaging was excellent.',
    rating: 4,
    is_published: true
  },
  {
    customer_name: 'Aisha Bello',
    location: 'Kano, Nigeria',
    content: 'I love shopping at The BiggMart! The products are genuine and the prices are unbeatable.',
    rating: 5,
    is_published: true
  },
  {
    customer_name: 'Chidi Okonkwo',
    location: 'Enugu, Nigeria',
    content: 'Excellent service! My order arrived within 24 hours. Will definitely shop again.',
    rating: 4,
    is_published: true
  },
  {
    customer_name: 'Folake Williams',
    location: 'Ibadan, Nigeria',
    content: 'The BiggMart is my go-to online store. From electronics to home essentials, they have it all.',
    rating: 5,
    is_published: true
  }
];

// ======================= SEED FUNCTIONS =======================

async function seedAdmin() {
  console.log('👤 Creating admin user...');
  
  try {
    let admin = await Admin.findOne({ username: adminData.username });
    
    if (admin) {
      console.log('   ℹ️ Admin already exists, updating...');
      admin.full_name = adminData.full_name;
      admin.email = adminData.email;
      admin.role = adminData.role;
      admin.is_active = adminData.is_active;
      await admin.save();
      console.log('   ✅ Admin updated');
    } else {
      admin = new Admin(adminData);
      await admin.save();
      console.log('   ✅ Admin created successfully');
    }
    
    console.log(`   📧 Username: ${adminData.username}`);
    console.log(`   🔑 Password: ${adminData.password_hash}`);
    console.log(`   👤 Full Name: ${adminData.full_name}`);
    
    return admin;
  } catch (error) {
    console.error('   ❌ Error seeding admin:', error.message);
    throw error;
  }
}

async function seedProducts() {
  console.log('📦 Seeding products...');
  
  const products = [];
  for (const productData of productsData) {
    try {
      let product = await Product.findOne({ name: productData.name });
      
      if (product) {
        console.log(`   ℹ️ Product "${productData.name}" already exists, skipping...`);
        products.push(product);
      } else {
        product = new Product(productData);
        await product.save();
        console.log(`   ✅ Created: ${productData.name}`);
        products.push(product);
      }
    } catch (error) {
      console.error(`   ❌ Error with product "${productData.name}":`, error.message);
    }
  }
  return products;
}

async function seedHero(products) {
  console.log('🖼️ Seeding hero images...');
  
  const heroes = [];
  for (const hero of heroData) {  // ← FIXED: changed heroData to hero
    try {
      let existingHero = await Hero.findOne({ title: hero.title });
      
      if (existingHero) {
        existingHero.subtitle = hero.subtitle;
        existingHero.display_order = hero.display_order;
        existingHero.is_active = hero.is_active;
        await existingHero.save();
        console.log(`   🔄 Updated: ${hero.title}`);
        heroes.push(existingHero);
      } else {
        const heroWithProduct = {
          ...hero,
          product_id: products.length > 0 ? products[0]._id : null
        };
        const newHero = new Hero(heroWithProduct);
        await newHero.save();
        console.log(`   ✅ Created: ${hero.title}`);
        heroes.push(newHero);
      }
    } catch (error) {
      console.error(`   ❌ Error with hero "${hero.title}":`, error.message);
    }
  }
  return heroes;
}

async function seedTestimonials(products) {
  console.log('⭐ Seeding testimonials...');
  
  const testimonials = [];
  for (const testimonialData of testimonialsData) {
    try {
      let testimonial = await Testimonial.findOne({ 
        customer_name: testimonialData.customer_name,
        content: testimonialData.content 
      });
      
      if (testimonial) {
        console.log(`   ℹ️ Testimonial from "${testimonialData.customer_name}" already exists, skipping...`);
        testimonials.push(testimonial);
      } else {
        const testimonialWithProduct = {
          ...testimonialData,
          product_id: products.length > 0 ? products[0]._id : null
        };
        const newTestimonial = new Testimonial(testimonialWithProduct);
        await newTestimonial.save();
        console.log(`   ✅ Created: ${testimonialData.customer_name}`);
        testimonials.push(newTestimonial);
      }
    } catch (error) {
      console.error(`   ❌ Error with testimonial "${testimonialData.customer_name}":`, error.message);
    }
  }
  return testimonials;
}

async function seedStats(products) {
  console.log('📊 Seeding stats...');
  
  try {
    const stats = await Stats.get();
    stats.total_products = products.length;
    stats.total_sold_out = products.filter(p => p.is_sold_out).length;
    stats.total_cities = 50;
    stats.total_customers = 15000;
    stats.on_time_delivery = 98;
    await stats.save();
    console.log('   ✅ Stats created/updated');
    console.log(`   📊 Total Products: ${stats.total_products}`);
    console.log(`   📊 Sold Out: ${stats.total_sold_out}`);
    return stats;
  } catch (error) {
    console.error('   ❌ Error seeding stats:', error.message);
    throw error;
  }
}

async function printSummary() {
  console.log('📊 Database Summary:');
  console.log('=' .repeat(50));
  
  try {
    const adminCount = await Admin.countDocuments();
    const productCount = await Product.countDocuments();
    const heroCount = await Hero.countDocuments();
    const testimonialCount = await Testimonial.countDocuments();
    const stats = await Stats.get();
    
    console.log(`   👤 Admins: ${adminCount}`);
    console.log(`   📦 Products: ${productCount}`);
    console.log(`   🖼️ Hero Images: ${heroCount}`);
    console.log(`   ⭐ Testimonials: ${testimonialCount}`);
    console.log('='.repeat(50));
    console.log('📈 Stats Values:');
    console.log(`   Total Products: ${stats.total_products}`);
    console.log(`   Sold Out: ${stats.total_sold_out}`);
    console.log(`   Cities Covered: ${stats.total_cities}`);
    console.log(`   Happy Customers: ${stats.total_customers}`);
    console.log(`   On-Time Delivery: ${stats.on_time_delivery}%`);
  } catch (error) {
    console.error('   ❌ Error fetching summary:', error.message);
  }
}

// ======================= MAIN SEED FUNCTION =======================

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  console.log('=' .repeat(50));

  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    const admin = await seedAdmin();
    console.log('=' .repeat(50));
    
    const products = await seedProducts();
    console.log('=' .repeat(50));
    
    const heroes = await seedHero(products);
    console.log('=' .repeat(50));
    
    const testimonials = await seedTestimonials(products);
    console.log('=' .repeat(50));
    
    const stats = await seedStats(products);
    console.log('=' .repeat(50));

    await printSummary();
    
    console.log('=' .repeat(50));
    console.log('✅ Database seeding completed successfully!');
    console.log('=' .repeat(50));
    console.log('🔐 Login Credentials:');
    console.log(`   Username: ${adminData.username}`);
    console.log(`   Password: ${adminData.password_hash}`);
    console.log('=' .repeat(50));
    console.log('🚀 Server is ready! Run "npm run dev" to start.');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    try {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed');
    } catch (error) {
      console.error('Error closing connection:', error.message);
    }
    process.exit(0);
  }
}

// ======================= RUN =======================

seedDatabase();
