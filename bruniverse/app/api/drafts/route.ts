// // app/api/drafts/route.ts
// app/api/drafts/route.ts
import { NextRequest, NextResponse } from "next/server";
import db, { DatabaseError } from "@/app/database/db";
import { parseUserToken, CreatePostRequest } from "../lib";

interface UpdateDraftRequest {
	id: number;
	title: string;
	content: string;
	categoryId: number;
	isAnonymous: boolean;
}

interface PaginationParams {
	page: number;
	limit: number;
	sortBy: "date" | "title" | "updated";
	sortOrder: "asc" | "desc";
}

interface PaginatedResponse<T> {
	success: boolean;
	data: T[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalCount: number;
		hasMore: boolean;
		limit: number;
	};
	message?: string;
}

interface StandardResponse<T> {
	success: boolean;
	data?: T;
	message: string;
}

// Helper function to transform database row to Draft format
function transformDraftData(row: any) {
	return {
		id: row.id.toString(), // Ensure string ID for consistency
		title: row.title,
		date: row.date.toISOString().split("T")[0], // Format as YYYY-MM-DD
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
	};
}

// Helper function to parse pagination parameters
function parsePaginationParams(
	searchParams: URLSearchParams
): PaginationParams {
	const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
	const limit = Math.min(
		50,
		Math.max(1, parseInt(searchParams.get("limit") || "10"))
	); // Cap at 50
	const sortBy =
		(searchParams.get("sortBy") as "date" | "title" | "updated") ||
		"updated";
	const sortOrder =
		(searchParams.get("sortOrder") as "asc" | "desc") || "desc";

	return { page, limit, sortBy, sortOrder };
}

// Helper function to build ORDER BY clause
function buildOrderByClause(sortBy: string, sortOrder: string): string {
	const sortColumns = {
		date: "d.created_at",
		title: "d.title",
		updated: "d.updated_at",
	};

	const column =
		sortColumns[sortBy as keyof typeof sortColumns] || "d.updated_at";
	return `${column} ${sortOrder.toUpperCase()}`;
}

// GET /api/drafts - Get user's active drafts with pagination
export async function GET(request: NextRequest) {
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
		const { page, limit, sortBy, sortOrder } =
			parsePaginationParams(searchParams);
		const search = searchParams.get("search")?.trim() || "";

		// Build search condition
		let searchCondition = "";
		const searchParams_db = [user.id];

		if (search) {
			searchCondition = `AND (
				d.title ILIKE $${searchParams_db.length + 1} OR 
				d.content ILIKE $${searchParams_db.length + 1} OR 
				c.name ILIKE $${searchParams_db.length + 1}
			)`;
			searchParams_db.push(`%${search}%`);
		}

		// Get total count for pagination
		const countQuery = `
			SELECT COUNT(*) as total
			FROM drafts d
			JOIN categories c ON d.category_id = c.id
			WHERE d.user_id = $1 AND d.status = 'active' ${searchCondition}
		`;

		const countResult = await db.query(countQuery, searchParams_db);
		const totalCount = parseInt(countResult.rows[0].total);
		const totalPages = Math.ceil(totalCount / limit);
		const offset = (page - 1) * limit;

		// Get paginated drafts with category information
		const query = `
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
				c.name as category_name
			FROM drafts d
			JOIN categories c ON d.category_id = c.id
			WHERE d.user_id = $1 AND d.status = 'active' ${searchCondition}
			ORDER BY ${buildOrderByClause(sortBy, sortOrder)}
			LIMIT $${searchParams_db.length + 1} OFFSET $${searchParams_db.length + 2}
		`;

		searchParams_db.push(limit.toString(), offset.toString());
		const result = await db.query(query, searchParams_db);

		// Transform the data
		const transformedData = result.rows.map(transformDraftData);

		const response: PaginatedResponse<any> = {
			success: true,
			data: transformedData,
			pagination: {
				currentPage: page,
				totalPages,
				totalCount,
				hasMore: page < totalPages,
				limit,
			},
		};

		if (search) {
			response.message = `Found ${totalCount} draft${totalCount !== 1 ? "s" : ""} matching "${search}"`;
		}

		return NextResponse.json(response);
	} catch (error) {
		console.error("Error fetching drafts:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to fetch drafts" },
			{ status: 500 }
		);
	}
}

