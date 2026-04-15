import { apiFetch } from './api'

export async function voteContribution(contributionId, {value, token}){
  return apiFetch(`/votes/${contributionId}`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({value}),
    token
  })
}
