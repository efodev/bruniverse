export const signupQuery = `
    INSERT INTO users(username, brown_email, password, verification_code)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
`;
