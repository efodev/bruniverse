/// app/ui/fonts.ts
import { Montserrat } from "next/font/google";


export const montserrat = Montserrat({
    subsets: ['latin', 'cyrillic'],
    weight: ['100', '400', '700'],
});