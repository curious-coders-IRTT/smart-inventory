import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const seedData = {
  antibiotics: [
    { drug_name: 'Amoxicillin', current_stock: 100 },
    { drug_name: 'Azithromycin', current_stock: 75 },
    { drug_name: 'Ciprofloxacin', current_stock: 50 },
    { drug_name: 'Doxycycline', current_stock: 80 },
    { drug_name: 'Penicillin', current_stock: 120 },
    { drug_name: 'Cephalexin', current_stock: 90 },
    { drug_name: 'Metronidazole', current_stock: 60 },
    { drug_name: 'Tetracycline', current_stock: 70 },
    { drug_name: 'Erythromycin', current_stock: 85 },
    { drug_name: 'Clarithromycin', current_stock: 65 }
  ],
  pain_medications: [
    { drug_name: 'Ibuprofen', current_stock: 150 },
    { drug_name: 'Paracetamol', current_stock: 200 },
    { drug_name: 'Aspirin', current_stock: 180 },
    { drug_name: 'Naproxen', current_stock: 100 },
    { drug_name: 'Diclofenac', current_stock: 90 },
    { drug_name: 'Tramadol', current_stock: 70 },
    { drug_name: 'Codeine', current_stock: 50 },
    { drug_name: 'Morphine', current_stock: 30 },
    { drug_name: 'Oxycodone', current_stock: 40 },
    { drug_name: 'Ketoprofen', current_stock: 85 }
  ],
  cardiovascular_drugs: [
    { drug_name: 'Amlodipine', current_stock: 120 },
    { drug_name: 'Lisinopril', current_stock: 100 },
    { drug_name: 'Metoprolol', current_stock: 90 },
    { drug_name: 'Atorvastatin', current_stock: 110 },
    { drug_name: 'Warfarin', current_stock: 70 },
    { drug_name: 'Clopidogrel', current_stock: 80 },
    { drug_name: 'Digoxin', current_stock: 60 },
    { drug_name: 'Furosemide', current_stock: 95 },
    { drug_name: 'Verapamil', current_stock: 75 },
    { drug_name: 'Losartan', current_stock: 85 }
  ],
  respiratory_drugs: [
    { drug_name: 'Salbutamol', current_stock: 150 },
    { drug_name: 'Fluticasone', current_stock: 100 },
    { drug_name: 'Montelukast', current_stock: 80 },
    { drug_name: 'Budesonide', current_stock: 90 },
    { drug_name: 'Ipratropium', current_stock: 70 },
    { drug_name: 'Theophylline', current_stock: 60 },
    { drug_name: 'Salmeterol', current_stock: 85 },
    { drug_name: 'Tiotropium', current_stock: 75 },
    { drug_name: 'Zafirlukast', current_stock: 65 },
    { drug_name: 'Terbutaline', current_stock: 95 }
  ]
};

export async function POST() {
  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Clear existing data
      await client.query('TRUNCATE antibiotics, pain_medications, cardiovascular_drugs, respiratory_drugs RESTART IDENTITY CASCADE');
      
      // Insert new data
      for (const [table, drugs] of Object.entries(seedData)) {
        for (const drug of drugs) {
          await client.query(
            `INSERT INTO ${table} (drug_name, current_stock) VALUES ($1, $2)`,
            [drug.drug_name, drug.current_stock]
          );
        }
      }
      
      await client.query('COMMIT');
      return NextResponse.json({ message: 'Database seeded successfully' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
} 