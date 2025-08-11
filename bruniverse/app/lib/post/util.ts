import { Draft } from "@/app/ui/definitions";
import { useCallback, useEffect, useState } from "react";

// Helper function to validate input
export function validatePostInput(body: any): {
	isValid: boolean;
	error: string;
} {
	const errors = [];

	if (!body.title) {
		errors.push("Title");
	}
	if (!body.categoryId) {
		errors.push("Category");
	} else if (!body.content) {
		errors.push("Content");
	}

	const error =
		errors.join(", ") + (errors.length <= 0 ? "is" : "are") + "required";
	return {
		isValid: errors.length === 0,
		error,
	};
}

// lib/api/drafts.ts

interface DraftData {
	title: string;
	content: string;
	categoryId: string;
	isAnonymous: boolean;
}

interface ApiResponse<T> {
	success: boolean;
	message?: string;
	data?: T;
	count?: number;
}

/**
 * Get all active drafts for the current user
 */
export async function getDrafts(): Promise<Draft[]> {
	try {
		const response = await fetch("/api/drafts", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"x-user-data": sessionStorage.getItem("user") as string,
				credentials: "include",
			},
		});

		const result: ApiResponse<Draft[]> = await response.json();

		if (!response.ok) {
			throw new Error(
				result.message || `HTTP error! status: ${response.status}`
			);
		}

		if (!result.success) {
			throw new Error(result.message || "Failed to fetch drafts");
		}

		return result.data || [];
	} catch (error) {
		console.error("Error fetching drafts:", error);
		throw error;
	}
}

/**
 * Create a new draft
 */
export async function saveDraft(draftData: DraftData): Promise<Draft> {
	try {
		const response = await fetch("/api/drafts", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-user-data": sessionStorage.getItem("user") as string,
			},
			body: JSON.stringify(draftData),
		});

		const result: ApiResponse<Draft> = await response.json();

		if (!response.ok) {
			throw new Error(
				result.message || `HTTP error! status: ${response.status}`
			);
		}

		if (!result.success) {
			throw new Error(result.message || "Failed to save draft");
		}

		if (!result.data) {
			throw new Error("No draft data returned");
		}

		return result.data;
	} catch (error) {
		console.error("Error saving draft:", error);
		throw error;
	}
}

/**
 * Get a single draft by ID (bonus function)
 */
export async function getDraftById(draftId: string): Promise<Draft> {
	try {
		const drafts = await getDrafts();
		const draft = drafts.find((d) => d.id === draftId);

		if (!draft) {
			throw new Error("Draft not found");
		}

		return draft;
	} catch (error) {
		console.error("Error fetching draft by ID:", error);
		throw new Error("Internal server error.");
	}
}

// Utility functions for maintaining consistency
export const draftConsistencyHelpers = {
	// Merge new draft with existing list while maintaining order
	mergeDraftIntoList: (drafts: Draft[], newDraft: Draft): Draft[] => {
		const existingIndex = drafts.findIndex((d) => d.id === newDraft.id);

		if (existingIndex >= 0) {
			// Update existing draft and move to top
			const updatedDrafts = [...drafts];
			updatedDrafts.splice(existingIndex, 1);
			return [newDraft, ...updatedDrafts];
		} else {
			// Add new draft to top
			return [newDraft, ...drafts];
		}
	},

	// Sort drafts consistently
	sortDrafts: (
		drafts: Draft[],
		sortBy: "date" | "title" | "updated" = "updated"
	): Draft[] => {
		return [...drafts].sort((a: Draft, b: Draft) => {
			switch (sortBy) {
				case "title":
					return a.title.localeCompare(b.title);
				case "date":
					return (
						new Date(b.date).getTime() - new Date(a.date).getTime()
					);
				case "updated":
				default:
					const aUpdated = a.updated || a.date;
					const bUpdated = b.updated || b.date;
					return (
						new Date(bUpdated).getTime() -
						new Date(aUpdated).getTime()
					);
			}
		});
	},

	// Filter drafts for search
	filterDrafts: (drafts: Draft[], query: string): Draft[] => {
		if (!query.trim()) return drafts;

		const searchTerm = query.toLowerCase();
		return drafts.filter(
			(draft) =>
				draft.title.toLowerCase().includes(searchTerm) ||
				draft.content.toLowerCase().includes(searchTerm) ||
				draft.category.name.toLowerCase().includes(searchTerm)
		);
	},
};

// Types for pagination
interface PaginatedDraftsResponse {
	drafts: Draft[];
	totalCount: number;
	hasMore: boolean;
	currentPage: number;
	totalPages: number;
}

interface DraftPaginationState {
	drafts: Draft[];
	currentPage: number;
	totalCount: number;
	hasMore: boolean;
	isLoading: boolean;
	error: string | null;
}

