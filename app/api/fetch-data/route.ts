import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  try {
    const { tableName } = await request.json();

    if (tableName === 'all') {
      // Fetch data from all tables with branch information
      const tables = [
        { name: 'apollo_erode', display: 'Erode' },
        { name: 'apollo_kovai', display: 'Kovai' },
        { name: 'apollo_namakkal', display: 'Namakkal' },
        { name: 'apollo_salem', display: 'Salem' }
      ];

      const results = await Promise.all(
        tables.map(async (table) => {
          const result = await pool.query(`SELECT *, '${table.display}' as branch_name FROM ${table.name}`);
          return result.rows;
        })
      );
      return NextResponse.json(results.flat());
    } else {
      // Fetch data from specific table with branch information
      const branchName = tableName.replace('apollo_', '').charAt(0).toUpperCase() + 
                        tableName.replace('apollo_', '').slice(1);
      const result = await pool.query(`SELECT *, '${branchName}' as branch_name FROM ${tableName}`);
      return NextResponse.json(result.rows);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
} 