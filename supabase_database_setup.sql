-- Supabase Database Setup for AgriLink Project
-- This script creates all necessary tables, relationships, and indexes

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('super_admin', 'admin');
CREATE TYPE business_type AS ENUM ('Individual Farmer', 'Farm Cooperative', 'Agricultural Company', 'Organic Farm', 'Livestock Farm', 'Mixed Farm', 'Other');
CREATE TYPE product_category AS ENUM ('vegetables', 'fruits', 'grains', 'spices', 'herbs', 'dairy', 'coconut', 'other');
CREATE TYPE product_unit AS ENUM ('kg', 'g', 'tons', 'pieces', 'bundles');
CREATE TYPE product_quality AS ENUM ('premium', 'standard', 'organic');
CREATE TYPE product_status AS ENUM ('available', 'sold', 'expired', 'pending');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('cod', 'card', 'bank');
CREATE TYPE delivery_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE message_type AS ENUM ('service_announcement', 'platform_notice', 'feature_update', 'market_insight', 'special_offer');
CREATE TYPE message_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE subscription_type AS ENUM ('daily', 'priceChange', 'predicted');
CREATE TYPE campaign_type AS ENUM ('manual', 'automated');
CREATE TYPE campaign_status AS ENUM ('sent', 'failed', 'partial');

-- Create Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    district VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    profile_image TEXT,
    price_alerts JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Sellers table
CREATE TABLE sellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    business_type business_type NOT NULL,
    district VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    license_number VARCHAR(100),
    business_description TEXT,
    years_of_experience INTEGER CHECK (years_of_experience >= 0),
    profile_image TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Admins table
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    role user_role DEFAULT 'admin',
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Delivery Persons table
CREATE TABLE delivery_persons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    personal_info JSONB NOT NULL,
    bank_details JSONB,
    documents JSONB,
    status delivery_status DEFAULT 'pending',
    vehicle_info JSONB,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category product_category NOT NULL,
    variety VARCHAR(100),
    description TEXT,
    price_per_kg DECIMAL(10, 2) NOT NULL CHECK (price_per_kg >= 0),
    available_quantity DECIMAL(10, 2) NOT NULL CHECK (available_quantity >= 0),
    unit product_unit DEFAULT 'kg',
    harvest_date DATE,
    expiry_date DATE,
    quality product_quality DEFAULT 'standard',
    location JSONB NOT NULL,
    images TEXT[] DEFAULT '{}',
    status product_status DEFAULT 'available',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Product Catalog table
CREATE TABLE product_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category product_category NOT NULL,
    description TEXT DEFAULT '',
    images TEXT[] DEFAULT '{}',
    total_available_quantity DECIMAL(10, 2) DEFAULT 0,
    average_price DECIMAL(10, 2) DEFAULT 0,
    unit product_unit DEFAULT 'kg',
    seller_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    items JSONB NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'unpaid',
    payment_method payment_method DEFAULT 'cod',
    shipping_address JSONB,
    supplier JSONB,
    tracking JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Email Subscriptions table
CREATE TABLE email_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    subscription_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_email_sent TIMESTAMP WITH TIME ZONE,
    preferences JSONB NOT NULL DEFAULT '{
        "priceAlerts": true,
        "weeklyDigest": true,
        "marketNews": true,
        "forecastUpdates": true
    }'::jsonb,
    unsubscribe_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    type subscription_type NOT NULL,
    categories TEXT[] DEFAULT '{}',
    crops TEXT[] DEFAULT '{}',
    location VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Email Campaigns table
CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_to_count INTEGER NOT NULL CHECK (sent_to_count >= 0),
    sent_by VARCHAR(255) DEFAULT 'Admin',
    recipient_emails TEXT[] NOT NULL,
    status campaign_status DEFAULT 'sent',
    error_count INTEGER DEFAULT 0 CHECK (error_count >= 0),
    campaign_type campaign_type DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Newsletter Messages table
CREATE TABLE newsletter_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    message_type message_type DEFAULT 'service_announcement',
    priority message_priority DEFAULT 'medium',
    is_active BOOLEAN DEFAULT TRUE,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    sent_date TIMESTAMP WITH TIME ZONE,
    sent_to_count INTEGER DEFAULT 0,
    target_audience JSONB NOT NULL DEFAULT '{
        "allSubscribers": true,
        "priceAlertsOnly": false,
        "marketNewsOnly": false,
        "weeklyDigestOnly": false
    }'::jsonb,
    email_subject VARCHAR(150) NOT NULL,
    html_content TEXT NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance

-- Customers indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_district_province ON customers(district, province);

-- Sellers indexes
CREATE INDEX idx_sellers_email ON sellers(email);
CREATE INDEX idx_sellers_district_province ON sellers(district, province);
CREATE INDEX idx_sellers_business_type ON sellers(business_type);
CREATE INDEX idx_sellers_is_verified ON sellers(is_verified);

-- Admins indexes
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_role ON admins(role);
CREATE INDEX idx_admins_is_active ON admins(is_active);

