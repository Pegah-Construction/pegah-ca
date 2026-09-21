// Client-safe: no server imports, so the public tender list can use it directly.

/**
 * Which portfolio group a live tender belongs to.
 *
 * Projects carry a controlled category ("ICI" or "Residential" from a dropdown),
 * but tenders don't: SmartBid hands us a free-text project type — "Apartment",
 * "Condominium", "Multi-Unit Residential", "Institutional" — so the group can't
 * be decided by comparing against the single word "Residential". Doing that put
 * every residential tender that wasn't spelled exactly that way under ICI.
 *
 * Matching is word-bounded on purpose. Without it "Warehousing" reads as
 * "housing" and files an industrial building under Residential. Bare "house" and
 * "home" are deliberately absent for the same reason — "Fire House" and
 * "Funeral Home" are institutional.
 */
export const RESIDENTIAL_TENDER_TYPE =
  /\b(?:residen\w*|apartments?|condos?|condominiums?|townhous\w*|townhom\w*|housing|dwellings?|duplex(?:es)?|triplex(?:es)?|fourplex(?:es)?|multi[\s-]?(?:family|unit|residential)|single[\s-]?family)\b/i;

export type TenderGroup = "ICI" | "Residential";

/**
 * `type` and `category` both come from the feed's project type and are usually
 * identical, but either can be the populated one, so both are considered.
 */
export function tenderGroupOf(t: { type?: string; category?: string }): TenderGroup {
  return RESIDENTIAL_TENDER_TYPE.test(`${t.category ?? ""} ${t.type ?? ""}`)
    ? "Residential"
    : "ICI";
}
