# Discounts are optional-assignment, unlike Items

PWD/Senior Citizen and similar receipt discounts legally apply to one diner's order, not the whole table — unlike Service Charge (ADR-0002), which is always split equally regardless of assignments. A Discount's amount and label are entered on the Receipt step (alongside Items and Service Charge — that step just lists what's on the receipt), but *who it applies to* is chosen on the Assign step, using the same tap-a-person/tap-a-row interaction and per-row sheet already built for Item Units.

Unlike Items, a Discount is never required to be assigned before continuing — it defaults to "Everyone" and `isFullyAssigned`/the assigned-count footer only ever consider Item Units. This lets a receipt with no discount, or a table-wide discount, skip the extra step entirely, while still allowing a Discount to be narrowed to the one diner who legally qualifies for it.
