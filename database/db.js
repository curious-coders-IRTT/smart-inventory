const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Function to track stock movement
async function trackStockMovement(drugTable, drugId, movementType, quantity) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Insert movement record
        await client.query(
            'INSERT INTO stock_movements (drug_table, drug_id, movement_type, quantity) VALUES ($1, $2, $3, $4)',
            [drugTable, drugId, movementType, quantity]
        );

        // Update stock in respective table
        const updateQuery = `
            UPDATE ${drugTable} 
            SET current_stock = current_stock ${movementType === 'IN' ? '+' : '-'} $1,
                last_updated = CURRENT_TIMESTAMP
            WHERE id = $2
        `;
        await client.query(updateQuery, [quantity, drugId]);

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

// Function to get current stock
async function getCurrentStock(drugTable, drugId) {
    const result = await pool.query(
        `SELECT current_stock FROM ${drugTable} WHERE id = $1`,
        [drugId]
    );
    return result.rows[0]?.current_stock || 0;
}

// Function to get stock movement history
async function getStockMovementHistory(drugTable, drugId) {
    const result = await pool.query(
        `SELECT * FROM stock_movements 
         WHERE drug_table = $1 AND drug_id = $2 
         ORDER BY movement_date DESC`,
        [drugTable, drugId]
    );
    return result.rows;
}

module.exports = {
    pool,
    trackStockMovement,
    getCurrentStock,
    getStockMovementHistory
}; 