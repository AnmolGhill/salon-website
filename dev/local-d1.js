/**
 * Dev-only stand-in for the Cloudflare D1 binding.
 * Production bookings go through the same functions against real D1.
 */
import { mkdirSync, readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const schema = readFileSync(join(root, 'schema.sql'), 'utf8')

function enqueueOn(db) {
  let chain = Promise.resolve()
  return function enqueue(task) {
    const run = chain.then(task)
    chain = run.then(() => {}, () => {})
    return run
  }
}

export function createLocalD1(filename = join(root, '.data', 'bookings.sqlite')) {
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true })
  const db = new DatabaseSync(filename)
  db.exec(schema)
  const enqueue = enqueueOn(db)

  function statement(sql) {
    const runSync = (...params) => {
      const info = db.prepare(sql).run(...params)
      return {
        meta: {
          last_row_id: Number(info.lastInsertRowid),
          changes: Number(info.changes),
        },
      }
    }
    return {
      bind(...params) {
        return {
          all: () => enqueue(() => ({ results: db.prepare(sql).all(...params) })),
          run: () => enqueue(() => runSync(...params)),
          runSync: () => runSync(...params),
        }
      },
    }
  }

  return {
    prepare: statement,
    batch(statements) {
      return enqueue(() => {
        db.exec('BEGIN IMMEDIATE')
        try {
          const results = statements.map((entry) => entry.runSync())
          db.exec('COMMIT')
          return results
        } catch (error) {
          db.exec('ROLLBACK')
          throw error
        }
      })
    },
  }
}

export function loadDevVars(file = join(root, '.dev.vars')) {
  let text = ''
  try {
    text = readFileSync(file, 'utf8')
  } catch {
    return {}
  }
  const env = {}
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const splitAt = trimmed.indexOf('=')
    if (splitAt < 1) continue
    env[trimmed.slice(0, splitAt).trim()] = trimmed.slice(splitAt + 1).trim()
  }
  return env
}

export function configuredSecret(value) {
  if (!value || value.startsWith('replace_with')) return undefined
  return value
}
