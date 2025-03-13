-- Create tables for different drug categories

-- Table 1: Antibiotics
CREATE TABLE IF NOT EXISTS antibiotics (
    id SERIAL PRIMARY KEY,
    drug_name VARCHAR(100) NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Pain Medications
CREATE TABLE IF NOT EXISTS pain_medications (
    id SERIAL PRIMARY KEY,
    drug_name VARCHAR(100) NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 3: Cardiovascular Drugs
CREATE TABLE IF NOT EXISTS cardiovascular_drugs (
    id SERIAL PRIMARY KEY,
    drug_name VARCHAR(100) NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 4: Respiratory Drugs
CREATE TABLE IF NOT EXISTS respiratory_drugs (
    id SERIAL PRIMARY KEY,
    drug_name VARCHAR(100) NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a stock movement tracking table
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    drug_table VARCHAR(50) NOT NULL,
    drug_id INTEGER NOT NULL,
    movement_type VARCHAR(10) NOT NULL, -- 'IN' or 'OUT'
    quantity INTEGER NOT NULL,
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for Antibiotics
INSERT INTO antibiotics (drug_name, current_stock) VALUES
    ('Amoxicillin', 100),
    ('Azithromycin', 75),
    ('Ciprofloxacin', 50),
    ('Doxycycline', 80),
    ('Penicillin', 120),
    ('Cephalexin', 90),
    ('Metronidazole', 60),
    ('Tetracycline', 70),
    ('Erythromycin', 85),
    ('Clarithromycin', 65);

-- Insert sample data for Pain Medications
INSERT INTO pain_medications (drug_name, current_stock) VALUES
    ('Ibuprofen', 150),
    ('Paracetamol', 200),
    ('Aspirin', 180),
    ('Naproxen', 100),
    ('Diclofenac', 90),
    ('Tramadol', 70),
    ('Codeine', 50),
    ('Morphine', 30),
    ('Oxycodone', 40),
    ('Ketoprofen', 85);

-- Insert sample data for Cardiovascular Drugs
INSERT INTO cardiovascular_drugs (drug_name, current_stock) VALUES
    ('Amlodipine', 120),
    ('Lisinopril', 100),
    ('Metoprolol', 90),
    ('Atorvastatin', 110),
    ('Warfarin', 70),
    ('Clopidogrel', 80),
    ('Digoxin', 60),
    ('Furosemide', 95),
    ('Verapamil', 75),
    ('Losartan', 85);

-- Insert sample data for Respiratory Drugs
INSERT INTO respiratory_drugs (drug_name, current_stock) VALUES
    ('Salbutamol', 150),
    ('Fluticasone', 100),
    ('Montelukast', 80),
    ('Budesonide', 90),
    ('Ipratropium', 70),
    ('Theophylline', 60),
    ('Salmeterol', 85),
    ('Tiotropium', 75),
    ('Zafirlukast', 65),
    ('Terbutaline', 95); 