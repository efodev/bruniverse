// app/api/categories/route.ts (App Router)
import { NextResponse } from "next/server";
import db from "@/app/database/db";

const getCategoriesQuery = `
  SELECT 
    id,
    name,
    description,
    color_hex,
    is_active,
    created_at
  FROM categories 
  WHERE is_active = true
  ORDER BY name ASC;

`;

export async function GET() {
	try {
		const result = await db.query(getCategoriesQuery);
		const data = result.rows;
		console.log(result);
		if (!data) {
			return NextResponse.json(
				{
					success: false,
					error: "DATABASE_ERROR",
					message: "Failed to fetch categories",
				},
				{ status: 500 }
			);
		}

		const categories =
			data?.map((row: any) => ({
				id: row.id,
				name: row.name,
				description: row.description,
				colorHex: row.color_hex,
			})) || [];

		return NextResponse.json(
			{
				success: true,
				message: "Categories retrieved successfully",
				data: categories,
				count: categories.length,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Get categories error:", error);

		return NextResponse.json(
			{
				success: false,
				error: "INTERNAL_ERROR",
				message: "Internal server error",
			},
			{ status: 500 }
		);
	}
}
