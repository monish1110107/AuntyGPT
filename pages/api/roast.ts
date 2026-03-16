import type { NextApiRequest, NextApiResponse } from 'next'
import Anthropic from '@anthropic-ai/sdk'
import { AUNTY_PERSONAS } from '@/components/personas'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Simple in-memory rate limiter: max 10 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return false
  }
  if (entry.count >= 10) return true
  entry.count++
  return false
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown'
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Arre beta, thoda ruko! Too many requests. Try again in a minute. 🙏' })
  }

  const { situation, auntyId } = req.body

  if (!situation || !auntyId) {
    return res.status(400).json({ error: 'Missing situation or auntyId' })
  }

  if (situation.length > 500) {
    return res.status(400).json({ error: 'Situation too long (max 500 chars)' })
  }

  const persona = AUNTY_PERSONAS.find(a => a.id === auntyId)
  if (!persona) {
    return res.status(400).json({ error: 'Invalid aunty persona' })
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: persona.systemPrompt,
      messages: [
        {
          role: 'user',
          content: `The person says: "${situation}"

Respond as ${persona.name} would on WhatsApp. Be funny, over-the-top caring, and on-brand for your personality. Keep it 100-150 words max. Do NOT use markdown formatting. Just plain text with emojis. Sound like a real WhatsApp message.`
        }
      ]
    })

    const response = message.content[0].type === 'text' ? message.content[0].text : ''

    return res.status(200).json({
      response,
      auntyName: persona.name,
      auntyEmoji: persona.emoji
    })
  } catch (error: unknown) {
    console.error('Anthropic API error:', error)
    const message = error instanceof Error ? error.message : 'Failed to get aunty response'
    return res.status(500).json({ error: message })
  }
}
