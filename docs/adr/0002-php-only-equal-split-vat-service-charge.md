# Single currency (PHP), no locale picker; VAT/service charge split equally

A currency picker (swap-the-display-symbol only) was initially planned, but surfaced a deeper issue: how tax and service charge get allocated across a Split isn't just a currency-symbol difference — it's a country-specific social/computation convention (proportional vs. equal split, whether service charge is even customary, etc.). Rather than build per-locale computation rules, KKB targets the Philippines only: currency is hardcoded to ₱ (PHP), with no picker, and VAT/service charge are split equally across all People on a Split — matching common social practice in the Philippines, rather than proportional allocation by subtotal share.

If international support is ever added, it requires real per-country computation rules, not a symbol swap — treat that as a new feature, not a UI tweak.
