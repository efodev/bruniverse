import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

class Database {
	private pool: Pool;

	constructor() {
		this.pool = new Pool({
			host: process.env.DB_HOST || "localhost",
			port: parseInt(process.env.DB_PORT || "5432"),
			database: process.env.DB_NAME || "bruniversdb",
			user: process.env.DB_USER || "bruniverse",
			password: process.env.DB_PASSWORD || "",
			max: 20, // max connections in pool
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 2000,
		});
	}

	async query<T extends QueryResultRow = any>(
		text: string,
		params?: any[]
	): Promise<QueryResult<T>> {
		const client = await this.pool.connect();
		try {
			const result = await client.query(text, params);
			return result;
		} finally {
			client.release();
		}
	}

	async getClient(): Promise<PoolClient> {
		return await this.pool.connect();
	}

	async close(): Promise<void> {
		await this.pool.end();
	}
}

// Export a singleton instance
export const db = new Database();
