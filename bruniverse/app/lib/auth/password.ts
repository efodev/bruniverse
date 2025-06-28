import argon2 from "argon2";

export async function hashPassword(password: string): Promise<string> {
	return await argon2.hash(password, {
		type: argon2.argon2id,
		memoryCost: 2 ** 16, // 64 MB
		timeCost: 3,
		parallelism: 1,
	});
}

export async function verifyPassword(
	password: string,
	hash: string
): Promise<boolean> {
	return await argon2.verify(hash, password);
}
