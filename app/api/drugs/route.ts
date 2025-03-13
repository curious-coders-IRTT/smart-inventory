import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

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
    const { rows } = await pool.query(
      `SELECT * FROM ${tableName} ORDER BY id ASC`
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drug inventory data' },
      { status: 500 }
    );
  }
} 