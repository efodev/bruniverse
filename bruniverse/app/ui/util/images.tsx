// app/ui/util/images.tsx
'use client';
import Image from 'next/image';
import Link from 'next/link';   
import  {LogoProps} from '../definitions';

export default function Logo({
	src,
	alt,
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

	if (width && !height) {
		finalWidth = width;
		finalHeight = Math.round(width / aspectRatio);
	} else if (height && !width) {
		finalHeight = height;
		finalWidth = Math.round(height * aspectRatio);
	} else if (width && height) {
		finalWidth = width;
		finalHeight = height;
	} else {
		// Default dimensions
		finalWidth = 120;
		finalHeight = Math.round(120 / aspectRatio);
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
  src: string
  height: number
  width: number
  placeholder?: string
}
