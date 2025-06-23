import twilio from "twilio"

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.warn("Twilio credentials not configured. SMS functionality will be disabled.")
}

export const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null

export interface SendSMSParams {
  to: string
  message: string
  contactId?: string
  campaignId?: string
}

export interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
  status?: string
}

export async function sendSMS({ to, message, contactId, campaignId }: SendSMSParams): Promise<SMSResult> {
  if (!twilioClient || !twilioPhoneNumber) {
    return {
      success: false,
      error: "Twilio not configured",
    }
  }

  try {
    // Clean phone number (remove any formatting)
    const cleanPhone = to.replace(/[^\d+]/g, "")

    // Send SMS via Twilio
    const twilioMessage = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: cleanPhone,
      // Optional: Add status callback URL for delivery receipts
      // statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/webhook`
    })

    console.log(`SMS sent successfully: ${twilioMessage.sid}`)

    return {
      success: true,
      messageId: twilioMessage.sid,
      status: twilioMessage.status,
    }
  } catch (error: any) {
    console.error("Twilio SMS error:", error)

    return {
      success: false,
      error: error.message || "Failed to send SMS",
    }
  }
}

export async function getSMSStatus(messageId: string) {
  if (!twilioClient) {
    return null
  }

  try {
    const message = await twilioClient.messages(messageId).fetch()
    return {
      status: message.status,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
      dateUpdated: message.dateUpdated,
    }
  } catch (error) {
    console.error("Error fetching SMS status:", error)
    return null
  }
}
