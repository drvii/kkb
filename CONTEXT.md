# KKB (Kanya-Kanyang Bayad)

A mobile-first, fully client-side app for splitting a restaurant bill among the people at the table by digitizing a receipt and assigning items to people.

## Language

**Split**:
One complete instance of the bill-splitting flow — has a Name (user-editable, defaults to "New Split"), a Receipt, a list of People, Assignments linking items to people, and computed Totals per person. This is the unit saved to history. The Name is set on the SPLIT step, shows on the exported/shared image, and identifies the Split in Recent Splits (both the homepage preview and the full history list).
_Avoid_: Session, Bill

**Receipt**:
The raw set of digitized or manually-entered line Items (name + price) that make up a bill, before any splitting happens.
_Avoid_: Bill (ambiguous with the finished Split)

**Person**:
Someone at the table who items get assigned to. Gets a unique color and initials-based icon. UI copy refers to these collectively as "people at the table." Also carries a Paid flag, scoped to the Split it belongs to (see **Paid**).
_Avoid_: Diner, Guest, User

**Paid**:
A boolean fact about one Person within one Split — whether they've settled their share. Scoped to the (Person, Split) pair, not a global property of the person: the same person can be Paid in one Split and unpaid in another, and Paid always starts false for every Person in a new or Rebuilt Split. Purely a manual, user-toggled bookkeeping flag — it does not affect any computed Total and has no bearing on whether a Split itself is "done." Shown on the Summary and History-detail breakdowns, and reflected in the exported/shared image.
_Avoid_: Settled (reserve for a possible future whole-Split-is-done state, which this is not)

**Item**:
A line entry on a Receipt (name, quantity, total price). Decomposes into one or more Units based on quantity.

**Unit**:
One individual instance within an Item's quantity — the atomic thing assignable to one or more People. An Item with quantity 1 has exactly one Unit. Each Unit's price is the Item's total price divided evenly by its quantity, and renders as its own tappable row in the assignment UI.

**Assignment**:
The link between a Unit and the one or more People sharing it. When multiple People share a Unit, its price splits equally among them.
_Avoid_: Split (reserved for the whole flow instance)

**Rebuild**:
Starting a new Split from an existing one — carries over its People, Items, and Charges into a fresh draft, but discards its Assignments (since edited Items can invalidate old ones) and resets everyone's Paid flag to unpaid (a Rebuilt Split is a fresh, not-yet-settled instance). Used from a saved Split's history detail page when the user spots a missing Item or typo after the fact; lands on the Receipt step so they can fix it, then re-does Assign/Summary. The original saved Split is untouched.
_Avoid_: Duplicate, Clone, Copy, Edit (this creates a new Split, it does not modify the saved one)

**Receipt Charges**:
The service charge, entered as a flat ₱ amount on the Receipt (not itemized, not percentage-based) and split equally across every Person on the Split regardless of their Assignments. VAT is not tracked separately — Item prices are assumed VAT-inclusive, as is standard on PH receipts. See ADR-0002, ADR-0003. Distinct from **Discount**, which can target specific People instead of always being table-wide.

**Discount**:
A named deduction from the Receipt subtotal (e.g. "PWD", "Senior Citizen"), entered as a flat ₱ amount — one or more per Receipt. Its label and amount are entered on the Receipt step, but who it applies to is chosen on the Assign step (like a Unit's Assignment): either specific People (its amount splits equally among just those selected, deducted from their share) or Everyone (splits equally across the whole table, like Service Charge, and the default for a new Discount). Unlike an Item's Units, a Discount is never required to be assigned before continuing. Unlike Receipt Charges, it can target specific People rather than always being table-wide. See ADR-0005.
_Avoid_: Deduction, Rebate
