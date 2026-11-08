export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

export function isConflict(error) {
  const message = `${error?.message || ''} ${error?.cause?.message || ''}`
  return /unique|constraint/i.test(message)
}
