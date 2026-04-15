/**
 * @param {string} seed - seed string (user.avatarSeed or displayName)
 * @param {string} style - DiceBear style
 */
export function generateAvatarUrl(seed, style = 'adventurer') {
  if (!seed) return ''
  const validStyles = ['adventurer', 'adventurer-neutral', 'avataaars', 'bottts', 'initials', 'micah', 'pixel-art', 'fun-emoji']
  const avatarStyle = validStyles.includes(style) ? style : 'adventurer'
  return `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodeURIComponent(seed)}`
}

export function getAvatarSrc(userObj) {
  if (!userObj) return ''

  const { avatar, avatarSeed, avatarStyle, displayName } = userObj

  // full external URL (e.g. user selected a DiceBear URL from the profile picker)
  if (avatar && (avatar.startsWith('http://') || avatar.startsWith('https://'))) {
    return avatar
  }

  // local uploaded file — only trust it if it's not the generic default
  if (avatar && avatar !== 'avatar1.png' && !avatar.startsWith('avatar')) {
    return `/avatars/${avatar}`
  }

  // DiceBear from seed
  const seed = avatarSeed || displayName || 'user'
  return generateAvatarUrl(seed, avatarStyle || 'adventurer')
}
