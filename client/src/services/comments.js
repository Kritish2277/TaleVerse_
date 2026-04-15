import { apiFetch } from './api'

export const getComments = (storyId, token) =>
  apiFetch(`/stories/${storyId}/comments`, { token })

export const addComment = (storyId, { content, parentCommentId }, token) =>
  apiFetch(`/stories/${storyId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, parentCommentId }),
    token
  })

export const toggleCommentLike = (commentId, token) =>
  apiFetch(`/comments/${commentId}/like`, { method: 'POST', token })
