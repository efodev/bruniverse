"use client";
import Image from "next/image";
import { NavBar, PostNavigation } from "./ui/navigation";
import { MyUser } from "./ui/definitions";
import LoginPage from "./(auth)/login/page";
import { useLayoutEffect } from "react";

/**
 *
 * @returns
 */
export default function Home() {
	const bruno: MyUser = {
		username: "Bruno",
		email: "bruno@brown.edu",
		avatar: undefined,
	};
	useLayoutEffect(() => {
		location.replace("/login");
	});

	return <div></div>;
}

//   Todo: Handle by fetching from db.
