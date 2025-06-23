import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured using the correct environment variable names
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Supabase not configured. CSV upload requires database connection." },
        { status: 501 },
      )
    }

    const { supabase } = await import("@/lib/supabase")

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split("\n").filter((line) => line.trim())

    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV file must have at least a header and one data row" }, { status: 400 })
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
    const contacts = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, "")) // Remove quotes
      const contact: any = {}

      headers.forEach((header, index) => {
        const value = values[index] || ""
        switch (header) {
          case "name":
            contact.name = value
            break
          case "phone":
            contact.phone = value
            break
          case "email":
            contact.email = value
            break
          case "address":
            contact.address = value
            break
          case "city":
            contact.city = value
            break
          case "state":
            contact.state = value
            break
          case "zipcode":
          case "zip_code":
          case "zip":
            contact.zipcode = value
            break
          case "location":
            contact.location = value
            break
          case "status":
            contact.status = value || "Lead"
            break
          case "tags":
            contact.tags = value ? value.split(";").map((t) => t.trim()) : []
            break
          case "notes":
            contact.notes = value
            break
        }
      })

      if (contact.name && contact.phone) {
        contacts.push(contact)
      }
    }

    if (contacts.length === 0) {
      return NextResponse.json({ error: "No valid contacts found in CSV" }, { status: 400 })
    }

    const { data, error } = await supabase.from("contacts").insert(contacts).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: `Successfully imported ${data.length} contacts`,
      data,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
