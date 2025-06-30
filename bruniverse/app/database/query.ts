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

`;
export const updateOTPUserTransact = `
-- Update user table if needed
UPDATE users 
SET verification_expires = TRUE, email_verified = True 
WHERE id = (
    SELECT user_id 
    FROM verifications 
    WHERE token = $1
)
RETURNING user_id
`;

// Single CTE query combining all operations
export const verifyOTPWithCTE = `
  WITH verify_otp AS (
    -- Check if verification is valid and lock the row
    SELECT id, email 
    FROM verifications 
    WHERE token = $1 
      AND otp = $2 
      AND used = FALSE 
      AND expires_at > CURRENT_TIMESTAMP 
    FOR UPDATE
  ),
  update_verification AS (
    -- Mark verification as used
    UPDATE verifications 
    SET used = TRUE, updated_at = CURRENT_TIMESTAMP 
    WHERE token = $1 
      AND EXISTS (SELECT 1 FROM verify_otp)
    RETURNING id as verification_id
  ),
  update_user AS (
    -- Update user verification status using email from verification
    UPDATE users 
    SET email_verified = TRUE, 
        verification_expires = TRUE,
        updated_at = CURRENT_TIMESTAMP
    WHERE brown_email = (SELECT email FROM verify_otp)
      AND EXISTS (SELECT 1 FROM verify_otp)
    RETURNING id as user_id, brown_email
  )
  SELECT 
    v.id as verification_id,
    v.email,
    uv.verification_id as updated_verification_id,
    uu.user_id as updated_user_id,
    uu.brown_email as user_email,
    -- Row count indicators
    CASE WHEN v.id IS NOT NULL THEN 1 ELSE 0 END as verification_found,
    CASE WHEN uv.verification_id IS NOT NULL THEN 1 ELSE 0 END as verification_updated,
    CASE WHEN uu.user_id IS NOT NULL THEN 1 ELSE 0 END as user_updated
  FROM verify_otp v
  FULL OUTER JOIN update_verification uv ON TRUE
  FULL OUTER JOIN update_user uu ON TRUE;
`;

// Combined CTE query
export const signupWithVerificationCTE = `
WITH 
-- Step 1: Insert new user
new_user AS (
    INSERT INTO users(username, brown_email, password, verification_code)
    VALUES ($1, $2, $3, $4)
    RETURNING username, brown_email, id, created_at
),
-- Step 2: Invalidate all previous OTPs for this user
invalidated_otps AS (
    UPDATE verifications 
    SET used = TRUE, updated_at = CURRENT_TIMESTAMP
    WHERE email = $2 AND used = FALSE
    RETURNING id as invalidated_id
),
-- Step 3: Insert new OTP verification
new_verification AS (
    INSERT INTO verifications (
        email,
        token,
        otp,
        expires_at,
        id
    ) VALUES (
        $2, $5, $4, $6, $7
    )
    RETURNING id, token, expires_at, email, otp
)
-- Final SELECT to return combined results
SELECT 
    nu.id as user_id,
    nu.username,
    nu.brown_email,
    nu.created_at as user_created_at,
    nv.id as verification_id,
    nv.token,
    nv.expires_at,
    nv.otp,
    (SELECT COUNT(*) FROM invalidated_otps) as invalidated_count
FROM new_user nu
CROSS JOIN new_verification nv;
`;

// Break down queries tomorrow.
