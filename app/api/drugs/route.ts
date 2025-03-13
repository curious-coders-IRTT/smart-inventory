import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  try {
    const { drug_name, current_stock, branch } = await request.json();
    const tableName = `apollo_${branch}`;
    
    // Current timestamp will be used for both created_at and last_updated
    const now = new Date().toISOString();

    const query = `
      INSERT INTO ${tableName} (drug_name, current_stock, created_at, last_updated)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [drug_name, current_stock, now, now];
    
    const result = await pool.query(query, values);
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding stock:', error);
    return NextResponse.json(
      { error: 'Failed to add stock' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branch = searchParams.get('branch');
    
    if (!branch) {
      return NextResponse.json(
        { error: 'Branch parameter is required' },
        { status: 400 }
      );
    }

    const tableName = `apollo_${branch}`;
    const query = `SELECT * FROM ${tableName} ORDER BY id DESC`;
    
    const result = await pool.query(query);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching drugs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drugs' },
      { status: 500 }
    );
  }
} 