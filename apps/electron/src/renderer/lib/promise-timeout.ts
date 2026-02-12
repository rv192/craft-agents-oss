export type PromiseSettleResult<T> =
  | { status: 'resolved'; value: T }
  | { status: 'rejected'; reason: unknown }
  | { status: 'timed_out' }

export async function settlePromiseWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<PromiseSettleResult<T>> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const wrappedPromise: Promise<PromiseSettleResult<T>> = promise
    .then((value) => ({ status: 'resolved', value }) as const)
    .catch((reason) => ({ status: 'rejected', reason }) as const)

  const timeoutPromise: Promise<PromiseSettleResult<T>> = new Promise((resolve) => {
    timeoutId = setTimeout(() => {
      resolve({ status: 'timed_out' })
    }, timeoutMs)
  })

  const result = await Promise.race([wrappedPromise, timeoutPromise])

  if (timeoutId) {
    clearTimeout(timeoutId)
  }

  return result
}
