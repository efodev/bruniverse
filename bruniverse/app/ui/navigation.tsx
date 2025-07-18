/// app/ui/navigation
"use client";

import React, { useState, useEffect } from "react";
import {
	Menu,
	X,
	Home,
	User,
	Settings,
	ChevronDown,
	Search,
	Bell,
	Moon,
	Sun,
} from "lucide-react";

import { NavItem, NavigationProps, MyUser, NavBarProps } from "./definitions";
import { useRouter } from "next/navigation";
import Logo from "./util/images";
import logoImage from "@/public/bear_logo2.svg";
import { inter } from "./fonts";

const items: NavItem[] = [
	{
		label: "About",
		link: "/about",
		icon: <User className="w-4 h-4" />,
	},
	{
		label: "Sign Up",
		link: "/signup",
		icon: <Settings className="w-4 h-4" />,
	},
];

const bearLogo = (
	<Logo
		src={logoImage}
		alt="Bruniverse Logo"
		className="absolute w-[11.47vw] h-[12.19vh] top-[3vh] left-[8.96vw] m-0 p-0 box-border"
		aspectRatio={1}
		width={150}
		height={150}
		href="/"
	/>
);

/**
 * Represents the customizable navagition component.
 *
 * @param NavigationProps interface
 * @returns
 */
