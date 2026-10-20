/**
 * Evaluates whether a given customer / business is eligible to use the
 * Review Assistant feature.
 *
 * Designed as an isolated entitlement check so future subscription / Pro-tier
 * logic can be introduced in a single place without modifying callers.
 *
 * @param {object|null|undefined} business - Customer record or public profile object
 * @returns {boolean} True if Review Assistant is enabled and accessible
 */
export function canUseReviewAssistant(business) {
  if (!business || typeof business !== "object") {
    return false;
  }

  // Active check (if is_active field is present, respect it)
  if (business.is_active === false) {
    return false;
  }

  return Boolean(business.review_assistant_enabled);
}
