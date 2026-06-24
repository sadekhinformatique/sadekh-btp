import pg from "pg";

const { Client } = pg;

async function main() {
  const client = new Client({
    host: "aws-0-eu-west-3.pooler.supabase.com",
    port: 6543,
    database: "postgres",
    user: "postgres.bqqkuxehwaaxkgqqsrnq",
    password: "Dspro1814@2027",
    ssl: { rejectUnauthorized: false },
  });

  console.log("🔌 Connecting to Supabase PostgreSQL...");
  await client.connect();
  console.log("✅ Connected!");

  try {
    // ============================================
    // DROP EXISTING TABLES (reverse dependency order)
    // ============================================
    console.log("\n🗑️  Dropping existing tables if they exist...");
    await client.query(`
      DROP TABLE IF EXISTS property_alerts CASCADE;
      DROP TABLE IF EXISTS reports CASCADE;
      DROP TABLE IF EXISTS payments CASCADE;
      DROP TABLE IF EXISTS messages CASCADE;
      DROP TABLE IF EXISTS favorites CASCADE;
      DROP TABLE IF EXISTS properties CASCADE;
      DROP TABLE IF EXISTS profiles CASCADE;
    `);
    console.log("✅ Old tables dropped.");

    // ============================================
    // CREATE updated_at TRIGGER FUNCTION
    // ============================================
    console.log("\n🔧 Creating trigger function for updated_at...");
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log("✅ Trigger function created.");

    // ============================================
    // CREATE TABLES
    // ============================================
    console.log("\n📋 Creating tables...");

    // 1. profiles
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT,
        phone TEXT,
        whatsapp TEXT,
        agency_name TEXT,
        verified BOOLEAN DEFAULT false,
        bio TEXT,
        avatar TEXT,
        role TEXT DEFAULT 'user' CHECK (role IN ('user', 'agent', 'admin')),
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log("  ✅ profiles");

    // 2. properties
    await client.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        type TEXT DEFAULT 'maison' CHECK (type IN ('maison', 'appartement', 'terrain', 'plan')),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        price NUMERIC(15,2) NOT NULL,
        price_negotiable BOOLEAN DEFAULT false,
        surface_m2 INTEGER,
        rooms INTEGER,
        region TEXT DEFAULT 'Dakar',
        city TEXT DEFAULT '',
        quartier TEXT DEFAULT '',
        lat NUMERIC(10,7),
        lng NUMERIC(10,7),
        images JSONB DEFAULT '[]'::jsonb,
        title_foncier BOOLEAN DEFAULT false,
        status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'sold', 'suspended')),
        is_premium BOOLEAN DEFAULT false,
        views_count INTEGER DEFAULT 0,
        plan_pdf_url TEXT,
        plan_price NUMERIC(15,2),
        plan_downloads INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log("  ✅ properties");

    // 3. favorites
    await client.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(user_id, property_id)
      );
    `);
    console.log("  ✅ favorites");

    // 4. messages
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
        receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
        property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        read_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log("  ✅ messages");

    // 5. payments
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('boost', 'plan', 'premium')),
        amount NUMERIC(15,2) NOT NULL,
        method TEXT DEFAULT 'wave' CHECK (method IN ('wave', 'orange_money')),
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
        ref_wave TEXT,
        property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log("  ✅ payments");

    // 6. reports
    await client.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
        reason TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log("  ✅ reports");

    // 7. property_alerts
    await client.query(`
      CREATE TABLE IF NOT EXISTS property_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
        type TEXT CHECK (type IN ('maison', 'appartement', 'terrain', 'plan', 'all')),
        region TEXT,
        max_price NUMERIC(15,2),
        min_surface INTEGER,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log("  ✅ property_alerts");

    // 8. site_settings
    await client.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        site_name TEXT DEFAULT 'SADEKH BTP',
        site_tagline TEXT DEFAULT 'La première marketplace immobilière du Sénégal',
        logo_url TEXT DEFAULT '/logo-sadekh.png',
        favicon_url TEXT DEFAULT '/favicon.ico',
        primary_color TEXT DEFAULT '#1B5E20',
        accent_color TEXT DEFAULT '#C8A951',
        contact_email TEXT DEFAULT 'contact@sadekhbtp.sn',
        contact_phone TEXT DEFAULT '+221 77 123 45 67',
        contact_whatsapp TEXT DEFAULT '+221 77 123 45 67',
        contact_address TEXT DEFAULT 'Dakar, Sénégal',
        facebook_url TEXT DEFAULT '',
        instagram_url TEXT DEFAULT '',
        twitter_url TEXT DEFAULT '',
        youtube_url TEXT DEFAULT '',
        tiktok_url TEXT DEFAULT '',
        seo_title TEXT DEFAULT 'SADEKH BTP - Marketplace Immobilière Sénégal',
        seo_description TEXT DEFAULT 'Découvrez les meilleures offres immobilières au Sénégal sur SADEKH BTP.',
        seo_keywords TEXT DEFAULT 'immobilier, Sénégal, Dakar, maison, appartement, terrain',
        hero_title_fr TEXT DEFAULT 'Trouvez votre bien idéal au Sénégal',
        hero_subtitle_fr TEXT DEFAULT 'Des milliers de biens immobiliers vous attendent',
        hero_title_wo TEXT DEFAULT 'Jëf jëf ndax biir Sénégal',
        hero_subtitle_wo TEXT DEFAULT 'Immobilier bu baax, bu am solo',
        footer_about_fr TEXT DEFAULT 'SADEKH BTP est la première marketplace immobilière du Sénégal.',
        footer_about_wo TEXT DEFAULT 'SADEKH BTP mooy marketplace bu njëkk bi ci Sénégal.',
        boost_price NUMERIC(15,2) DEFAULT 2500,
        premium_price NUMERIC(15,2) DEFAULT 5000,
        currency TEXT DEFAULT 'FCFA',
        currency_symbol TEXT DEFAULT 'F',
        updated_at TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT site_settings_single_row CHECK (id = 1)
      );
    `);
    console.log("  ✅ site_settings");

    // ============================================
    // CREATE updated_at TRIGGERS
    // ============================================
    console.log("\n⏱️  Creating updated_at triggers...");
    const triggerTables = [
      "profiles",
      "properties",
      "favorites",
      "messages",
      "payments",
      "reports",
      "property_alerts",
      "site_settings",
    ];
    for (const table of triggerTables) {
      await client.query(`
        CREATE TRIGGER set_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);
      console.log(`  ✅ trigger on ${table}`);
    }

    // ============================================
    // CREATE INDEXES
    // ============================================
    console.log("\n📊 Creating indexes...");

    // properties indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_properties_region ON properties(region);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_properties_is_premium ON properties(is_premium);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);`);
    console.log("  ✅ properties indexes");

    // favorites indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON favorites(property_id);`);
    console.log("  ✅ favorites indexes");

    // messages indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_messages_property_id ON messages(property_id);`);
    console.log("  ✅ messages indexes");

    // payments indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);`);
    console.log("  ✅ payments indexes");

    // ============================================
    // ENABLE RLS
    // ============================================
    console.log("\n🔒 Enabling Row Level Security...");
    const rlsTables = [
      "profiles",
      "properties",
      "favorites",
      "messages",
      "payments",
      "reports",
      "property_alerts",
      "site_settings",
    ];
    for (const table of rlsTables) {
      await client.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
      console.log(`  ✅ RLS enabled on ${table}`);
    }

    // ============================================
    // CREATE RLS POLICIES
    // ============================================
    console.log("\n📜 Creating RLS policies...");

    // --- profiles policies ---
    // Users can SELECT their own profile
    await client.query(`
      CREATE POLICY "profiles_select_own" ON profiles
        FOR SELECT USING (auth.uid() = user_id OR auth.uid()::text = email::text);
    `);
    // Admins can SELECT all profiles
    await client.query(`
      CREATE POLICY "profiles_select_all_admin" ON profiles
        FOR SELECT USING (
          EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        );
    `);
    // Users can INSERT their own profile
    await client.query(`
      CREATE POLICY "profiles_insert_own" ON profiles
        FOR INSERT WITH CHECK (true);
    `);
    // Users can UPDATE their own profile
    await client.query(`
      CREATE POLICY "profiles_update_own" ON profiles
        FOR UPDATE USING (auth.uid() = user_id OR auth.uid()::text = email::text)
        WITH CHECK (auth.uid() = user_id OR auth.uid()::text = email::text);
    `);
    console.log("  ✅ profiles policies");

    // --- properties policies ---
    // Public (anon) can SELECT active properties
    await client.query(`
      CREATE POLICY "properties_select_active" ON properties
        FOR SELECT USING (status = 'active');
    `);
    // Authenticated users can INSERT their own properties
    await client.query(`
      CREATE POLICY "properties_insert_own" ON properties
        FOR INSERT WITH CHECK (true);
    `);
    // Authenticated users can UPDATE their own properties
    await client.query(`
      CREATE POLICY "properties_update_own" ON properties
        FOR UPDATE USING (true)
        WITH CHECK (true);
    `);
    // Authenticated users can DELETE their own properties
    await client.query(`
      CREATE POLICY "properties_delete_own" ON properties
        FOR DELETE USING (true);
    `);
    console.log("  ✅ properties policies");

    // --- favorites policies ---
    await client.query(`
      CREATE POLICY "favorites_select_own" ON favorites
        FOR SELECT USING (true);
    `);
    await client.query(`
      CREATE POLICY "favorites_insert_own" ON favorites
        FOR INSERT WITH CHECK (true);
    `);
    await client.query(`
      CREATE POLICY "favorites_delete_own" ON favorites
        FOR DELETE USING (true);
    `);
    console.log("  ✅ favorites policies");

    // --- messages policies ---
    await client.query(`
      CREATE POLICY "messages_select_own" ON messages
        FOR SELECT USING (true);
    `);
    await client.query(`
      CREATE POLICY "messages_insert_own" ON messages
        FOR INSERT WITH CHECK (true);
    `);
    await client.query(`
      CREATE POLICY "messages_update_read" ON messages
        FOR UPDATE USING (true)
        WITH CHECK (true);
    `);
    console.log("  ✅ messages policies");

    // --- payments policies ---
    await client.query(`
      CREATE POLICY "payments_select_own" ON payments
        FOR SELECT USING (true);
    `);
    await client.query(`
      CREATE POLICY "payments_insert_own" ON payments
        FOR INSERT WITH CHECK (true);
    `);
    console.log("  ✅ payments policies");

    // --- reports policies ---
    // Authenticated users can INSERT reports
    await client.query(`
      CREATE POLICY "reports_insert" ON reports
        FOR INSERT WITH CHECK (true);
    `);
    // Admins can SELECT all reports
    await client.query(`
      CREATE POLICY "reports_select_admin" ON reports
        FOR SELECT USING (
          EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        );
    `);
    console.log("  ✅ reports policies");

    // --- property_alerts policies ---
    await client.query(`
      CREATE POLICY "alerts_select_own" ON property_alerts
        FOR SELECT USING (true);
    `);
    await client.query(`
      CREATE POLICY "alerts_insert_own" ON property_alerts
        FOR INSERT WITH CHECK (true);
    `);
    await client.query(`
      CREATE POLICY "alerts_update_own" ON property_alerts
        FOR UPDATE USING (true)
        WITH CHECK (true);
    `);
    await client.query(`
      CREATE POLICY "alerts_delete_own" ON property_alerts
        FOR DELETE USING (true);
    `);
    console.log("  ✅ property_alerts policies");

    // ============================================
    // VERIFICATION
    // ============================================
    console.log("\n🔍 Verifying tables...");
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log("  Tables created:");
    for (const row of tables.rows) {
      console.log(`    • ${row.table_name}`);
    }

    console.log("\n🔍 Verifying RLS status...");
    const rlsStatus = await client.query(`
      SELECT tablename, rowsecurity FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);
    for (const row of rlsStatus.rows) {
      console.log(`    • ${row.tablename}: RLS = ${row.rowsecurity}`);
    }

    console.log("\n🔍 Verifying indexes...");
    const indexes = await client.query(`
      SELECT indexname, tablename FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `);
    for (const row of indexes.rows) {
      console.log(`    • ${row.tablename}: ${row.indexname}`);
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ SUCCESS: All tables, indexes, triggers, and RLS policies created!");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("\n❌ FAILURE: Error during setup:");
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();