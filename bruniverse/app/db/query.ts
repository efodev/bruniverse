export const signupTransact = `
    INSERT INTO users(username, brown_email, password, verification_code)
    VALUES ($1, $2, $3, $4)
`;

// Invalidate all previous otp(s) for a particular user
export const InvalidateOTPtransact = `
-- Invalidate previous verifications for this user
UPDATE verifications 
SET used = TRUE, updated_at = CURRENT_TIMESTAMP
WHERE email = $1 AND used = FALSE
`;

//  Inserts a new otp
export const InsertOTPTransact = `

-- Insert new verification
INSERT INTO verifications (
    email,
    token,
    otp,
    expires_at,
    id
) VALUES (
    $1, $2, $3, $4, $5
)
RETURNING id, token, expires_at

`;

export const verifyOTPTransact = `
-- Check if verification is valid
SELECT id, email, user_id 
FROM verifications 
WHERE token = $1 
  AND otp = $2
  AND used = FALSE 
  AND expires_at > CURRENT_TIMESTAMP
FOR UPDATE -- Lock the row

`;
export const updateVerificationsTransacts = `

-- If found, update it
UPDATE verifications 
SET used = TRUE, updated_at = CURRENT_TIMESTAMP
WHERE token = $1

;

`
export const updateOTPUserTransact = `
-- Update user table if needed
UPDATE users 
SET verification_expires = TRUE, email_verified = True 
WHERE id = (
    SELECT user_id 
    FROM verifications 
    WHERE email = $3
)
RETURNING user_id
`;

// Break down queries tomorrow.
