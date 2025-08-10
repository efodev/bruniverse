// app/api/drafts/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/app/database/db";
import { parseUserToken } from "../../lib";

interface PaginationParams {
	page: number;
	limit: number;
	sortBy: "date" | "title" | "updated";
	sortOrder: "asc" | "desc";
}

interface SearchPaginatedResponse<T> {
	success: boolean;
	data: T[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalCount: number;
		hasMore: boolean;
		limit: number;
	};
	searchQuery: string;
	message?: string;
}

// Helper function to transform database row to Draft format
function transformDraftData(row: any) {
	return {
		id: row.id.toString(),
		title: row.title,
		date: row.date.toISOString().split("T")[0],
		updated:
			row.updated_at?.toISOString().split("T")[0] ||
			row.date.toISOString().split("T")[0],
		content: row.content,
		category: {
			id: row.category_id.toString(),
			name: row.category_name,
		},
		is_anonymous: row.is_anonymous,
		auto_save_count: row.auto_save_count || 0,
		created_at: row.created_at,
		last_accessed_at: row.last_accessed_at,
		// Add relevance score for search results
		relevance: row.relevance || 0,
	};
}

// Helper function to parse pagination parameters
function parsePaginationParams(
	searchParams: URLSearchParams
): PaginationParams {
	const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
	const limit = Math.min(
		50,
		Math.max(1, parseInt(searchParams.get("limit") || "20"))
	); // Higher default for search
	const sortBy =
		(searchParams.get("sortBy") as "date" | "title" | "updated") ||
		"updated";
	const sortOrder =
		(searchParams.get("sortOrder") as "asc" | "desc") || "desc";

	return { page, limit, sortBy, sortOrder };
}

// Helper function to build search conditions with ranking
function buildSearchQuery(searchTerm: string): {
	condition: string;
	rankingSelect: string;
} {
	if (!searchTerm.trim()) {
		return {
			condition: "",
			rankingSelect: "0 as relevance",
		};
	}

	// Full-text search with ranking
	const condition = `AND (
		d.title ILIKE $2 OR 
		d.content ILIKE $2 OR 
		c.name ILIKE $2 OR
		to_tsvector('english', d.title || ' ' || d.content) @@ plainto_tsquery('english', $3)
	)`;

	const rankingSelect = `(
		CASE 
			WHEN d.title ILIKE $2 THEN 3
			WHEN c.name ILIKE $2 THEN 2
			WHEN d.content ILIKE $2 THEN 1
			ELSE ts_rank(to_tsvector('english', d.title || ' ' || d.content), plainto_tsquery('english', $3))
		END
	) as relevance`;

	return { condition, rankingSelect };
}

// GET /api/drafts/search - Search user's drafts with enhanced features
export async function GET(request: NextRequest) {
	let query;
	try {
		// Get authenticated user
		const token = request.cookies.get("token")?.value;
		const user = parseUserToken(token!);
		if (!user) {
			return NextResponse.json(
				{ success: false, message: "Authentication required" },
				{ status: 401 }
			);
		}

		const { searchParams } = new URL(request.url);
		query = searchParams.get("q")?.trim() || "";
		const { page, limit, sortBy, sortOrder } =
			parsePaginationParams(searchParams);

		// If no search query, return empty results
		if (!query) {
			return NextResponse.json({
				success: true,
				data: [],
				pagination: {
					currentPage: 1,
					totalPages: 0,
					totalCount: 0,
					hasMore: false,
					limit,
				},
				searchQuery: "",
				message: "Please provide a search query",
			});
		}

		const { condition, rankingSelect } = buildSearchQuery(query);
		const searchPattern = `%${query}%`;

		// Get total count for pagination
		const countQuery = `
			SELECT COUNT(*) as total
			FROM drafts d
			JOIN categories c ON d.category_id = c.id
			WHERE d.user_id = $1 AND d.status = 'active' ${condition}
		`;

		const countParams = [user.id, searchPattern, query];
		const countResult = await db.query(countQuery, countParams);
		const totalCount = parseInt(countResult.rows[0].total);
		const totalPages = Math.ceil(totalCount / limit);
		const offset = (page - 1) * limit;

		// Build ORDER BY clause with relevance
		let orderByClause = "";
		if (sortBy === "updated") {
			orderByClause = `relevance DESC, d.updated_at ${sortOrder.toUpperCase()}`;
		} else if (sortBy === "date") {
			orderByClause = `relevance DESC, d.created_at ${sortOrder.toUpperCase()}`;
		} else if (sortBy === "title") {
			orderByClause = `relevance DESC, d.title ${sortOrder.toUpperCase()}`;
		} else {
			orderByClause = `relevance DESC, d.updated_at DESC`;
		}

		// Get paginated search results with relevance ranking
		const searchQuery = `
			SELECT 
				d.id, 
				d.title, 
				d.content,
				d.created_at as date,
				d.updated_at,
				d.is_anonymous,
				d.auto_save_count,
				d.created_at,
				d.last_accessed_at,
				c.id as category_id,
				c.name as category_name,
				${rankingSelect}
			FROM drafts d
			JOIN categories c ON d.category_id = c.id
			WHERE d.user_id = $1 AND d.status = 'active' ${condition}
			ORDER BY ${orderByClause}
			LIMIT $4 OFFSET $5
		`;

		const searchQueryParams = [
			user.id,
			searchPattern,
			query,
			limit,
			offset,
		];
		const result = await db.query(searchQuery, searchQueryParams);

		// Transform the data
		const transformedData = result.rows.map(transformDraftData);

		const response: SearchPaginatedResponse<any> = {
			success: true,
			data: transformedData,
			pagination: {
				currentPage: page,
				totalPages,
				totalCount,
				hasMore: page < totalPages,
				limit,
			},
			searchQuery: query,
			message:
				totalCount > 0
					? `Found ${totalCount} draft${totalCount !== 1 ? "s" : ""} matching "${query}"`
					: `No drafts found matching "${query}"`,
		};

		return NextResponse.json(response);
	} catch (error) {
		console.error("Error searching drafts:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to search drafts",
				searchQuery: query,
			},
			{ status: 500 }
		);
	}
}
