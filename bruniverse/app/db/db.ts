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

		const result = await client.query(text, params);
		return result;
	}
	/**
	 * Create postgres transaction with a list of queries and parameters.
	 * @param queries list of queries
	 * @param parameters list of corresponding parameters to be bound to queries
	 * @param client pool client to query database
	 */
	async transact<T extends QueryResultRow = any>(
		queries: string[],
		parameters: any[],
		client: PoolClient
	): Promise<QueryResult<T>> {
		if (queries.length !== parameters.length) {
			throw new Error(
				"Array of queries must have the same the length as array of parametes"
			);
		}
		let result;
		await client.query("BEGIN");
		for (let i = 0; i < parameters.length; i++) {
			result = await client.query(queries[i], parameters[i]);
		}
		await client.query("COMMIT");
		return result!;
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