// POST /api/drafts - Create a new draft
export async function POST(request: NextRequest) {
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

		// Parse request body
		const body: CreatePostRequest = await request.json();
		const { title, content, categoryId, isAnonymous } = body;

		// Validate required fields
		if (!title?.trim() || !content?.trim() || !categoryId) {
			return NextResponse.json(
				{
					success: false,
					message: "Title, content, and category are required",
				},
				{ status: 400 }
			);
		}

		// Validate category exists
		const categoryCheck = await db.query(
			"SELECT id, name FROM categories WHERE id = $1",
			[categoryId]
		);

		if (categoryCheck.rows.length === 0) {
			return NextResponse.json(
				{ success: false, message: "Invalid category selected" },
				{ status: 400 }
			);
		}

		// Create new draft with category information
		const insertQuery = `
			WITH new_draft AS (
				INSERT INTO drafts (user_id, title, content, category_id, is_anonymous, status)
				VALUES ($1, $2, $3, $4, $5, 'active')
				RETURNING id, user_id, title, content, category_id, is_anonymous, 
						  auto_save_count, created_at, updated_at, last_accessed_at
			)
			SELECT 
				nd.id,
				nd.title,
				nd.content,
				nd.created_at as date,
				nd.updated_at,
				nd.is_anonymous,
				nd.auto_save_count,
				nd.created_at,
				nd.last_accessed_at,
				c.id as category_id,
				c.name as category_name
			FROM new_draft nd
			JOIN categories c ON nd.category_id = c.id
		`;

		const result = await db.query(insertQuery, [
			user.id,
			title.trim(),
			content.trim(),
			categoryId,
			Boolean(isAnonymous),
		]);

		const transformedData = transformDraftData(result.rows[0]);

		const response: StandardResponse<any> = {
			success: true,
			data: transformedData,
			message: "Draft saved successfully",
		};

		return NextResponse.json(response, { status: 201 });
	} catch (error) {
		console.error("Error creating draft:", error);

		// Handle specific database errors
		if (error instanceof DatabaseError) {
			if (error.code === "23505") {
				return NextResponse.json(
					{
						success: false,
						message: "A draft with this content already exists",
					},
					{ status: 409 }
				);
			}
			if (error.code === "23503") {
				return NextResponse.json(
					{
						success: false,
						message: "Invalid category or user reference",
					},
					{ status: 400 }
				);
			}
		}

		return NextResponse.json(
			{ success: false, message: "Failed to save draft" },
			{ status: 500 }
		);
	}
}

// PUT /api/drafts - Update existing draft
export async function PUT(request: NextRequest) {
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

		// Parse request body
		const body: UpdateDraftRequest = await request.json();
		const { id, title, content, categoryId, isAnonymous } = body;

		// Validate required fields
		if (!id || !title?.trim() || !content?.trim() || !categoryId) {
			return NextResponse.json(
				{
					success: false,
					message:
						"Draft ID, title, content, and category are required",
				},
				{ status: 400 }
			);
		}

		// Validate category exists
		const categoryCheck = await db.query(
			"SELECT id, name FROM categories WHERE id = $1",
			[categoryId]
		);

		if (categoryCheck.rows.length === 0) {
			return NextResponse.json(
				{ success: false, message: "Invalid category selected" },
				{ status: 400 }
			);
		}

		// Update existing draft with optimistic locking (check if still active)
		const updateQuery = `
			WITH updated_draft AS (
				UPDATE drafts 
				SET 
					title = $2, 
					content = $3, 
					category_id = $4, 
					is_anonymous = $5,
					auto_save_count = COALESCE(auto_save_count, 0) + 1,
					updated_at = CURRENT_TIMESTAMP,
					last_accessed_at = CURRENT_TIMESTAMP
				WHERE id = $1 AND user_id = $6 AND status = 'active'
				RETURNING id, user_id, title, content, category_id, is_anonymous, 
						  auto_save_count, created_at, updated_at, last_accessed_at
			)
			SELECT 
				ud.id,
				ud.title,
				ud.content,
				ud.created_at as date,
				ud.updated_at,
				ud.is_anonymous,
				ud.auto_save_count,
				ud.created_at,
				ud.last_accessed_at,
				c.id as category_id,
				c.name as category_name
			FROM updated_draft ud
			JOIN categories c ON ud.category_id = c.id
		`;

		const result = await db.query(updateQuery, [
			id,
			title.trim(),
			content.trim(),
			categoryId,
			Boolean(isAnonymous),
			user.id,
		]);

		// Check if draft was found and updated
		if (result.rows.length === 0) {
			return NextResponse.json(
				{
					success: false,
					message:
						"Draft not found or you do not have permission to edit it",
				},
				{ status: 404 }
			);
		}

		const transformedData = transformDraftData(result.rows[0]);

		const response: StandardResponse<any> = {
			success: true,
			data: transformedData,
			message: "Draft updated successfully",
		};

		return NextResponse.json(response);
	} catch (error) {
		console.error("Error updating draft:", error);

		// Handle specific database errors
		if (error instanceof DatabaseError && error.code === "23503") {
			return NextResponse.json(
				{ success: false, message: "Invalid category reference" },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ success: false, message: "Failed to update draft" },
			{ status: 500 }
		);
	}
}

