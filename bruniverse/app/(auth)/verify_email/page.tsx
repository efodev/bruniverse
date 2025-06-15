/// app/(auth)/verify_email/page.tsx
"use client";

import EmailVerification from "@/app/ui/auth/email_verification";

export default function EmailVerificationPage() {
    
    return (
        <>
            <EmailVerification 
                title="A Verification Code has been Sent to your Email."
                subtitle="Enter the Verification Code."
                className=""
                onVerify={() => { }}
                onResendCode={() => { }}
            />
        </>
);
}