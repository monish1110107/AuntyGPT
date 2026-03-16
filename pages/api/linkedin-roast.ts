import type { NextApiRequest, NextApiResponse } from 'next'
import Anthropic from '@anthropic-ai/sdk'
import { AUNTY_PERSONAS } from '@/components/personas'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) { rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 }); return false }
  if (entry.count >= 10) return true
  entry.count++
  return false
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown'
  if (isRateLimited(ip)) return res.status(429).json({ error: 'Too many requests. Try again in a minute! 🙏' })

  const { linkedinText, auntyId } = req.body

  if (!linkedinText || !auntyId) {
    return res.status(400).json({ error: 'Missing data' })
  }

  const persona = AUNTY_PERSONAS.find(a => a.id === auntyId)
  if (!persona) {
    return res.status(400).json({ error: 'Invalid aunty' })
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: persona.systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Here is someone's LinkedIn profile/bio/headline:

"${linkedinText}"

Roast this LinkedIn profile as ${persona.name} would on WhatsApp. Comment on their job title, their career choices, how many companies they've switched, what they should have done instead (IIT/IAS/family business/get married). Be funny, exaggerated, and on-brand. 100-150 words. Plain text with emojis, no markdown.`
        }
      ]
    })

    const response = message.content[0].type === 'text' ? message.content[0].text : ''
    return res.status(200).json({ response, auntyName: persona.name, auntyEmoji: persona.emoji })
  } catch (error: unknown) {
    console.error('LinkedIn roast error:', error)
    const message = error instanceof Error ? error.message : 'Failed'
    return res.status(500).json({ error: message })
  }
}