const Navigation: React.FC<NavigationProps> = ({
	items, // a list of nav items to be displayed on the navigation bar
	position = "top", // whether bar should be displayed on top or at the side
	variant = "default",
	logo,
	userSection, // to be displayed when user logs in
	showSearch = false,
	showNotifications = false,
	onSearchClick,
	onNotificationClick,
}) => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [activeItem, setActiveItem] = useState("");
	const [isDarkMode, setIsDarkMode] = useState(false);
	//const [scrolled, setScrolled] = useState(false);
	const [mounted, setMounted] = useState(false);
	const route = useRouter();

	// Ensure component is mounted before rendering to avoid hydration issues
	useEffect(() => {
		setMounted(true);
	}, []);

	// // Handle scroll effect for top navigation
	// useEffect(() => {
	// 	if (position === "top") {
	// 		const handleScroll = () => {
	// 			setScrolled(window.scrollY > 20);
	// 		};
	// 		window.addEventListener("scroll", handleScroll);
	// 		return () => window.removeEventListener("scroll", handleScroll);
	// 	}
	// }, [position]);

	// Base styles for different variants
	const getVariantStyles = () => {
		const base = "transition-all duration-300 ease-in-out";

		switch (variant) {
			case "glass":
				return `${base} backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl`;
			case "minimal":
				return `${base} bg-transparent border-gray-200 dark:border-gray-800 min-w-full`;
			default:
				return `${base} bg-white dark:bg-gray-900 shadow-lg dark:shadow-gray-900/20`;
		}
	};

	// Render navigation item
	const renderNavItem = (item: NavItem, isMobile = false) => {
		const NavItemComponent = () => {
			const [isDropdownOpen, setIsDropdownOpen] = useState(false);
			const hasChildren = item.children && item.children.length > 0;

			return (
				<div className="relative group">
					<button
						onClick={() => {
							if (hasChildren) {
								setIsDropdownOpen(!isDropdownOpen);
							} else {
								setActiveItem(item.link);
								if (isMobile)
									setIsMobileMenuOpen(!isMobileMenuOpen);
								item.link && route.push(item.link);
							}
						}}
						className={`
              flex items-center gap-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200
              hover:bg-orange-200 hover:scale-105 hover:shadow-md text-md
              ${
					activeItem === item.link
						? "bg-red-50 dark:bg-red-900/20 text-red-900"
						: "text-[#342400] hover:text-[#770000]"
				}
              ${isMobile ? "w-full justify-start" : ""}
            `}
					>
						{item.icon && (
							<span className="w-5 h-5 flex-shrink-0">
								{item.icon}
							</span>
						)}
						<span className="whitespace-nowrap ml-1">
							{item.label}
						</span>
						{hasChildren && (
							<ChevronDown
								className={`w-4 h-4 ml-auto transition-transform duration-200 ${
									isDropdownOpen ? "rotate-180" : ""
								}`}
							/>
						)}
					</button>

					{/* Dropdown menu */}
					{hasChildren && isDropdownOpen && (
						<div
							className={`
              ${
					isMobile
						? "mt-2 ml-4"
						: "absolute top-full left-0 mt-2 w-56 z-50"
				}
              bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700
              backdrop-blur-xl transform transition-all duration-200 ease-out
              opacity-100 scale-100
            `}
						>
							<div className="p-2">
								{item.children?.map((child) => (
									<button
										key={child.label}
										onClick={() => {
											setActiveItem(child.link);
											setIsDropdownOpen(!isDropdownOpen);
											if (isMobile)
												setIsMobileMenuOpen(
													!isMobileMenuOpen
												);
											route.push(child.link);
										}}
										className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
									>
										{child.icon && (
											<span className="w-4 h-4">
												{child.icon}
											</span>
										)}
										<span className="text-black">
											{child.label}
										</span>
									</button>
								))}
							</div>
						</div>
					)}
				</div>
			);
		};

		return <NavItemComponent key={item.label} />;
	};

	// Don't render until mounted to avoid hydration issues
	if (!mounted) {
		return null;
	}

	// if (position === "side") {
	// 	return (
	// 		<div className="flex h-screen">
	// 			{/* Sidebar */}
	// 			<div
	// 				className={`
	//       w-72 ${getVariantStyles()}
	//       ${isDarkMode ? "dark" : ""}
	//       flex flex-col border-r border-gray-200 dark:border-gray-800
	//     `}
	// 			>
	// 				{/* Logo section */}
	// 				{logo && (
	// 					<div className="p-6 border-b border-gray-200 dark:border-gray-800">
	// 						{logo}
	// 					</div>
	// 				)}

	// 				{/* Navigation items */}
	// 				<nav className="flex-1 p-4 space-y-2 overflow-y-auto">
	// 					{items.map((item) => renderNavItem(item))}
	// 				</nav>

	// 				{/* User section or logout items */}
	// 				{userSection ? (
	// 					<div className="p-4 border-t border-gray-200 dark:border-gray-800">
	// 						{userSection}
	// 					</div>
	// 				) : logoutSection && logoutSection.length > 0 ? (
	// 					<div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
	// 						{logoutSection.map((item, index) =>
	// 							renderNavItem(
	// 								{ ...item, label: item.label },
	// 								false
	// 							)
	// 						)}
	// 					</div>
	// 				) : null}

	// 				{/* Theme toggle */}
	// 				<div className="p-4">
	// 					<button
	// 						onClick={() => setIsDarkMode(!isDarkMode)}
	// 						className="flex items-center gap-2 w-full px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
	// 					>
	// 						{isDarkMode ? (
	// 							<Sun className="w-5 h-5" />
	// 						) : (
	// 							<Moon className="w-5 h-5" />
	// 						)}
	// 						<span>
	// 							{isDarkMode ? "Light Mode" : "Dark Mode"}
	// 						</span>
	// 					</button>
	// 				</div>
	// 			</div>

	// 			{/* Main content area */}
	// 			<div className="flex-1 overflow-auto">
	// 				<div className="p-8">
	// 					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
	// 						Main Content Area
	// 					</h1>
	// 					<p className="text-gray-600 dark:text-gray-400">
	// 						Your page content goes here. The sidebar navigation
	// 						is fully functional and responsive.
	// 					</p>
	// 				</div>
	// 			</div>
	// 		</div>
	// 	);
	// }

	// Top navigation // Todo: Handle dark mode later.
	return (
		<header className={`${isDarkMode ? "dark" : ""}`}>
			<div
				className={`
        	top-0 left-0 right-0 z-50 transition-all duration-300
        ${getVariantStyles()} py-4 m-0 max-h-24
      `}
			>
				<div className="max-w-full px-4 sm:px-6 lg:px-8 mx-auto">
					<div className="flex items-center justify-between">
						{/* Logo */}
						<div className="p-0">
							{logo || (
								<div className="text-2xl font-bold text-gray-900 dark:text-white">
									Logo
								</div>
							)}
						</div>

						{/* Right section */}
						<div className="flex items-center gap-4">
							{/* Search */}
							{showSearch && (
								<button
									onClick={onSearchClick}
									className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
								>
									<Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
								</button>
							)}

							{/* Notifications */}
							{showNotifications && (
								<button
									onClick={onNotificationClick}
									className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 relative"
								>
									<Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
									<span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
								</button>
							)}

							{/* Theme toggle */}
							<button
								onClick={() => setIsDarkMode(!isDarkMode)}
								className="p-2 rounded-xl hover:bg-orange-200 hover:shadow-md transition-colors duration-200"
							>
								{isDarkMode ? (
									<Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
								) : (
									<Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
								)}
							</button>

							{/* User section or logout items */}
							{userSection
								? userSection
								: items &&
									items.length > 0 && (
										<nav className="hidden md:flex items-center space-x-2">
											{items.map((item) =>
												renderNavItem(item)
											)}
										</nav>
									)}

							{/* Mobile menu button */}
							<button
								onClick={() =>
									setIsMobileMenuOpen(!isMobileMenuOpen)
								}
								className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
							>
								{isMobileMenuOpen ? (
									<X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
								) : (
									<Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
								)}
							</button>
						</div>
					</div>

					{/* Mobile Navigation */}
					<div
						className={`
            md:hidden transition-all duration-300 ease-in-out
            ${
				isMobileMenuOpen
					? "max-h-96 opacity-100 py-4"
					: "max-h-0 opacity-0 py-0"
			}
            overflow-hidden
          `}
					>
						<nav className="flex flex-col space-y-2">
							{items.map((item) => renderNavItem(item, true))}
						</nav>
					</div>
				</div>
			</div>
		</header>
	);
};