// DELETE /api/drafts - Delete a draft
export async function DELETE(request: NextRequest) {
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

		// Get draft ID from URL search params or request body
		const { searchParams } = new URL(request.url);
		let draftId = searchParams.get("id");

		// If not in URL, try request body (for flexibility)
		if (!draftId) {
			try {
				const body = await request.json();
				draftId = body.id;
			} catch {
				// Body parsing failed, continue with null draftId
			}
		}

		if (!draftId) {
			return NextResponse.json(
				{ success: false, message: "Draft ID is required" },
				{ status: 400 }
			);
		}

		// Soft delete by updating status to 'deleted'
		const deleteQuery = `
			UPDATE drafts 
			SET 
				status = 'deleted',
				updated_at = CURRENT_TIMESTAMP
			WHERE id = $1 AND user_id = $2 AND status = 'active'
			RETURNING id, title
		`;

		const result = await db.query(deleteQuery, [draftId, user.id]);

		if (result.rows.length === 0) {
			return NextResponse.json(
				{
					success: false,
					message: "Draft not found or already deleted",
				},
				{ status: 404 }
			);
		}

		const response: StandardResponse<any> = {
			success: true,
			data: { id: result.rows[0].id },
			message: `Draft "${result.rows[0].title}" deleted successfully`,
		};

		return NextResponse.json(response);
	} catch (error) {
		console.error("Error deleting draft:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to delete draft" },
			{ status: 500 }
		);
	}
}

// import { NextRequest, NextResponse } from "next/server";
// import db, { DatabaseError } from "@/app/database/db";
// import { parseUserToken, validateApiPostInput } from "../lib";

// interface CreatePostRequest {
// 	title: string;
// 	content: string;
// 	categoryId: number;
// 	isAnonymous: boolean;
// }

// interface UpdateDraftRequest {
// 	id: number;
// 	title: string;
// 	content: string;
// 	categoryId: number;
// 	isAnonymous: boolean;
// }

// // GET /api/drafts - Get user's active drafts
// export async function GET(request: NextRequest) {
// 	try {
// 		// Get authenticated user
// 		const token = request.cookies.get("token")?.value;
// 		const user = parseUserToken(token!);
// 		if (!user) {
// 			return NextResponse.json(
// 				{ success: false, message: "Authentication required" },
// 				{ status: 401 }
// 			);
// 		}

// 		// Get user's active drafts with category information
// 		const query = `
//       SELECT
//         d.id,
//         d.title,
//         d.content,
//         d.updated_at as date,
//         d.is_anonymous,
//         d.auto_save_count,
//         d.created_at,
//         d.last_accessed_at,
//         c.id as category_id,
//         c.name as category_name
//       FROM drafts d
//       JOIN categories c ON d.category_id = c.id
//       WHERE d.user_id = $1 AND d.status = 'active'
//       ORDER BY d.updated_at DESC
//     `;

// 		const result = await db.query(query, [user.id]);

// 		// Transform the data to match the required format
// 		const transformedData = result.rows.map((row) => ({
// 			id: row.id,
// 			title: row.title,
// 			date: row.date.toISOString().split("T")[0], // Format as YYYY-MM-DD
// 			content: row.content,
// 			category: {
// 				id: row.category_id,
// 				name: row.category_name,
// 			},
// 			// Include additional fields for completeness
// 			is_anonymous: row.is_anonymous,
// 			auto_save_count: row.auto_save_count,
// 			created_at: row.created_at,
// 			last_accessed_at: row.last_accessed_at,
// 		}));

// 		return NextResponse.json({
// 			success: true,
// 			data: transformedData,
// 			count: transformedData.length,
// 		});
// 	} catch (error) {
// 		console.error("Error fetching drafts:", error);
// 		return NextResponse.json(
// 			{ success: false, message: "Failed to fetch drafts" },
// 			{ status: 500 }
// 		);
// 	}
// }

