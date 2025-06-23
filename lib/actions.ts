"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function createContact(formData: FormData) {
  try {
    const contact = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      location: formData.get("location") as string,
      status: (formData.get("status") as string) || "Lead",
      tags: formData.get("tags") ? (formData.get("tags") as string).split(",").map((t) => t.trim()) : [],
      notes: formData.get("notes") as string,
    }

    const { data, error } = await supabase.from("contacts").insert([contact]).select().single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/contacts")
    return { success: true, data }
  } catch (error) {
    return { success: false, error: "Failed to create contact" }
  }
}

export async function createCampaign(formData: FormData) {
  try {
    const campaign = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      message_template: formData.get("message_template") as string,
      send_time: formData.get("send_time") as string,
      contact_filter: formData.get("contact_list") as string,
      status: "Draft",
    }

    const { data, error } = await supabase.from("campaigns").insert([campaign]).select().single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/campaigns")
    return { success: true, data }
  } catch (error) {
    return { success: false, error: "Failed to create campaign" }
  }
}

export async function sendMessage(formData: FormData) {
  try {
    const content = formData.get("content") as string
    const recipients = formData.get("recipients") as string
    const campaignTag = formData.get("campaign_tag") as string

    // Get contact IDs based on recipient selection
    let contactQuery = supabase.from("contacts").select("id")

    switch (recipients) {
      case "leads":
        contactQuery = contactQuery.eq("status", "Lead")
        break
      case "customers":
        contactQuery = contactQuery.eq("status", "Customer")
        break
      case "vip":
        contactQuery = contactQuery.contains("tags", ["VIP"])
        break
      // 'all' case doesn't need additional filtering
    }

    const { data: contacts, error: contactError } = await contactQuery

    if (contactError) {
      return { success: false, error: contactError.message }
    }

    // Create messages for all selected contacts
    const messages = contacts.map((contact) => ({
      contact_id: contact.id,
      content,
      status: "Sending",
      sent_at: new Date().toISOString(),
    }))

    const { data, error } = await supabase.from("messages").insert(messages).select()

    if (error) {
      return { success: false, error: error.message }
    }

    // Simulate delivery (in real app, integrate with SMS provider)
    setTimeout(async () => {
      await supabase
        .from("messages")
        .update({
          status: "Delivered",
          delivered_at: new Date().toISOString(),
        })
        .in(
          "id",
          data.map((m) => m.id),
        )
    }, 2000)

    revalidatePath("/messages")
    return {
      success: true,
      message: `Message sent to ${contacts.length} contacts`,
      data,
    }
  } catch (error) {
    return { success: false, error: "Failed to send message" }
  }
}

export async function logCall(formData: FormData) {
  try {
    const callLog = {
      contact_id: formData.get("contact_id") as string,
      duration: Number.parseInt(formData.get("duration") as string) || 0,
      status: formData.get("status") as string,
      notes: formData.get("notes") as string,
    }

    const { data, error } = await supabase.from("call_logs").insert([callLog]).select().single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Update contact's last_contacted timestamp
    await supabase.from("contacts").update({ last_contacted: new Date().toISOString() }).eq("id", callLog.contact_id)

    revalidatePath("/dialer")
    return { success: true, data }
  } catch (error) {
    return { success: false, error: "Failed to log call" }
  }
}
