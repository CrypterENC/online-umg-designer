import { NextApiRequest, NextApiResponse } from 'next'

let cache: { isBuilding: boolean; checkedAt: number } | null = null

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const now = Date.now()
  // Cache for 10 seconds to respect GitHub API rate limits
  if (cache && now - cache.checkedAt < 10000) {
    return res.status(200).json(cache)
  }

  try {
    const headers: Record<string, string> = {
      'User-Agent': 'online-umg-designer',
      'Accept': 'application/vnd.github.v3+json',
    }
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`
    }

    const depsResp = await fetch('https://api.github.com/repos/CrypterENC/online-umg-designer/deployments', { headers })
    if (!depsResp.ok) {
      throw new Error(`GitHub API deployments error: ${depsResp.statusText}`)
    }
    const deployments = await depsResp.json()
    if (!Array.isArray(deployments) || deployments.length === 0) {
      cache = { isBuilding: false, checkedAt: now }
      return res.status(200).json(cache)
    }

    // Find the latest Vercel production deployment
    const prodDep = deployments.find((d: any) => d.environment === 'Production')
    if (!prodDep) {
      cache = { isBuilding: false, checkedAt: now }
      return res.status(200).json(cache)
    }

    // Fetch status list for this deployment
    const statResp = await fetch(`https://api.github.com/repos/CrypterENC/online-umg-designer/deployments/${prodDep.id}/statuses`, { headers })
    if (!statResp.ok) {
      throw new Error(`GitHub API statuses error: ${statResp.statusText}`)
    }
    const statuses = await statResp.json()
    const latestState = statuses[0]?.state

    const isBuilding = latestState === 'pending'
    cache = { isBuilding, checkedAt: now }
    return res.status(200).json(cache)
  } catch (error) {
    console.error('Error fetching build status:', error)
    return res.status(200).json({ isBuilding: cache?.isBuilding || false, error: (error as Error).message })
  }
}
