"use client";
import { useLayoutEffect } from "react";

/**
 *
 * @returns
 */
export default function Home() {
	useLayoutEffect(() => {
		location.replace("/login");
	});

	return <div></div>;
}

//   Todo: Handle by fetching from db.
