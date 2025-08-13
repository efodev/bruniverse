/// @/app/post/layout.tsx

"use client";
import React from "react";

export default function PostLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col h-screen">
			<main className="flex-1 overflow-hidden">{children}</main>
		</div>
	);
}
