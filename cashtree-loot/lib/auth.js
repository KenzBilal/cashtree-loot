export function requireUser(session) {
  if (!session?.user) {
    throw new Error('UNAUTHORIZED');
  }
  return session.user;
}

export function requireAdmin(user) {
  if (user.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }
}