// // POST /api/drafts - Auto-save a new draft
// export async function POST(request: NextRequest) {
// 	try {
// 		// Get authenticated user
// 		const token = request.cookies.get("token")?.value;
// 		const user = parseUserToken(token!);
// 		if (!user) {
// 			return NextResponse.json(
// 				{ success: false, message: "Authentication required" },
// 				{ status: 401 }
// 			);
// 		}

// 		// Parse request body
// 		const body: CreatePostRequest = await request.json();
// 		console.log("body ", body);
// 		const { title, content, categoryId, isAnonymous } = body;
// 		// Validate required fields
// 		if (!title || !content || !categoryId) {
// 			return NextResponse.json(
// 				{
// 					success: false,
// 					message: "Title, content, and category are required",
// 				},
// 				{ status: 400 }
// 			);
// 		}

// 		// Validate category exists (optional but recommended)
// 		const categoryCheck = await db.query(
// 			"SELECT id FROM categories WHERE id = $1",
// 			[categoryId]
// 		);

// 		if (categoryCheck.rows.length === 0) {
// 			return NextResponse.json(
// 				{ success: false, message: "Invalid category" },
// 				{ status: 400 }
// 			);
// 		}

// 		// Auto-save draft - insert new draft with category information
// 		const insertQuery = `
//       WITH new_draft AS (
//         INSERT INTO drafts (user_id, title, content, category_id, is_anonymous)
//         VALUES ($1, $2, $3, $4, $5)
//         RETURNING id, user_id, title, content, category_id, is_anonymous,
//                   auto_save_count, created_at, updated_at, last_accessed_at
//       )
//       SELECT
//         nd.id,
//         nd.title,
//         nd.content,
//         nd.updated_at as date,
//         nd.is_anonymous,
//         nd.auto_save_count,
//         nd.created_at,
//         nd.last_accessed_at,
//         c.id as category_id,
//         c.name as category_name
//       FROM new_draft nd
//       JOIN categories c ON nd.category_id = c.id
//     `;

// 		const result = await db.query(insertQuery, [
// 			user.id,
// 			title,
// 			content,
// 			categoryId,
// 			isAnonymous || false,
// 		]);

// 		// Transform to match getDrafts format
// 		const transformedData = {
// 			id: result.rows[0].id,
// 			title: result.rows[0].title,
// 			date: result.rows[0].date.toISOString().split("T")[0],
// 			content: result.rows[0].content,
// 			category: {
// 				id: result.rows[0].category_id,
// 				name: result.rows[0].category_name,
// 			},
// 			is_anonymous: result.rows[0].is_anonymous,
// 			auto_save_count: result.rows[0].auto_save_count,
// 			created_at: result.rows[0].created_at,
// 			last_accessed_at: result.rows[0].last_accessed_at,
// 		};

// 		return NextResponse.json({
// 			success: true,
// 			message: "Draft saved successfully",
// 			data: transformedData,
// 		});
// 	} catch (error) {
// 		console.error("Error creating draft:", error);

// 		// Handle unique constraint violations or other specific errors
// 		if (error instanceof DatabaseError && error.code === "23505") {
// 			// Unique constraint violation
// 			return NextResponse.json(
// 				{ success: false, message: "Draft already exists" },
// 				{ status: 409 }
// 			);
// 		}

// 		return NextResponse.json(
// 			{ success: false, message: "Failed to save draft" },
// 			{ status: 500 }
// 		);
// 	}
// }

// // PUT /api/drafts - Update existing draft
// export async function PUT(request: NextRequest) {
// 	try {
// 		// Get authenticated user
// 		const token = request.cookies.get("token")?.value;
// 		const user = parseUserToken(token!);
// 		if (!user) {
// 			return NextResponse.json(
// 				{ success: false, message: "Authentication required" },
// 				{ status: 401 }
// 			);
// 		}

// 		// Parse request body
// 		const body: UpdateDraftRequest = await request.json();
// 		const { id, title, content, categoryId, isAnonymous } = body;

// 		// Validate required fields
// 		if (!id || !title || !content || !categoryId) {
// 			return NextResponse.json(
// 				{
// 					success: false,
// 					message:
// 						"Draft ID, title, content, and category are required",
// 				},
// 				{ status: 400 }
// 			);
// 		}

