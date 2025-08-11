import jwt from "jsonwebtoken";

// Interfaces
interface UserData {
	id: string;
	email?: string;
	role?: string;
	// Add other user data fields as needed
}
// Helper function to parse user data from header
export function parseUserData(userDataHeader: string | null): UserData | null {
	if (!userDataHeader) return null;

	try {
		return JSON.parse(userDataHeader) as UserData;
	} catch (error) {
		console.error("Failed to parse user data from header:", error);
		return null;
	}
}

// Helper function to validate input
export function validateApiPostInput(body: any): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (!body.title || typeof body.title !== "string") {
		errors.push("Title is required and must be a string");
	} else if (body.title.trim().length === 0) {
		errors.push("Title cannot be empty");
	} else if (body.title.length > 50) {
		errors.push("Title must be 50 characters or less");
	}

	if (!body.content || typeof body.content !== "string") {
		errors.push("Content is required and must be a string");
	} else if (body.content.trim().length === 0) {
		errors.push("Content cannot be empty");
	}

	if (!body.categoryId || typeof body.categoryId !== "string") {
		errors.push("Category ID is required and must be a string");
	}

	if (typeof body.isAnonymous !== "boolean") {
		errors.push("is_anonymous must be a boolean");
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}

/**
 * Helper Function to parse jwt token and retreive user data
 * @param token
 * @returns  user data
 */
export function parseUserToken(token: string | null): UserData | null {
	if (!token) {
		return null;
	}
	try {
		const userData = jwt.verify(token, process.env.JWT_SECRET!, {
			issuer: "bruniverse",
		});
		return userData as UserData;
	} catch (error) {
		console.log(error);
		return null;
	}
}

export interface CreatePostRequest {
	title: string;
	content: string;
	categoryId: number;
	isAnonymous: boolean;
}