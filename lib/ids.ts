export function extractId(obj: Record<string, any>): string | null {
  return obj?.id ?? obj?._id ?? obj?.uuid ?? null;
}