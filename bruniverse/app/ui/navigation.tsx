/// app/ui/navigation 
'use client';

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

import {
	NavItem,
	NavigationProps,
	MyUser,
	NavBarProps
} from "./definitions";
import { useRouter } from "next/navigation";

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
	logoutSection, // displayed when user logs out
	showSearch = false, 
	showNotifications = false,
	onSearchClick,
	onNotificationClick,
}) => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [activeItem, setActiveItem] = useState("");
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [mounted, setMounted] = useState(false);
	const route = useRouter();

	// Ensure component is mounted before rendering to avoid hydration issues
	useEffect(() => {
		setMounted(true);
	}, []);

	// Handle scroll effect for top navigation
	useEffect(() => {
		if (position === "top") {
			const handleScroll = () => {
				setScrolled(window.scrollY > 20);
			};
			window.addEventListener("scroll", handleScroll);
			return () => window.removeEventListener("scroll", handleScroll);
		}
	}, [position]);

	// Base styles for different variants
	const getVariantStyles = () => {
		const base = "transition-all duration-300 ease-in-out";

		switch (variant) {
			case "glass":
				return `${base} backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl`;
			case "minimal":
				return `${base} bg-transparent border-b border-gray-200 dark:border-gray-800`;
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
								if (isMobile) setIsMobileMenuOpen(false);
								item.link && route.push(item.link);
							}
						}}
						className={`
              flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
              hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 hover:shadow-md
              ${
					activeItem === item.link
						? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
						: "text-gray-700 dark:text-gray-300"
				}
              ${isMobile ? "w-full justify-start" : ""}
            `}
					>
						{item.icon && (
							<span className="w-5 h-5 flex-shrink-0">
								{item.icon}
							</span>
						)}
						<span className="whitespace-nowrap">{item.label}</span>
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
											setIsDropdownOpen(false);
											if (isMobile)
												setIsMobileMenuOpen(false);
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

	if (position === "side") {
		return (
			<div className="flex h-screen">
				{/* Sidebar */}
				<div
					className={`
          w-72 ${getVariantStyles()} 
          ${isDarkMode ? "dark" : ""}
          flex flex-col border-r border-gray-200 dark:border-gray-800
        `}
				>
					{/* Logo section */}
					{logo && (
						<div className="p-6 border-b border-gray-200 dark:border-gray-800">
							{logo}
						</div>
					)}

					{/* Navigation items */}
					<nav className="flex-1 p-4 space-y-2 overflow-y-auto">
						{items.map((item) => renderNavItem(item))}
					</nav>

					{/* User section or logout items */}
					{userSection ? (
						<div className="p-4 border-t border-gray-200 dark:border-gray-800">
							{userSection}
						</div>
					) : logoutSection && logoutSection.length > 0 ? (
						<div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
							{logoutSection.map((item, index) =>
								renderNavItem(
									{ ...item, label: item.label },
									false
								)
							)}
						</div>
					) : null}

					{/* Theme toggle */}
					<div className="p-4">
						<button
							onClick={() => setIsDarkMode(!isDarkMode)}
							className="flex items-center gap-2 w-full px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
						>
							{isDarkMode ? (
								<Sun className="w-5 h-5" />
							) : (
								<Moon className="w-5 h-5" />
							)}
							<span>
								{isDarkMode ? "Light Mode" : "Dark Mode"}
							</span>
						</button>
					</div>
				</div>

				{/* Main content area */}
				<div className="flex-1 overflow-auto">
					<div className="p-8">
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
							Main Content Area
						</h1>
						<p className="text-gray-600 dark:text-gray-400">
							Your page content goes here. The sidebar navigation
							is fully functional and responsive.
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Top navigation
	return (
		<div className={isDarkMode ? "dark" : ""}>
			<header
				className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${getVariantStyles()}
        ${scrolled ? "py-2" : "py-4"}
      `}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between">
						{/* Logo */}
						<div className="flex items-center">
							{logo || (
								<div className="text-2xl font-bold text-gray-900 dark:text-white">
									Logo
								</div>
							)}
						</div>

						{/* Desktop Navigation */}
						<nav className="hidden md:flex items-center space-x-2">
							{items.map((item) => renderNavItem(item))}
						</nav>

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
								className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
							>
								{isDarkMode ? (
									<Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
								) : (
									<Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
								)}
							</button>

							{/* User section or logout items */}
							{userSection ? (
								userSection
							) : logoutSection && logoutSection.length > 0 ? (
								<div className="flex items-center gap-2">
									{logoutSection.map((item, index) => (
										<button
											key={`${item.label}-${index}`}
											onClick={() => {
												setActiveItem(item.link);
												// Handle navigation or action here
											}}
											className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:scale-105"
										>
											{item.icon && (
												<span className="w-4 h-4 flex-shrink-0">
													{item.icon}
												</span>
											)}
											<span className="whitespace-nowrap">
												{item.label}
											</span>
										</button>
									))}
								</div>
							) : null}

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
			</header>
		</div>
	);
};

// Demo component with sample data
const NavigationDemo = () => {
	const sampleItems: NavItem[] = [
		{
			label: "Home",
			link: "/",
			icon: <Home className="w-5 h-5" />,
		},
		{
			label: "Products",
			link: "/products",
			icon: <Search className="w-5 h-5" />,
			children: [
				{
					label: "Electronics",
					link: "/products/electronics",
					icon: <Settings className="w-4 h-4" />,
				},
				{
					label: "Clothing",
					link: "/products/clothing",
					icon: <User className="w-4 h-4" />,
				},
				{
					label: "Books",
					link: "/products/books",
					icon: <Home className="w-4 h-4" />,
				},
			],
		},
		{
			label: "About",
			link: "/about",
			icon: <User className="w-5 h-5" />,
		},
		{
			label: "Settings",
			link: "/settings",
			icon: <Settings className="w-5 h-5" />,
			children: [
				{ label: "Profile", link: "/settings/profile" },
				{ label: "Preferences", link: "/settings/preferences" },
				{ label: "Security", link: "/settings/security" },
			],
		},
	];

	const logoutItems: NavItem[] = [
		{
			label: "Sign In",
			link: "/signin",
			icon: <User className="w-4 h-4" />,
		},
		{
			label: "Sign Up",
			link: "/signup",
			icon: <Settings className="w-4 h-4" />,
		},
	];

	const [position, setPosition] = useState<"top" | "side">("top");
	const [variant, setVariant] = useState<"default" | "glass" | "minimal">(
		"default"
	);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [showSearch, setShowSearch] = useState(true);
	const [showNotifications, setShowNotifications] = useState(true);

	const handleSearchClick = () => {
		alert("Search clicked!");
	};

	const handleNotificationClick = () => {
		alert("Notifications clicked!");
	};

	const logo = (
		<div className="flex items-center gap-3">
			<div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
				<span className="text-white font-bold text-sm">N</span>
			</div>
			<span className="text-xl font-bold text-gray-900 dark:text-white">
				NaviPro
			</span>
		</div>
	);

	const userSection = (
		<div className="flex items-center gap-3">
			<div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
				<User className="w-4 h-4 text-white" />
			</div>
			<div className="hidden sm:block">
				<div className="text-sm font-medium text-gray-900 dark:text-white">
					John Doe
				</div>
				<div className="text-xs text-gray-500 dark:text-gray-400">
					john@example.com
				</div>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			{/* Controls */}
			<div className="fixed top-4 right-4 z-[60] bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
				<div className="flex flex-col gap-3">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Position
						</label>
						<select
							value={position}
							onChange={(e) =>
								setPosition(e.target.value as "top" | "side")
							}
							className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
						>
							<option value="top">Top</option>
							<option value="side">Side</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Variant
						</label>
						<select
							value={variant}
							onChange={(e) =>
								setVariant(
									e.target.value as
										| "default"
										| "glass"
										| "minimal"
								)
							}
							className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
						>
							<option value="default">Default</option>
							<option value="glass">Glass</option>
							<option value="minimal">Minimal</option>
						</select>
					</div>
					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							id="loggedIn"
							checked={isLoggedIn}
							onChange={(e) => setIsLoggedIn(e.target.checked)}
							className="rounded"
						/>
						<label
							htmlFor="loggedIn"
							className="text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							Logged In
						</label>
					</div>
					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							id="showSearch"
							checked={showSearch}
							onChange={(e) => setShowSearch(e.target.checked)}
							className="rounded"
						/>
						<label
							htmlFor="showSearch"
							className="text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							Show Search
						</label>
					</div>
					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							id="showNotifications"
							checked={showNotifications}
							onChange={(e) =>
								setShowNotifications(e.target.checked)
							}
							className="rounded"
						/>
						<label
							htmlFor="showNotifications"
							className="text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							Show Notifications
						</label>
					</div>
				</div>
			</div>

			<Navigation
				items={sampleItems}
				position={position}
				variant={variant}
				logo={logo}
				userSection={isLoggedIn ? userSection : undefined}
				logoutSection={!isLoggedIn ? logoutItems : undefined}
				showSearch={showSearch}
				showNotifications={showNotifications}
				onSearchClick={handleSearchClick}
				onNotificationClick={handleNotificationClick}
			/>
		</div>
	);
};



export default NavigationDemo;

export const NavBar: React.FC<NavBarProps> = ({
	user,
	isLoggedIn,
	showSearch,
	showNotifications,
	position,
	variant
}) => {
	const handleSearchClick = () => {
		alert("Search clicked!");
	};

	const handleNotificationClick = () => {
		alert("Notifications clicked!");
	};

	const logoutItems: NavItem[] = [
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

	const logo = (
		<div className="flex items-center gap-3">
			<div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
				<span className="text-white font-bold text-sm">N</span>
			</div>
			<span className="text-xl font-bold text-gray-900 dark:text-white">
				NaviPro
			</span>
		</div>
	);

	const userSection = user && (
		<div className="flex items-center gap-3">
			<div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
				{ user?.avatar || (<User className="w-4 h-4 text-white" />)}
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
			items={[]}
			position={position}
			variant={variant}
			logo={logo}
			userSection={isLoggedIn ? userSection : undefined}
			logoutSection={!isLoggedIn ? logoutItems : undefined}
			showSearch={showSearch}
			showNotifications={showNotifications}
			onSearchClick={handleSearchClick}
			onNotificationClick={handleNotificationClick}
		/>
		</>
	);
}
