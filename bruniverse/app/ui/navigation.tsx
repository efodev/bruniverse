/// app/ui/navigation
"use client";

import React, { useState, useEffect } from "react";
import {
	Menu,
	X,
	User,
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

const items: NavItem[] = [];

const bearLogo = (
	<Logo
		src={logoImage}
		alt="Bruniverse Logo"
		className="relative size-30 -top-7 m-0 p-0"
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

export type position = "left" | "center" | "right";

interface PostNavigationProps {
	logo?: { show: boolean; position?: position; src: string; style?: string };
	menuButton?: { show: boolean; position?: position; style?: string };
	navItems?: NavItem[];
	searchBar?: {
		show: boolean;
		position?: position;
		placeholder?: string;
		style?: string;
	};
	userSection?: {
		show: boolean;
		position?: position;
		style?: string;
		user?: MyUser;
	};
	className?: string;
}

/**
 * Competition-grade responsive navigation with fluid scaling and perfect proportions
 */
export const PostNavigation = ({
	logo = { show: true, src: "" },
	menuButton = { show: true, style: "" },
	navItems = [
		{
			label: "About",
			style: "hover:text-amber-400 font-extrabold tracking-wide transition-all duration-300 hover:scale-105",
			action: () => console.log("About clicked"),
			link: "/About",
		},
		{
			label: "Team",
			style: "hover:text-amber-400 font-extrabold tracking-wide transition-all duration-300 hover:scale-105",
			action: () => console.log("Team clicked"),
			link: "/Team",
		},
	],
	searchBar = {
		show: true,
		placeholder: "Search Posts",
		style: "",
	},
	userSection = {
		show: true,
		style: "",
	},
	className = "",
}: PostNavigationProps) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	// Responsive breakpoint detection
	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const bearLogo = (
		<Logo
			src={logoImage}
			alt="Bruniverse Logo"
			className="w-full h-full object-contain"
			aspectRatio={1}
			href="/"
		/>
	);

	const renderMenuButton = () => (
		<div className="flex items-center justify-center w-full h-full">
			<button
				onClick={() => setIsMenuOpen(!isMenuOpen)}
				className={`
					w-[clamp(2rem,4vw,3rem)] h-[clamp(2rem,4vw,3rem)]
					flex items-center justify-center
					hover:bg-amber-100/80 active:bg-amber-200/80
					rounded-xl transition-all duration-300 ease-out
					hover:shadow-lg hover:scale-110 active:scale-95
					backdrop-blur-sm
					${menuButton.style}
				`}
				aria-label="Toggle menu"
			>
				<Menu className="w-[65%] h-[65%] text-amber-900 hover:text-amber-700 transition-colors duration-300" />
			</button>
		</div>
	);

	const renderLogo = () => (
		<div className="flex items-center justify-center h-full w-full">
			<div className="w-[clamp(4rem,6rem,8rem)] h-[clamp(4rem,6rem,8rem)] flex items-center justify-center">
				{logo.src ? (
					<Logo
						className={`w-full h-full object-contain ${logo.style}`}
					/>
				) : (
					bearLogo
				)}
			</div>
		</div>
	);

	const renderNavItems = () => (
		<div className="hidden lg:flex items-center justify-center h-full w-full space-x-[clamp(1rem,2vw,2rem)]">
			{navItems.map((item, index) => (
				<button
					key={index}
					onClick={item.action}
					className={`
						px-[clamp(0.75rem,1.5vw,1.5rem)] py-[clamp(0.5rem,1vw,1rem)]
						text-[clamp(1rem,1.8vw,1.5rem)] font-bold
						text-amber-900 hover:text-amber-400
						rounded-lg transition-all duration-300 ease-out
						hover:bg-amber-50/60 hover:shadow-md hover:scale-105
						active:scale-95 active:bg-amber-100/80
						backdrop-blur-sm border border-transparent hover:border-amber-200/50
						${item.style || ""}
					`}
				>
					{item.label}
				</button>
			))}
		</div>
	);

	const renderMobileNavItems = () => (
		<div
			className={`
			lg:hidden absolute top-full left-0 right-0 z-50
			bg-amber-25/95 backdrop-blur-md border-t border-amber-200/50
			shadow-2xl transition-all duration-500 ease-out
			${
				isMenuOpen
					? "opacity-100 translate-y-0 pointer-events-auto"
					: "opacity-0 -translate-y-4 pointer-events-none"
			}
		`}
		>
			<div className="flex flex-col p-4 space-y-2">
				{navItems.map((item, index) => (
					<button
						key={index}
						onClick={() => {
							item.action();
							setIsMenuOpen(false);
						}}
						className="
							w-full text-left px-4 py-3 text-lg font-bold
							text-amber-900 hover:text-amber-400
							rounded-lg transition-all duration-300
							hover:bg-amber-100/60 hover:scale-[1.02]
							active:scale-95 active:bg-amber-200/60
						"
					>
						{item.label}
					</button>
				))}
			</div>
		</div>
	);

	const renderSearchBar = () => (
		<div className="flex items-center justify-center h-full w-full px-2">
			<div className="relative w-full max-w-md h-[clamp(2.5rem,4vw,3rem)]">
				<Search
					className="
					absolute left-[clamp(0.75rem,2vw,1rem)] top-1/2 transform -translate-y-1/2 
					w-[clamp(1rem,2vw,1.25rem)] h-[clamp(1rem,2vw,1.25rem)] 
					text-amber-600/70 transition-colors duration-300
				"
				/>
				<input
					type="text"
					placeholder={searchBar.placeholder}
					className={`
						w-full h-full
						pl-[clamp(2.5rem,5vw,3.5rem)] pr-[clamp(0.75rem,2vw,1rem)]
						bg-amber-50/60 backdrop-blur-sm
						border border-amber-200/50 rounded-2xl
						text-[clamp(0.875rem,1.5vw,1rem)] text-gray-700 placeholder-amber-600/50
						transition-all duration-300 ease-out
						focus:outline-none focus:ring-2 focus:ring-amber-300/60 focus:border-amber-400/60
						focus:bg-white/80 focus:shadow-lg focus:scale-[1.02]
						hover:bg-amber-100/60 hover:border-amber-300/60 hover:shadow-md
						${searchBar.style}
					`}
				/>
			</div>
		</div>
	);

	const renderUserSection = () => {
		const { username } = userSection.user || {
			username: "Bruno",
		};

		return (
			<div className="flex items-center justify-center h-full w-full">
				<div
					className={`
					flex ${isMobile ? "flex-row items-center space-x-2" : "flex-col items-center space-y-1"} 
					text-center transition-all duration-300
					${userSection.style}
				`}
				>
					{/* Avatar */}
					<div
						className={`
						mt-1 w-[clamp(3rem,4rem,5rem)] h-[clamp(3rem,4rem,5rem)]
						bg-gradient-to-br from-amber-900 to-amber-800
						rounded-full flex items-center justify-center
						text-white font-semibold text-[clamp(2rem,3rem,4rem)]
						transition-all duration-300 ease-out
						hover:shadow-xl hover:scale-110 hover:rotate-3
						active:scale-95 cursor-pointer
						border-2 border-amber-200/20 hover:border-amber-300/40
						${inter?.className || ""}
					`}
					>
						{username ? username[0].toLocaleUpperCase() : "B"}
					</div>

					{/* User Info */}
					<div
						className={`${isMobile ? "flex flex-col" : "hidden md:block"} transition-all duration-300`}
					>
						<div className="text-[clamp(0.75rem,1.2vw,0.875rem)] font-semibold text-amber-900">
							{username || "Bruno"}
						</div>
						<div className="text-[clamp(0.625rem,1vw,0.75rem)] text-amber-700/70 font-medium"></div>
					</div>
				</div>
			</div>
		);
	};

	return (
		<>
			<nav
				className={`
				h-full w-full relative
				shadow-lg shadow-amber-100/20 mt-0
				${className}
			`}
			>
				{/* Main Navigation Grid */}
				<div className="h-full w-full grid grid-cols-12 gap-2 px-[clamp(0.5rem,2vw,1.5rem)]">
					{/* Menu Button - Mobile/Tablet */}
					{menuButton.show && (
						<div className="lg:hidden col-span-1 flex items-center">
							{renderMenuButton()}
						</div>
					)}

					{/* Logo */}
					{logo.show && (
						<div
							className={`
							${menuButton.show ? "lg:col-span-2 col-span-2" : "lg:col-span-2 col-span-3"}
							flex items-center hover:scale-110
						`}
						>
							{renderLogo()}
						</div>
					)}

					{/* Navigation Items - Desktop Only */}
					{navItems.length > 0 && (
						<div className="hidden lg:block lg:col-span-3">
							{renderNavItems()}
						</div>
					)}

					{/* Search Bar */}
					{searchBar.show && (
						<div
							className={`
							${navItems.length > 0 ? "lg:col-span-4 col-span-6" : "lg:col-span-6 col-span-6"}
						`}
						>
							{renderSearchBar()}
						</div>
					)}

					{/* User Section */}
					{userSection.show && (
						<div
							className={`
							${navItems.length > 0 ? "lg:col-span-3 col-span-3" : "lg:col-span-4 col-span-3"}
						`}
						>
							{renderUserSection()}
						</div>
					)}
				</div>
			</nav>

			{/* Mobile Navigation Menu */}
			{renderMobileNavItems()}

			{/* Mobile Menu Overlay */}
			{isMenuOpen && (
				<div
					className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
					onClick={() => setIsMenuOpen(false)}
				/>
			)}
		</>
	);
};
