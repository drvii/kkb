# KKB (Kanya-Kanyang Bayad)

A mobile-first, fully client-side app for splitting a restaurant bill among the people at the table by digitizing a receipt and assigning items to people.

## Language

**Split**:
One complete instance of the bill-splitting flow — has a Receipt, a list of People, Assignments linking items to people, and computed Totals per person. This is the unit saved to history.
_Avoid_: Session, Bill

**Receipt**:
The raw set of digitized or manually-entered line Items (name + price) that make up a bill, before any splitting happens.
_Avoid_: Bill (ambiguous with the finished Split)

**Person**:
Someone at the table who items get assigned to. Gets a unique color and initials-based icon. UI copy refers to these collectively as "people at the table."
_Avoid_: Diner, Guest, User

**Item**:
A line entry on a Receipt (name, quantity, total price). Decomposes into one or more Units based on quantity.

**Unit**:
One individual instance within an Item's quantity — the atomic thing assignable to one or more People. An Item with quantity 1 has exactly one Unit. Each Unit's price is the Item's total price divided evenly by its quantity, and renders as its own tappable row in the assignment UI.

**Assignment**:
The link between a Unit and the one or more People sharing it. When multiple People share a Unit, its price splits equally among them.
_Avoid_: Split (reserved for the whole flow instance)

**Receipt Charges**:
The service charge, entered as a flat ₱ amount on the Receipt (not itemized, not percentage-based) and split equally across every Person on the Split regardless of their Assignments. VAT is not tracked separately — Item prices are assumed VAT-inclusive, as is standard on PH receipts. See ADR-0002, ADR-0003.
