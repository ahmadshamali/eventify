import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_verification_email(email: str, verification_code: str, frontend_url: Optional[str] = None) -> bool:
    """
    Send verification email to user via SMTP.
    
    Args:
        email: User's email address
        verification_code: 6-digit verification code
        frontend_url: Frontend URL for verification link (uses config if not provided)
    
    Returns:
        bool: True if email sent successfully
    
    Raises:
        ValueError: If SMTP is not configured or sending fails
    """
    if not settings.SMTP_ENABLED:
        logger.warning("SMTP is disabled. Email not sent to %s", email)
        return False
    
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.error("SMTP credentials not configured. Cannot send email.")
        raise ValueError("Email service not configured. Please contact support.")
    
    frontend_url = frontend_url or settings.FRONTEND_URL
    verification_page = f"{frontend_url}/verify-email"
    
    html_body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #0066cc;">Email Verification</h2>
                <p>Welcome to Eventify!</p>
                <p>Use this 6-digit code to verify your email address:</p>
                <p style="margin: 30px 0; font-size: 2rem; font-weight: bold; letter-spacing: 0.35em; color: #0066cc;">
                    {verification_code}
                </p>
                <p>Enter the code on the verification page:</p>
                <p style="word-break: break-all; color: #666;">
                    <code>{verification_page}</code>
                </p>
                <p style="margin-top: 30px; font-size: 0.9em; color: #999;">
                    This code will expire in 24 hours.<br>
                    If you didn't create this account, please ignore this email.
                </p>
            </div>
        </body>
    </html>
    """
    
    text_body = f"""
    Email Verification
    
    Welcome to Eventify!
    
    Use this 6-digit code to verify your email address:
    {verification_code}
    
    Enter the code on the verification page:
    {verification_page}
    
    This code will expire in 24 hours.
    If you didn't create this account, please ignore this email.
    """
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'Verify Your Eventify Email'
        msg['From'] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        msg['To'] = email
        
        msg.attach(MIMEText(text_body, 'plain'))
        msg.attach(MIMEText(html_body, 'html'))
        
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info("Verification email sent successfully to %s", email)
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        logger.error("SMTP authentication failed: %s", str(e))
        raise ValueError("Email service authentication failed. Please contact support.")
    except smtplib.SMTPException as e:
        logger.error("SMTP error while sending verification email to %s: %s", email, str(e))
        raise ValueError(f"Failed to send verification email: {str(e)}")
    except Exception as e:
        logger.error("Unexpected error sending verification email to %s: %s", email, str(e))
        raise ValueError(f"Failed to send verification email: {str(e)}")


def send_organizer_approval_email(email: str, organizer_name: str, status: str, rejection_reason: Optional[str] = None) -> bool:
    """
    Send organizer approval/rejection email via SMTP.
    
    Args:
        email: Organizer's email address
        organizer_name: Name of the organizer/club
        status: "approved" or "rejected"
        rejection_reason: Reason for rejection (if status is "rejected")
    
    Returns:
        bool: True if email sent successfully
    
    Raises:
        ValueError: If SMTP is not configured or sending fails
    """
    if not settings.SMTP_ENABLED:
        logger.warning("SMTP is disabled. Email not sent to %s", email)
        return False
    
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.error("SMTP credentials not configured. Cannot send email.")
        raise ValueError("Email service not configured. Please contact support.")
    
    if status == "approved":
        subject = "Organizer Account Approved"
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #0066cc;">Organizer Account Approved</h2>
                    <p>Congratulations!</p>
                    <p>Your organizer account for <strong>{organizer_name}</strong> has been approved by the admin.</p>
                    <p>You can now log in and start creating events.</p>
                    <p style="margin-top: 30px;">
                        <a href="{settings.FRONTEND_URL}/login" style="display: inline-block; background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            Go to Login
                        </a>
                    </p>
                </div>
            </body>
        </html>
        """
        text_body = f"""
        Organizer Account Approved
        
        Congratulations!
        
        Your organizer account for {organizer_name} has been approved by the admin.
        You can now log in and start creating events.
        """
    else:
        subject = "Organizer Account Review"
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #cc0000;">Organizer Account Not Approved</h2>
                    <p>Your organizer account for <strong>{organizer_name}</strong> was not approved.</p>
                    <p style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #cc0000;">
                        <strong>Reason:</strong><br>
                        {rejection_reason or 'Not specified'}
                    </p>
                    <p>Please contact support for more information or to reapply.</p>
                </div>
            </body>
        </html>
        """
        text_body = f"""
        Organizer Account Not Approved
        
        Your organizer account for {organizer_name} was not approved.
        
        Reason: {rejection_reason or 'Not specified'}
        
        Please contact support for more information.
        """
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        msg['To'] = email
        
        msg.attach(MIMEText(text_body, 'plain'))
        msg.attach(MIMEText(html_body, 'html'))
        
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info("Organizer approval email sent to %s - Status: %s", email, status)
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        logger.error("SMTP authentication failed: %s", str(e))
        raise ValueError("Email service authentication failed. Please contact support.")
    except smtplib.SMTPException as e:
        logger.error("SMTP error while sending approval email to %s: %s", email, str(e))
        raise ValueError(f"Failed to send approval email: {str(e)}")
    except Exception as e:
        logger.error("Unexpected error sending approval email to %s: %s", email, str(e))
        raise ValueError(f"Failed to send approval email: {str(e)}")