-- Delivery Persons indexes
CREATE INDEX idx_delivery_persons_status ON delivery_persons(status);
CREATE INDEX idx_delivery_persons_approved_at ON delivery_persons(approved_at);

-- Products indexes
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category_status ON products(category, status);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_price_per_kg ON products(price_per_kg);
CREATE INDEX idx_products_is_active ON products(is_active);

-- Product Catalog indexes
CREATE INDEX idx_product_catalog_name ON product_catalog(name);
CREATE INDEX idx_product_catalog_category ON product_catalog(category);
CREATE INDEX idx_product_catalog_is_active ON product_catalog(is_active);

-- Orders indexes
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Email Subscriptions indexes
CREATE INDEX idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX idx_email_subscriptions_is_active ON email_subscriptions(is_active);
CREATE INDEX idx_email_subscriptions_unsubscribe_token ON email_subscriptions(unsubscribe_token);

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_type ON subscriptions(type);
CREATE INDEX idx_subscriptions_is_active ON subscriptions(is_active);

-- Email Campaigns indexes
CREATE INDEX idx_email_campaigns_sent_at ON email_campaigns(sent_at);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_sent_by ON email_campaigns(sent_by);

-- Newsletter Messages indexes
CREATE INDEX idx_newsletter_messages_message_type ON newsletter_messages(message_type);
CREATE INDEX idx_newsletter_messages_priority ON newsletter_messages(priority);
CREATE INDEX idx_newsletter_messages_is_active ON newsletter_messages(is_active);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON sellers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_persons_updated_at BEFORE UPDATE ON delivery_persons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_catalog_updated_at BEFORE UPDATE ON product_catalog FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_subscriptions_updated_at BEFORE UPDATE ON email_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_newsletter_messages_updated_at BEFORE UPDATE ON newsletter_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_messages ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you may need to customize these based on your auth requirements)
-- Customers can only see their own data
CREATE POLICY "Customers can view own data" ON customers FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Customers can update own data" ON customers FOR UPDATE USING (auth.uid()::text = id::text);

-- Sellers can only see their own data
CREATE POLICY "Sellers can view own data" ON sellers FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Sellers can update own data" ON sellers FOR UPDATE USING (auth.uid()::text = id::text);

-- Products are publicly readable but only editable by their sellers
CREATE POLICY "Products are publicly readable" ON products FOR SELECT USING (true);
CREATE POLICY "Sellers can manage own products" ON products FOR ALL USING (auth.uid()::text = seller_id::text);

-- Orders are only accessible by the customer who placed them
CREATE POLICY "Customers can view own orders" ON orders FOR SELECT USING (auth.uid()::text = customer_id::text);
CREATE POLICY "Customers can create orders" ON orders FOR INSERT WITH CHECK (auth.uid()::text = customer_id::text);

-- Product catalog is publicly readable
CREATE POLICY "Product catalog is publicly readable" ON product_catalog FOR SELECT USING (true);

-- Email subscriptions are publicly readable and writable
CREATE POLICY "Email subscriptions are publicly accessible" ON email_subscriptions FOR ALL USING (true);

-- Subscriptions are publicly accessible
CREATE POLICY "Subscriptions are publicly accessible" ON subscriptions FOR ALL USING (true);

-- Email campaigns and newsletter messages are publicly readable
CREATE POLICY "Email campaigns are publicly readable" ON email_campaigns FOR SELECT USING (true);
CREATE POLICY "Newsletter messages are publicly readable" ON newsletter_messages FOR SELECT USING (true);

-- Insert sample data (optional)
-- You can uncomment and modify these inserts to add sample data

-- Insert sample admin
-- INSERT INTO admins (name, email, password, phone, role, permissions) 
-- VALUES ('Super Admin', 'admin@agrilink.com', '$2b$10$example_hash', '+1234567890', 'super_admin', ARRAY['manage_users', 'manage_products', 'manage_prices', 'view_analytics', 'send_notifications', 'manage_settings', 'manage_admins']);

