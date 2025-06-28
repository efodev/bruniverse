import React from "react";

interface VerificationEmailProps {
	verificationCode: string;
	expirationTime: string; // e.g., "10 minutes" or "1 hour"
	duration: string;
}

export const generateVerificationEmailHTML = ({
	verificationCode,
	expirationTime,
	duration,
}: VerificationEmailProps): string => {
	return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @media only screen and (max-width: 600px) {
              .container { max-width: 100% !important; margin: 0 10px !important; }
              .content { padding: 0 16px 16px 16px !important; }
              .header { padding: 16px !important; }
              .code { font-size: 24px !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 20px; background-color: #f9fafb;">
          <div class="container" style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; width: 100%;">
            
            <div class="header" style="padding: 20px; padding-bottom: 16px;">
              <div style="width: 60px; height: 60px; border-radius: 100%; border: solid brown 2px; display: inline-block; text-align: center; line-height: 48px; font-weight: bold; font-size: 20px;">
              <img src="/public/bear_logo2.svg"/>
              </div>
            </div>
            
            <div class="content" style="padding: 0 20px 20px 20px;">
              <h1 style="font-size: 24px; font-weight: bold; color: #111827; margin: 0 0 24px 0;">Welcome to your Universe!</h1>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Thank you for signing up! To complete your registration, please use the verification code below:
              </p>
              
              <div style="background-color: #f9fafb; border: 2px dashed #d1d5db; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
                <div style="font-size: 12px; color: #6b7280; margin: 0 0 8px 0;">Your verification code:</div>
                <div class="code" style="font-size: 28px; font-family: 'Monserrat', monospace; font-weight: bold; color: #111827; letter-spacing: 2px; word-break: break-all;">${verificationCode}</div>
                <div style="font-size: 12px; color: #6b7280; margin: 8px 0 0 0;">This code expires in ${duration} minutes at ${expirationTime}</div>
              </div>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Enter this code in the verification field to activate your account.
              </p>
              
              <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <h3 style="font-size: 14px; font-weight: 600; color: #92400e; margin: 0 0 4px 0;">⚠️ Keep this code secure</h3>
                <p style="font-size: 14px; color: #b45309; margin: 0; line-height: 1.4;">
                  Do not share this verification code with anyone. Our team will never ask for your verification code.
                </p>
              </div>
              
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">
                  If you didn't request this verification code, please ignore this email.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
};
