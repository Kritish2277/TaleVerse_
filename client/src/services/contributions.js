import { apiFetch } from './api'

export async function listContributions(storyId, token){
  return apiFetch(`/stories/${storyId}/contributions`, { token })
}

export async function addContribution(storyId, {content, token}){
  return apiFetch(`/stories/${storyId}/contributions`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({content}),
    token
  })
}

export async function updateContributionStatus(storyId, contributionId, status, token){
  return apiFetch(`/stories/${storyId}/contributions/${contributionId}/status`, {
    method: 'PATCH',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({status}),
    token
  })
}
