import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	// Next.js and TypeScript configurations
	...compat.extends("next/core-web-vitals", "next/typescript"),

	// Configuration for TypeScript files
	{
		files: ["**/*.ts", "**/*.tsx"],
		rules: {
			// Set specific rules to warn
			"@typescript-eslint/no-unused-vars": [
				"off",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unused-expressions": "off",
			"@typescript-eslint/no-empty-object-type": "off",
			"react-hooks/exhaustive-deps": "off",
		},
	},

	// Configuration for JavaScript files
	{
		files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
		rules: {
			// Set specific rules to warn for JS files
			"no-unused-vars": [
				"off",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
			"no-unused-expressions": "off",
		},
	},

	// Configuration for JSX/TSX files (React components)
	{
		files: ["**/*.jsx", "**/*.tsx"],
		rules: {
			// React-specific unescaped entities rule
			"react/no-unescaped-entities": "off",
		},
	},
];

export default eslintConfig;
