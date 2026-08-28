export function gapRegisterSlug(serviceId: string, gapId: string) {
  return `${serviceId}-${gapId}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
