-- Google OAuth Integration Updates for AgriLink Project
-- Run this script to add Google OAuth functionality to your existing database

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

-- Create trigger to handle new user creation from Google OAuth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update RLS policies to work with Supabase Auth (drop old ones first)
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

-- Products policies (update existing ones)
DROP POLICY IF EXISTS "Products are publicly readable" ON products;
DROP POLICY IF EXISTS "Sellers can manage own products" ON products;

CREATE POLICY "Products are publicly readable" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Sellers can manage own products" ON products
    FOR ALL USING (auth.uid() = seller_id);

-- Orders policies (update existing ones)
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
DROP POLICY IF EXISTS "Customers can create orders" ON orders;

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

-- Email subscriptions policies (update existing ones)
DROP POLICY IF EXISTS "Email subscriptions are publicly accessible" ON email_subscriptions;

CREATE POLICY "Email subscriptions are publicly accessible" ON email_subscriptions
    FOR ALL USING (true);

-- Subscriptions policies (update existing ones)
DROP POLICY IF EXISTS "Subscriptions are publicly accessible" ON subscriptions;

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

-- Product catalog policies (update existing ones)
DROP POLICY IF EXISTS "Product catalog is publicly readable" ON product_catalog;

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

-- Create a function to sync existing auth users with your tables
CREATE OR REPLACE FUNCTION sync_existing_auth_users()
RETURNS void AS $$
DECLARE
    auth_user RECORD;
    user_metadata JSONB;
    user_role TEXT;
BEGIN
    -- Loop through all existing auth users
    FOR auth_user IN SELECT * FROM auth.users LOOP
        user_metadata := COALESCE(auth_user.raw_user_meta_data, '{}'::jsonb);
        user_role := COALESCE(user_metadata->>'user_type', 'customer');
        
        -- Check if user already exists in customers table
        IF NOT EXISTS (SELECT 1 FROM customers WHERE id = auth_user.id) AND user_role = 'customer' THEN
            INSERT INTO customers (id, name, email, phone, district, province, address, profile_image)
            VALUES (
                auth_user.id,
                COALESCE(user_metadata->>'full_name', user_metadata->>'name', split_part(auth_user.email, '@', 1)),
                auth_user.email,
                COALESCE(user_metadata->>'phone', ''),
                COALESCE(user_metadata->>'district', ''),
                COALESCE(user_metadata->>'province', ''),
                COALESCE(user_metadata->>'address', ''),
                COALESCE(user_metadata->>'avatar_url', '')
            );
        END IF;
        
        -- Check if user already exists in sellers table
        IF NOT EXISTS (SELECT 1 FROM sellers WHERE id = auth_user.id) AND user_role = 'seller' THEN
            INSERT INTO sellers (id, name, email, phone, business_name, business_type, district, province, address, profile_image)
            VALUES (
                auth_user.id,
                COALESCE(user_metadata->>'full_name', user_metadata->>'name', split_part(auth_user.email, '@', 1)),
                auth_user.email,
                COALESCE(user_metadata->>'phone', ''),
                COALESCE(user_metadata->>'business_name', user_metadata->>'name', split_part(auth_user.email, '@', 1)),
                COALESCE(user_metadata->>'business_type', 'Individual Farmer')::business_type,
                COALESCE(user_metadata->>'district', ''),
                COALESCE(user_metadata->>'province', ''),
                COALESCE(user_metadata->>'address', ''),
                COALESCE(user_metadata->>'avatar_url', '')
            );
        END IF;
        
        -- Check if user already exists in admins table
        IF NOT EXISTS (SELECT 1 FROM admins WHERE id = auth_user.id) AND user_role = 'admin' THEN
            INSERT INTO admins (id, name, email, phone, role, permissions)
            VALUES (
                auth_user.id,
                COALESCE(user_metadata->>'full_name', user_metadata->>'name', split_part(auth_user.email, '@', 1)),
                auth_user.email,
                COALESCE(user_metadata->>'phone', ''),
                COALESCE(user_metadata->>'role', 'admin')::user_role,
                COALESCE(user_metadata->>'permissions', '{}')::TEXT[]
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the sync function to update existing users
SELECT sync_existing_auth_users();

-- Create a function to get user type from auth
CREATE OR REPLACE FUNCTION get_user_type(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_type TEXT;
BEGIN
    -- Check if user is in customers table
    IF EXISTS (SELECT 1 FROM customers WHERE id = user_id) THEN
        RETURN 'customer';
    END IF;
    
    -- Check if user is in sellers table
    IF EXISTS (SELECT 1 FROM sellers WHERE id = user_id) THEN
        RETURN 'seller';
    END IF;
    
    -- Check if user is in admins table
    IF EXISTS (SELECT 1 FROM admins WHERE id = user_id) THEN
        RETURN 'admin';
    END IF;
    
    -- Default to customer if not found
    RETURN 'customer';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins 
        WHERE id = user_id 
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins 
        WHERE id = user_id 
        AND role = 'super_admin'
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