// 		// Validate category exists (optional but recommended)
// 		const categoryCheck = await db.query(
// 			"SELECT id FROM categories WHERE id = $1",
// 			[categoryId]
// 		);

// 		if (categoryCheck.rows.length === 0) {
// 			return NextResponse.json(
// 				{ success: false, message: "Invalid category" },
// 				{ status: 400 }
// 			);
// 		}

// 		// Update existing draft with category information
// 		const updateQuery = `
//       WITH updated_draft AS (
//         UPDATE drafts
//         SET
//           title = $2,
//           content = $3,
//           category_id = $4,
//           is_anonymous = $5,
//           auto_save_count = auto_save_count + 1,
//           updated_at = CURRENT_TIMESTAMP,
//           last_accessed_at = CURRENT_TIMESTAMP
//         WHERE id = $1 AND user_id = $6 AND status = 'active'
//         RETURNING id, user_id, title, content, category_id, is_anonymous,
//                   auto_save_count, created_at, updated_at, last_accessed_at
//       )
//       SELECT
//         ud.id,
//         ud.title,
//         ud.content,
//         ud.updated_at as date,
//         ud.is_anonymous,
//         ud.auto_save_count,
//         ud.created_at,
//         ud.last_accessed_at,
//         c.id as category_id,
//         c.name as category_name
//       FROM updated_draft ud
//       JOIN categories c ON ud.category_id = c.id
//     `;

// 		const result = await db.query(updateQuery, [
// 			id,
// 			title,
// 			content,
// 			categoryId,
// 			isAnonymous || false,
// 			user.id,
// 		]);

// 		// Check if draft was found and updated
// 		if (result.rows.length === 0) {
// 			return NextResponse.json(
// 				{
// 					success: false,
// 					message:
// 						"Draft not found or you do not have permission to edit it",
// 				},
// 				{ status: 404 }
// 			);
// 		}

// 		// Transform to match getDrafts format
// 		const transformedData = {
// 			id: result.rows[0].id,
// 			title: result.rows[0].title,
// 			date: result.rows[0].date.toISOString().split("T")[0],
// 			content: result.rows[0].content,
// 			category: {
// 				id: result.rows[0].category_id,
// 				name: result.rows[0].category_name,
// 			},
// 			is_anonymous: result.rows[0].is_anonymous,
// 			auto_save_count: result.rows[0].auto_save_count,
// 			created_at: result.rows[0].created_at,
// 			last_accessed_at: result.rows[0].last_accessed_at,
// 		};

// 		return NextResponse.json({
// 			success: true,
// 			message: "Draft updated successfully",
// 			data: transformedData,
// 		});
// 	} catch (error) {
// 		console.error("Error updating draft:", error);
// 		return NextResponse.json(
// 			{ success: false, message: "Failed to update draft" },
// 			{ status: 500 }
// 		);
// 	}
// }

// // DELETE /api/drafts - Delete a draft (bonus functionality)
// export async function DELETE(request: NextRequest) {
// 	try {
// 		// Get authenticated user
// 		const token = request.cookies.get("token")?.value;
// 		const user = parseUserToken(token!);
// 		if (!user) {
// 			return NextResponse.json(
// 				{ success: false, message: "Authentication required" },
// 				{ status: 401 }
// 			);
// 		}

// 		// Get draft ID from URL search params
// 		const { searchParams } = new URL(request.url);
// 		const draftId = searchParams.get("id");

// 		if (!draftId) {
// 			return NextResponse.json(
// 				{ success: false, message: "Draft ID is required" },
// 				{ status: 400 }
// 			);
// 		}

// 		// Soft delete by updating status to 'deleted'
// 		const deleteQuery = `
//       UPDATE drafts
//       SET
//         status = 'deleted',
//         updated_at = CURRENT_TIMESTAMP
//       WHERE id = $1 AND user_id = $2 AND status = 'active'
//       RETURNING id
//     `;

// 		const result = await db.query(deleteQuery, [draftId, user.id]);

// 		if (result.rows.length === 0) {
// 			return NextResponse.json(
// 				{
// 					success: false,
// 					message: "Draft not found or already deleted",
// 				},
// 				{ status: 404 }
// 			);
// 		}

// 		return NextResponse.json({
// 			success: true,
// 			message: "Draft deleted successfully",
// 		});
// 	} catch (error) {
// 		console.error("Error deleting draft:", error);
// 		return NextResponse.json(
// 			{ success: false, message: "Failed to delete draft" },
// 			{ status: 500 }
// 		);
// 	}
// }
