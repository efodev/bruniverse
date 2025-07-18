/// app/ui/fonts.ts
import { Montserrat } from "next/font/google";
import { Inter } from "next/font/google";

export const montserrat = Montserrat({
	subsets: ["latin", "cyrillic"],
	weight: ["100", "400", "700"],
});

export const inter = Inter({
	subsets: ["latin", "cyrillic"],
	weight: ["100", "400", "700"],
});