// API functions for paginated drafts
export const getDraftsPaginated = async (
	page: number = 1,
	limit: number = 10,
	sortBy: "date" | "title" | "updated" = "updated",
	sortOrder: "asc" | "desc" = "desc"
): Promise<PaginatedDraftsResponse> => {
	try {
		const response = await fetch(
			`/api/drafts?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
		);
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to fetch drafts");
		}

		const data = await response.json();
		// Transform backend response to frontend format
		return {
			drafts: data.data,
			totalCount: data.pagination.totalCount,
			hasMore: data.pagination.hasMore,
			currentPage: data.pagination.currentPage,
			totalPages: data.pagination.totalPages,
		};
	} catch (error) {
		console.error("Error fetching paginated drafts:", error);
		throw error;
	}
};

export const searchDrafts = async (
	query: string,
	page: number = 1,
	limit: number = 20,
	sortBy: "date" | "title" | "updated" = "updated",
	sortOrder: "asc" | "desc" = "desc"
): Promise<PaginatedDraftsResponse> => {
	try {
		const response = await fetch(
			`/api/drafts/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
		);
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to search drafts");
		}

		const data = await response.json();
		// Transform backend response to frontend format
		return {
			drafts: data.data,
			totalCount: data.pagination.totalCount,
			hasMore: data.pagination.hasMore,
			currentPage: data.pagination.currentPage,
			totalPages: data.pagination.totalPages,
		};
	} catch (error) {
		console.error("Error searching drafts:", error);
		throw error;
	}
};

// API functions for CRUD operations
export const createDraft = async (draft: {
	title: string;
	content: string;
	categoryId: number;
	isAnonymous: boolean;
}): Promise<Draft> => {
	try {
		const response = await fetch("/api/drafts", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(draft),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to create draft");
		}

		const data = await response.json();
		return data.data;
	} catch (error) {
		console.error("Error creating draft:", error);
		throw error;
	}
};

export const updateDraft = async (
	id: string,
	draft: {
		title: string;
		content: string;
		categoryId: string;
		isAnonymous: boolean;
	}
): Promise<Draft> => {
	try {
		const response = await fetch("/api/drafts", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id: parseInt(id), ...draft }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to update draft");
		}

		const data = await response.json();
		return data.data;
	} catch (error) {
		console.error("Error updating draft:", error);
		throw error;
	}
};

export const deleteDraft = async (id: string): Promise<void> => {
	try {
		const response = await fetch(`/api/drafts?id=${id}`, {
			method: "DELETE",
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to delete draft");
		}
	} catch (error) {
		console.error("Error deleting draft:", error);
		throw error;
	}
};

// Custom hook for draft pagination
export const useDraftPagination = (pageSize: number = 10) => {
	const [state, setState] = useState<DraftPaginationState>({
		drafts: [],
		currentPage: 1,
		totalCount: 0,
		hasMore: false,
		isLoading: false,
		error: null,
	});

	// Load initial drafts
	const loadDrafts = useCallback(
		async (page: number = 1, reset: boolean = false) => {
			setState((prev) => ({ ...prev, isLoading: true, error: null }));

			try {
				const response = await getDraftsPaginated(page, pageSize);

				setState((prev) => ({
					...prev,
					drafts: reset
						? response.drafts
						: [...prev.drafts, ...response.drafts],
					currentPage: response.currentPage,
					totalCount: response.totalCount,
					hasMore: response.hasMore,
					isLoading: false,
				}));
			} catch (error) {
				setState((prev) => ({
					...prev,
					error:
						error instanceof Error
							? error.message
							: "Failed to load drafts",
					isLoading: false,
				}));
			}
		},
		[pageSize]
	);

	// Load more drafts (for infinite scroll)
	const loadMore = useCallback(() => {
		if (!state.isLoading && state.hasMore) {
			loadDrafts(state.currentPage + 1, false);
		}
	}, [state.isLoading, state.hasMore, state.currentPage, loadDrafts]);

	// Refresh drafts (reload from beginning)
	const refresh = useCallback(() => {
		loadDrafts(1, true);
	}, [loadDrafts]);

	// Add a new draft to the top of the list
	const addDraft = useCallback((draft: Draft) => {
		setState((prev) => ({
			...prev,
			drafts: [draft, ...prev.drafts],
			totalCount: prev.totalCount + 1,
		}));
	}, []);

	// Update an existing draft
	const updateDraft = useCallback((updatedDraft: Draft) => {
		setState((prev) => ({
			...prev,
			drafts: prev.drafts
				.map((draft) =>
					draft.id === updatedDraft.id ? updatedDraft : draft
				)
				.sort(
					(a, b) =>
						new Date(b.updated || b.date).getTime() -
						new Date(a.updated || a.date).getTime()
				),
		}));
	}, []);

	// Remove a draft
	const removeDraft = useCallback((draftId: string) => {
		setState((prev) => ({
			...prev,
			drafts: prev.drafts.filter((draft) => draft.id !== draftId),
			totalCount: prev.totalCount - 1,
		}));
	}, []);

	// Search drafts
	const searchDraftsLocal = useCallback(
		async (query: string) => {
			if (!query.trim()) {
				refresh();
				return;
			}

			setState((prev) => ({ ...prev, isLoading: true, error: null }));

			try {
				const response = await searchDrafts(query, 1, pageSize * 3); // Load more results for search

				setState((prev) => ({
					...prev,
					drafts: response.drafts,
					currentPage: response.currentPage,
					totalCount: response.totalCount,
					hasMore: response.hasMore,
					isLoading: false,
				}));
			} catch (error) {
				setState((prev) => ({
					...prev,
					error:
						error instanceof Error
							? error.message
							: "Failed to search drafts",
					isLoading: false,
				}));
			}
		},
		[pageSize, refresh]
	);

	// Initialize on mount
	useEffect(() => {
		loadDrafts(1, true);
	}, [loadDrafts]);

	return {
		...state,
		loadMore,
		refresh,
		addDraft,
		updateDraft,
		removeDraft,
		searchDrafts: searchDraftsLocal,
	};
};

// POST UTILS
// Update your existing fetchPosts function
export const fetchPosts = async (
	page: number,
	category: string,
	search: string
) => {
	const params = new URLSearchParams({
		page: page.toString(),
		limit: "10",
		...(category !== "all" && { category }),
		...(search && { search }),
	});

	const response = await fetch(`/api/posts?${params}`, {
		headers: {
			"Content-Type": "application/json",
			"x-user-data": sessionStorage.getItem("user") as string,
			credentials: "include",
		},
	});

	return await response.json();
};

/**
 * Helper method to handle created post
 * @param post
 */
export const createPost = async (post: {}) => {
	const { isValid, error } = validatePostInput(post);
	if (!isValid) {
		return {
			success: false,
			error: "VALIDATION_ERROR",
			message: "Failed to create post.",
		};
	}
	try {
		const res = await fetch("/api/posts", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-user-data": sessionStorage.getItem("user") as string,
				credentials: "include",
			},
			body: JSON.stringify(post),
		});

		return await res.json();
	} catch (error) {
		console.log(error);
		return {
			success: false,
			error: "INTERNAL_ERROR",
			message: "Failed to create post.",
		};
	}
};

