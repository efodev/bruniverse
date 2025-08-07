// Helper function to validate input
export function validatePostInput(body: any): {
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

	if (typeof body.is_anonymous !== "boolean") {
		errors.push("is_anonymous must be a boolean");
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}