export const NavBar: React.FC<NavBarProps> = ({
	user,
	isLoggedIn,
	showSearch,
	showNotifications,
	position,
	variant,
}) => {
	const handleSearchClick = () => {
		alert("Search clicked!");
	};

	const handleNotificationClick = () => {
		alert("Notifications clicked!");
	};

	const userSection = user && (
		<div className="flex items-center gap-3">
			<div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
				{user?.avatar || <User className="w-4 h-4 text-white" />}
			</div>
			<div className="hidden sm:block">
				<div className="text-sm font-medium text-gray-900 dark:text-white">
					{user?.username}
				</div>
				<div className="text-xs text-gray-500 dark:text-gray-400">
					{user?.email}
				</div>
			</div>
		</div>
	);
	return (
		<>
			<Navigation
				items={items}
				position={position}
				variant={variant}
				logo={bearLogo}
				userSection={isLoggedIn ? userSection : undefined}
				showSearch={showSearch}
				showNotifications={showNotifications}
				onSearchClick={handleSearchClick}
				onNotificationClick={handleNotificationClick}
			/>
		</>
	);
};

export // Navigation Component with flexible positioning
type position = "left" | "center" | "right";
interface PostNavigationProps {
	logo: { show: boolean; position?: position; src: string; style?: string };
	menuButton: { show: boolean; position?: position; style?: string };
	navItems: NavItem[];
	searchBar: {
		show: boolean;
		position?: position;
		placeholder?: string;
		style?: string;
	};
	userSection: {
		show: boolean;
		position?: position;
		style?: string;
		user?: MyUser;
	};
	className?: string;
}

/**
 * Second Navigation bar, currently used for post page. This will be updated to
 * accommodate
 * @param param
 * @returns
 */
export const PostNavigation = ({
	logo = { show: true, position: "left", src: "" },
	menuButton = { show: true, position: "left" },
	navItems = [],
	searchBar = { show: true, position: "center", placeholder: "Search Posts" },
	userSection = {
		show: true,
		position: "right",
	}, // handle avatars later
	className = "",
}: PostNavigationProps) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const renderLogo = () => (
		<div
			className="flex items-center"
			key="logo"
		>
			{logo.src ? <Logo className={logo.style} /> : bearLogo}
		</div>
	);

	const renderMenuButton = () => (
		<button
			key="menu"
			onClick={() => setIsMenuOpen(!isMenuOpen)}
			className={`flex items-center p-2 hover:bg-amber-50 rounded-lg transition-colors block ${menuButton.style}`}
		>
			<Menu className="text-amber-900 w-full h-full" />
		</button>
	);

	const renderNavItems = () => (
		<div
			className="hidden md:flex items-center space-x-8"
			key="nav-items"
		>
			{navItems.map((item, index) => (
				<button
					key={index}
					onClick={item.action}
					className={`font-medium transition-colors ${item.style || "text-amber-900 hover:text-amber-700"}`}
				>
					{item.label}
				</button>
			))}
		</div>
	);

	const renderSearchBar = () => (
		<div
			className="flex-1 max-w-md mx-4"
			key="search"
		>
			<div className={`${searchBar.style}`}>
				<Search
					className={`absolute left-3 top-1/3 transform -translate-y-1/2 w-[5%] h-[39%]`}
				/>
				<input
					type="text"
					placeholder={searchBar.placeholder}
					className="w-full pl-15 pr-4 py-2 bg-[#CC810033] border border-amber-200 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent text-#808080"
				/>
			</div>
		</div>
	);

	const renderUserSection = () => {
		const { username, email, avatar } = userSection.user || {
			username: "Bruno",
			email: "@brown.edu",
			avatar: "/",
		};
		return (
			<div
				className="flex flex-col items-center space-y-1 absolute top-[3vh] right-[4vw]"
				key="user"
			>
				<div
					className={`w-20 h-20 bg-[#713F12] rounded-full flex items-center justify-center
						 text-white font-medium text-6xl ${inter.className} ${userSection.style}`}
				>
					{username ? username[0].toLocaleUpperCase() : "B"}
				</div>
				<div className="hidden md:block text-center">
					<div className="text-sm font-medium text-amber-900">
						{username || "Bruno"}
					</div>
					<div className="text-xs text-amber-600">ID: 652397</div>
				</div>
			</div>
		);
	};

	const leftItems = [];
	const centerItems = [];
	const rightItems = [];

	// Position items based on configuration
	if (logo.show && logo.position === "left") leftItems.push(renderLogo());
	if (menuButton.show && menuButton.position === "left")
		leftItems.push(renderMenuButton());
	if (navItems.length > 0) leftItems.push(renderNavItems());

	if (searchBar.show && searchBar.position === "center")
		centerItems.push(renderSearchBar());

	if (userSection.show && userSection.position === "right")
		rightItems.push(renderUserSection());

	return (
		<nav
			className={`bg-amber-25  px-4 py-3 min-w-full box-border ${className}`}
		>
			<div className="min-w-full mx-auto flex items-center justify-between">
				<div className="flex items-center space-x-4">{leftItems}</div>
				<div className="flex items-center flex-1 justify-center">
					{centerItems}
				</div>
				<div className="flex items-center">{rightItems}</div>
			</div>
		</nav>
	);
};
