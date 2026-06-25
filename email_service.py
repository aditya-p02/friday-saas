import os
import aiosmtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

async def send_drafted_email(to_email: str, subject: str, body: str):
    message = EmailMessage()
    
    sender_email = os.getenv("SMTP_USERNAME")
    message["From"] = sender_email
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    try:
        await aiosmtplib.send(
            message,
            hostname=os.getenv("SMTP_SERVER"),
            port=int(os.getenv("SMTP_PORT", 587)),
            username=sender_email,
            password=os.getenv("SMTP_PASSWORD"),
            start_tls=True,
        )
        print(f"✅ [FRIDAY] Successfully fired cold email to {to_email}")
    except Exception as e:
        print(f"❌ [FRIDAY] Delivery failed for {to_email}. Error: {str(e)}")