-- Insert sample product categories
-- INSERT INTO product_catalog (name, category, description, unit) VALUES
-- ('Rice', 'grains', 'High quality rice varieties', 'kg'),
-- ('Tomatoes', 'vegetables', 'Fresh tomatoes from local farms', 'kg'),
-- ('Mangoes', 'fruits', 'Sweet and juicy mangoes', 'kg'),
-- ('Cinnamon', 'spices', 'Premium cinnamon sticks', 'kg');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create a function to generate unsubscribe tokens
CREATE OR REPLACE FUNCTION generate_unsubscribe_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Create a function to handle new user creation from Google OAuth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    user_metadata JSONB;
BEGIN
    user_metadata := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    user_role := COALESCE(user_metadata->>'user_type', 'customer');
    
    -- Insert into customers table for customer signups
    IF user_role = 'customer' THEN
        INSERT INTO customers (id, name, email, phone, district, province, address, profile_image)
        VALUES (
            NEW.id,
            COALESCE(user_metadata->>'full_name', user_metadata->>'name', split_part(NEW.email, '@', 1)),
            NEW.email,
            COALESCE(user_metadata->>'phone', ''),
            COALESCE(user_metadata->>'district', ''),
            COALESCE(user_metadata->>'province', ''),
            COALESCE(user_metadata->>'address', ''),
            COALESCE(user_metadata->>'avatar_url', '')
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
    
    -- Insert into sellers table for seller signups
    IF user_role = 'seller' THEN
        INSERT INTO sellers (id, name, email, phone, business_name, business_type, district, province, address, profile_image)
        VALUES (
            NEW.id,
            COALESCE(user_metadata->>'full_name', user_metadata->>'name', split_part(NEW.email, '@', 1)),
            NEW.email,
            COALESCE(user_metadata->>'phone', ''),
            COALESCE(user_metadata->>'business_name', user_metadata->>'name', split_part(NEW.email, '@', 1)),
            COALESCE(user_metadata->>'business_type', 'Individual Farmer')::business_type,
            COALESCE(user_metadata->>'district', ''),
            COALESCE(user_metadata->>'province', ''),
            COALESCE(user_metadata->>'address', ''),
            COALESCE(user_metadata->>'avatar_url', '')
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
    
    -- Insert into admins table for admin signups
    IF user_role = 'admin' THEN
        INSERT INTO admins (id, name, email, phone, role, permissions)
        VALUES (
            NEW.id,
            COALESCE(user_metadata->>'full_name', user_metadata->>'name', split_part(NEW.email, '@', 1)),
            NEW.email,
            COALESCE(user_metadata->>'phone', ''),
            COALESCE(user_metadata->>'role', 'admin')::user_role,
            COALESCE(user_metadata->>'permissions', '{}')::TEXT[]
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to update product catalog statistics
CREATE OR REPLACE FUNCTION update_product_catalog_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update product catalog when products are added/updated/deleted
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        INSERT INTO product_catalog (name, category, total_available_quantity, average_price, seller_count, unit)
        VALUES (NEW.name, NEW.category, NEW.available_quantity, NEW.price_per_kg, 1, NEW.unit)
        ON CONFLICT (name) DO UPDATE SET
            total_available_quantity = product_catalog.total_available_quantity + NEW.available_quantity,
            average_price = (product_catalog.average_price * product_catalog.seller_count + NEW.price_per_kg) / (product_catalog.seller_count + 1),
            seller_count = product_catalog.seller_count + 1;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE product_catalog 
        SET total_available_quantity = GREATEST(0, total_available_quantity - OLD.available_quantity),
            seller_count = GREATEST(0, seller_count - 1)
        WHERE name = OLD.name;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to handle new user creation from Google OAuth
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create trigger to update product catalog
CREATE TRIGGER update_product_catalog_trigger
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION update_product_catalog_stats();

-- Update RLS policies to work with Supabase Auth
DROP POLICY IF EXISTS "Customers can view own data" ON customers;
DROP POLICY IF EXISTS "Customers can update own data" ON customers;
DROP POLICY IF EXISTS "Sellers can view own data" ON sellers;
DROP POLICY IF EXISTS "Sellers can update own data" ON sellers;

-- Updated RLS policies for Google OAuth integration
CREATE POLICY "Users can view own customer data" ON customers
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own customer data" ON customers
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own customer data" ON customers
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own seller data" ON sellers
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own seller data" ON sellers
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own seller data" ON sellers
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin policies (only admins can manage admin data)
CREATE POLICY "Admins can view all admin data" ON admins
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can manage admin data" ON admins
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Delivery persons policies
CREATE POLICY "Admins can view delivery persons" ON delivery_persons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE id = auth.uid() 
            AND is_active = true
        )
    );

CREATE POLICY "Admins can manage delivery persons" ON delivery_persons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE id = auth.uid() 
            AND is_active = true
        )
    );

-- Products policies
CREATE POLICY "Products are publicly readable" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Sellers can manage own products" ON products
    FOR ALL USING (auth.uid() = seller_id);

-- Orders policies
CREATE POLICY "Customers can view own orders" ON orders
    FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Sellers can view orders for their products" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = ANY(
                SELECT jsonb_array_elements_text(items)::uuid 
                FROM orders 
                WHERE orders.id = orders.id
            )
            AND products.seller_id = auth.uid()
        )
    );

-- Email subscriptions policies
CREATE POLICY "Email subscriptions are publicly accessible" ON email_subscriptions
    FOR ALL USING (true);

-- Subscriptions policies
CREATE POLICY "Users can manage own subscriptions" ON subscriptions
    FOR ALL USING (auth.uid()::text = user_id);

-- Email campaigns and newsletter policies (admin only)
CREATE POLICY "Admins can manage email campaigns" ON email_campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE id = auth.uid() 
            AND is_active = true
        )
    );

CREATE POLICY "Admins can manage newsletter messages" ON newsletter_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE id = auth.uid() 
            AND is_active = true
        )
    );

-- Product catalog policies
CREATE POLICY "Product catalog is publicly readable" ON product_catalog
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage product catalog" ON product_catalog
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE id = auth.uid() 
            AND is_active = true
        )
    );

COMMIT;
