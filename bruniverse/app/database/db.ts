import { stat } from "fs";
import {
	Pool,
	PoolClient,
	QueryResult,
	QueryResultRow,
	DatabaseError,
} from "pg";
export { DatabaseError };

class Database {
	private static instance: Database;
	private pool: Pool | null = null;
	private isConnected: boolean = false;

	private constructor() {
		// Private constructor to prevent direct instantiation
	}

	/**
	 * Get the singleton instance of Database
	 */
	static getInstance(): Database {
		if (!Database.instance) {
			Database.instance = new Database();
		}
		return Database.instance;
	}

	/**
	 * Initialize the database pool if not already connected
	 */
	private initializePool(): void {
		if (!this.pool) {
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

			// Set up pool event handlers
			this.pool.on("connect", () => {
				this.isConnected = true;
			});

			this.pool.on("error", (err) => {
				console.error("Database pool error:", err);
				this.isConnected = false;
			});
		}
	}

	/**
	 * Check if there's an active pool connection
	 */
	isPoolConnected(): boolean {
		return this.isConnected && this.pool !== null;
	}

	async query<T extends QueryResultRow = any>(
		text: string,
		params?: any[]
	): Promise<QueryResult<T>> {
		if (!this.isPoolConnected()) {
			this.initializePool();
		}

		const client = await this.pool!.connect();
		try {
			const result = await client.query(text, params);
			return result;
		} finally {
			client.release(); // Always release the client back to the pool
		}
	}

	/**
	 * Create postgres transaction with a list of queries and parameters.
	 * @param queries list of queries
	 * @param parameters list of corresponding parameters to be bound to queries
	 */
	async transact<T extends QueryResultRow = any>(
		queries: string[],
		parameters: any[]
	): Promise<QueryResult<T>> {
		if (queries.length !== parameters.length) {
			throw new Error(
				"Array of queries must have the same length as array of parameters"
			);
		}

		const client = await this.getClient();
		let result: QueryResult<T>;

		try {
			await client.query("BEGIN");

			for (let i = 0; i < parameters.length; i++) {
				result = await client.query(queries[i], parameters[i]);
			}

			await client.query("COMMIT");
			return result!;
		} catch (error) {
			await client.query("ROLLBACK");
			throw error;
		} finally {
			client.release();
		}
	}

	/**
	 * Get a client from the pool (singleton pattern - only creates pool if needed)
	 */
	async getClient(): Promise<PoolClient> {
		if (!this.isPoolConnected()) {
			this.initializePool();
		}
		return await this.pool!.connect();
	}

	/**
	 * Close the database pool
	 */
	async close(): Promise<void> {
		if (this.pool) {
			await this.pool.end();
			this.pool = null;
			this.isConnected = false;
			console.log("Database pool closed");
		}
	}

	/**
	 * Get pool stats for monitoring
	 */
	getPoolStats() {
		if (!this.pool) {
			return null;
		}
		return {
			totalCount: this.pool.totalCount,
			idleCount: this.pool.idleCount,
			waitingCount: this.pool.waitingCount,
		};
	}
}

// Export singleton instance
export default Database.getInstance();

// Centralized database error handler
// TODO: Have centralized message for all errors
export function handleDatabaseError(
	error: DatabaseError,
	token: string | null = null
) {
	const logContext = {
		code: error.code,
		message: error.message,
		severity: error.severity,
		contraint: error.constraint,
		token: token ? token.substring(0, 8) + "..." : "null",
	};

	switch (error.code) {
		case "23505": // Unique violation
			console.warn("Duplicate detected for unique field:", logContext);
			return {
				success: false,
				error: "DUPLICATE_ERROR",
				constraint: error.constraint,
				status: 409, // Conflict
			};

		case "23503": // Foreign key violation
			console.warn("Reference error in table:", logContext);
			return {
				success: false,
				error: "REFERENCE_ERROR",
				constraint: error.constraint,
				status: 400, // Bad Request
			};

		case "40001": // Serialization failure
		case "40P01": // Deadlock detected
			console.warn("Concurrent access issue:", logContext);
			return {
				success: false,
				error: "CONCURRENT_ACCESS",
				constraint: error.constraint,
				retryable: true,
				status: 409, // Conflict
			};

		case "42P01": // Undefined table
		case "42703": // Undefined column
			console.error("Schema error:", logContext);
			return {
				success: false,
				error: "SCHEMA_ERROR",
				constraint: error.constraint,
				status: 500, // Internal Server Error
			};

		case "53300": // Too many connections
			console.error("Connection limit reached:", logContext);
			return {
				success: false,
				error: "CONNECTION_LIMIT",
				constraint: error.constraint,
				retryable: true,
				status: 503, // Service Unavailable
			};

		default:
			console.error("Unhandled database error:", logContext);
			return {
				success: false,
				error: "DATABASE_ERROR",
				constraint: error.constraint,
				status: 500, // Internal Server Error
			};
	}
}
