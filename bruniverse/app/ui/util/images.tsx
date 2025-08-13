// app/ui/util/images.tsx

import Image from "next/image";
import Link from "next/link";
import { LogoProps } from "../definitions";
export default function Logo({
	src = "/bear_logo2.svg",
	alt = "bruniverse logo",
	aspectRatio,
	width,
	height,
	href = "/",
	className = "",
	priority = true,
	quality = 100,
}: LogoProps) {
	// Calculate dimensions based on aspect ratio
	let finalWidth: number;
	let finalHeight: number;

	if (aspectRatio && width && !height) {
		finalWidth = width;
		finalHeight = Math.round(width / aspectRatio);
	} else if (aspectRatio && height && !width) {
		finalHeight = height;
		finalWidth = Math.round(height * aspectRatio);
	} else if (width && height) {
		finalWidth = width;
		finalHeight = height;
	} else {
		// Default dimensions
		finalWidth = 150;
		finalHeight = 150;
	}

	const logoImage = (
		<Image
			src={src}
			alt={alt}
			width={finalWidth}
			height={finalHeight}
			className={`object-contain rounded-full p-0 m-0 ${className}`}
			priority={priority}
			quality={quality}
		/>
	);

	// If href is provided, wrap in Link component
	if (href) {
		return (
			<Link
				href={href}
				className="inline-block"
			>
				{logoImage}
			</Link>
		);
	}

	return logoImage;
}

//  Type for static imports
type StaticImageData = {
	src: string;
	height: number;
	width: number;
	placeholder?: string;
};