// /**
//  * Update an existing draft
//  */
// export async function updateDraft(
// 	draftId: number,
// 	draftData: DraftData
// ): Promise<Draft> {
// 	try {
// 		const response = await fetch("/api/drafts", {
// 			method: "PUT",
// 			headers: {
// 				"Content-Type": "application/json",
// 				"x-user-data": sessionStorage.getItem("user") as string,
// 				credentials: "include",
// 			},
// 			body: JSON.stringify({
// 				id: draftId,
// 				...draftData,
// 			}),
// 		});

// 		const result: ApiResponse<Draft> = await response.json();

// 		if (!response.ok) {
// 			throw new Error(
// 				result.message || `HTTP error! status: ${response.status}`
// 			);
// 		}

// 		if (!result.success) {
// 			throw new Error(result.message || "Failed to update draft");
// 		}

// 		if (!result.data) {
// 			throw new Error("No draft data returned");
// 		}

// 		return result.data;
// 	} catch (error) {
// 		console.error("Error updating draft:", error);
// 		throw error;
// 	}
// }

// /**
//  * Delete a draft
//  */
// export async function deleteDraft(draftId: number): Promise<void> {
// 	try {
// 		const response = await fetch(`/api/drafts?id=${draftId}`, {
// 			method: "DELETE",
// 			headers: {
// 				"Content-Type": "application/json",
// 				"x-user-data": sessionStorage.getItem("user") as string,
// 				credentials: "include",
// 			},
// 		});

// 		const result: ApiResponse<void> = await response.json();

// 		if (!response.ok) {
// 			throw new Error(
// 				result.message || `HTTP error! status: ${response.status}`
// 			);
// 		}

// 		if (!result.success) {
// 			throw new Error(result.message || "Failed to delete draft");
// 		}
// 	} catch (error) {
// 		console.error("Error deleting draft:", error);
// 		throw new Error("Internal server error.");
// 	}
// }

// /**
//  * Auto-save draft - creates new or updates existing
//  * This is a convenience function that decides whether to create or update
//  */
// export async function autoSaveDraft(
// 	draftData: DraftData,
// 	existingDraftId?: string | null
// ): Promise<Draft> {
// 	if (existingDraftId) {
// 		return updateDraft(existingDraftId, draftData);
// 	} else {
// 		return saveDraft(draftData);
// 	}
// }
