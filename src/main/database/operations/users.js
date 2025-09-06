/**
 * Users database operations
 */

export const getUsers = (db) => {
  const stmt = db.prepare('SELECT * FROM users ORDER BY name')
  return stmt.all()
}

export const getUserByGithubHandle = (db, githubHandle) => {
  const stmt = db.prepare('SELECT * FROM users WHERE github_handle = ?')
  return stmt.get(githubHandle)
}

export const addUser = (db, name, githubHandle) => {
  const stmt = db.prepare(`
    INSERT INTO users (name, github_handle) VALUES (?, ?)
  `)
  return stmt.run(name, githubHandle)
}

export const updateUser = (db, id, name, githubHandle) => {
  const stmt = db.prepare(`
    UPDATE users SET name = ?, github_handle = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
  return stmt.run(name, githubHandle, id)
}

export const deleteUser = (db, id) => {
  const stmt = db.prepare('DELETE FROM users WHERE id = ?')
  return stmt.run(id)
}

export const getUserById = (db, id) => {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
  return stmt.get(id)
}
