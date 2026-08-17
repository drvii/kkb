import { colorForIndex, getInitials, unitId } from "@/lib/split-math";
import type { Split } from "@/lib/types";

/**
 * Fictional demo data for the /tour storyboard — never touches localStorage or the real
 * draft/history stores, so the page is safe to make public and never shows real user data.
 */

const PEOPLE = [
  { id: "tour-ana", name: "Ana" },
  { id: "tour-bea", name: "Bea" },
  { id: "tour-caloy", name: "Caloy" },
].map((p, i) => ({ ...p, color: colorForIndex(i), initials: getInitials(p.name), paid: false }));

const ITEM_SISIG = { id: "tour-sisig", name: "Sisig", quantity: 1, totalPrice: 220 };
const ITEM_PATA = { id: "tour-pata", name: "Crispy Pata", quantity: 1, totalPrice: 380 };
const ITEM_RICE = { id: "tour-rice", name: "Garlic Rice", quantity: 3, totalPrice: 90 };
const ITEM_TEA = { id: "tour-tea", name: "Iced Tea", quantity: 3, totalPrice: 165 };

const [ana, bea, caloy] = PEOPLE;

/** Fully-assigned Split — the end state, used by the Summary and Export steps. */
export const TOUR_SPLIT: Split = {
  id: "tour-split",
  name: "Friday night dinner",
  createdAt: new Date("2026-07-24T19:30:00+08:00").toISOString(),
  items: [ITEM_SISIG, ITEM_PATA, ITEM_RICE, ITEM_TEA],
  people: PEOPLE,
  assignments: {
    [unitId(ITEM_SISIG.id, 0)]: [ana.id, bea.id, caloy.id],
    [unitId(ITEM_PATA.id, 0)]: [ana.id, bea.id],
    [unitId(ITEM_RICE.id, 0)]: [ana.id],
    [unitId(ITEM_RICE.id, 1)]: [bea.id],
    [unitId(ITEM_RICE.id, 2)]: [caloy.id],
    [unitId(ITEM_TEA.id, 0)]: [ana.id],
    [unitId(ITEM_TEA.id, 1)]: [bea.id],
    [unitId(ITEM_TEA.id, 2)]: [caloy.id],
  },
  charges: { serviceCharge: 50, deliveryFee: 0 },
  discounts: [{ id: "tour-discount", label: "Senior/PWD", amount: 46, appliesTo: [caloy.id] }],
};

/** People step — nobody's ordered anything yet. */
export const TOUR_PEOPLE_SPLIT: Split = { ...TOUR_SPLIT, items: [], assignments: {}, discounts: [] };

/** Receipt step — items, service charge, and discount are in, nothing assigned yet (fresh off a scan). */
export const TOUR_RECEIPT_SPLIT: Split = { ...TOUR_SPLIT, assignments: {} };

/** Assign step — everything assigned except the Crispy Pata, mid-tap, Bea selected. */
export const TOUR_ASSIGN_SPLIT: Split = {
  ...TOUR_SPLIT,
  assignments: Object.fromEntries(
    Object.entries(TOUR_SPLIT.assignments).filter(([id]) => id !== unitId(ITEM_PATA.id, 0)),
  ),
};

export const TOUR_ACTIVE_PERSON_ID = bea.id;
