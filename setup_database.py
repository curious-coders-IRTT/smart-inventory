import psycopg2
from psycopg2.extras import execute_values

# Database connection parameters
DB_URL = "postgresql://neondb_owner:npg_fMTUxX9Rt8Ly@ep-calm-sound-a5vl6tgk-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Sample data for drugs
drugs = [
    # Antibiotics
    ('Amoxicillin', 100),
    ('Azithromycin', 75),
    ('Ciprofloxacin', 50),
    ('Doxycycline', 80),
    ('Penicillin', 120),
    ('Cephalexin', 90),
    ('Metronidazole', 60),
    ('Tetracycline', 70),
    ('Erythromycin', 85),
    ('Clarithromycin', 65),
    # Pain Medications
    ('Ibuprofen', 150),
    ('Paracetamol', 200),
    ('Aspirin', 180),
    ('Naproxen', 100),
    ('Diclofenac', 90),
    ('Tramadol', 70),
    ('Codeine', 50),
    ('Morphine', 30),
    ('Oxycodone', 40),
    ('Ketoprofen', 85),
    # Cardiovascular Drugs
    ('Amlodipine', 120),
    ('Lisinopril', 100),
    ('Metoprolol', 90),
    ('Atorvastatin', 110),
    ('Warfarin', 70),
    ('Clopidogrel', 80),
    ('Digoxin', 60),
    ('Furosemide', 95),
    ('Verapamil', 75),
    ('Losartan', 85),
    # Respiratory Drugs
    ('Salbutamol', 150),
    ('Fluticasone', 100),
    ('Montelukast', 80),
    ('Budesonide', 90),
    ('Ipratropium', 70),
    ('Theophylline', 60),
    ('Salmeterol', 85),
    ('Tiotropium', 75),
    ('Zafirlukast', 65),
    ('Terbutaline', 95)
]

# Hospital branches
branches = ['namakkal', 'erode', 'kovai', 'salem']

def create_tables(conn):
    with conn.cursor() as cur:
        # Create tables for each branch
        for branch in branches:
            table_name = f"apollo_{branch}"
            cur.execute(f'''
                CREATE TABLE IF NOT EXISTS {table_name} (
                    id SERIAL PRIMARY KEY,
                    drug_name VARCHAR(100) NOT NULL,
                    current_stock INTEGER NOT NULL DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
        
        # Create stock movements table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS stock_movements (
                id SERIAL PRIMARY KEY,
                branch VARCHAR(50) NOT NULL,
                drug_id INTEGER NOT NULL,
                movement_type VARCHAR(10) NOT NULL,
                quantity INTEGER NOT NULL,
                movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()

def seed_data(conn):
    with conn.cursor() as cur:
        # Clear existing data
        for branch in branches:
            table_name = f"apollo_{branch}"
            cur.execute(f'TRUNCATE TABLE {table_name} RESTART IDENTITY CASCADE')
        
        # Insert new data for each branch
        for branch in branches:
            table_name = f"apollo_{branch}"
            execute_values(
                cur,
                f'INSERT INTO {table_name} (drug_name, current_stock) VALUES %s',
                drugs
            )
        conn.commit()

def main():
    try:
        # Connect to the database
        conn = psycopg2.connect(DB_URL)
        print("Connected to database successfully")

        # Create tables
        create_tables(conn)
        print("Tables created successfully")

        # Seed data
        seed_data(conn)
        print("Data seeded successfully")

        conn.close()
        print("Database setup completed successfully")

    except Exception as e:
        print(f"Error: {e}")
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main() 