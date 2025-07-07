import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const from = req.body.From || "Unknown"
  const to = req.body.To || "Unknown"
  const body = req.body.Body || ""

  console.log("🚀 verify-hook hit")
  console.log("📨 Incoming message:", { from, to, body })

  return res.status(200).json({ success: true })
}
