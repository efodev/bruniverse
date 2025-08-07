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

// Query to get user by email
export const userByEmailTransact = `
    SELECT 
      id,
      username,
      brown_email,
      password,
      is_active,
      email_verified,
      created_at
    FROM users 
    WHERE LOWER(brown_email) = LOWER($1)
    LIMIT 1
  `;

// Query to get Login Attempts
export const getLoginAttemptsTransact = `
	  SELECT 
      COUNT(*) FILTER (WHERE success = false AND attempted_at > NOW() - INTERVAL '30 minutes') as recent_failed_attempts,
      MAX(attempted_at) FILTER (WHERE success = false) as last_failed_attempt,
      MAX(attempted_at) FILTER (WHERE success = true) as last_successful_login,
      COUNT(*) FILTER (WHERE success = false AND attempted_at > NOW() - INTERVAL '15 minutes') as failed_attempts_15min
	  FROM login_attempts 
	  WHERE LOWER(email) = LOWER($1)
	`;

export const logLoginAttemptsTransact = `
	  INSERT INTO login_attempts (user_id, email, success, ip_address, user_agent, attempted_at)
	  VALUES ($1, $2, $3, $4, $5, NOW())
	  RETURNING id, attempted_at
	`;

// Query to update last user login for login transactions
export const updateLastLoginTransact = `
INSERT INTO login_sessions (user_id, last_login)
VALUES ($1, NOW())
ON CONFLICT (user_id) 
DO UPDATE SET 
last_login = NOW(),
session_token = NULL,
expires_at = NULL
RETURNING last_login
`;

// Reactions CTE
export const toggleReactionQuery = `
WITH toggle_reaction AS (
    DELETE FROM reactions 
    WHERE user_id = $1 
    AND reaction_type = $2
    AND (
        (post_id = $3 AND $4 IS NULL) OR 
        (comment_id = $4 AND $3 IS NULL)
    )
    RETURNING id, 'deleted' as action
),
insert_reaction AS (
    INSERT INTO reactions (user_id, post_id, comment_id, reaction_type)
    SELECT $1, $3, $4, $2
    WHERE NOT EXISTS (SELECT 1 FROM toggle_reaction)
    RETURNING id, 'inserted' as action
),
final_stats AS (
    SELECT 
        COUNT(*) as total_count,
        COUNT(CASE WHEN user_id = $1 THEN 1 END) > 0 as is_active
    FROM reactions 
    WHERE reaction_type = $2
    AND (
        (post_id = $3 AND $4 IS NULL) OR 
        (comment_id = $4 AND $3 IS NULL)
    )
)
SELECT 
    total_count as count,
    is_active,
    COALESCE(tr.action, ir.action, 'no_change') as action
FROM final_stats fs
LEFT JOIN toggle_reaction tr ON true
LEFT JOIN insert_reaction ir ON true;
`;

