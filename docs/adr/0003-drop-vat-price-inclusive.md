# Drop VAT as a separate Receipt Charge; item prices are VAT-inclusive

ADR-0002 established equal-split VAT and service charge as flat ₱ amounts. In practice, PH menu and receipt prices are already VAT-inclusive, so a separate VAT field double-counts tax that's baked into each Item's price. VAT is dropped from the domain model entirely — `Receipt Charges` now holds only the service charge, still entered as a flat ₱ amount and split equally across everyone. If a receipt ever itemizes VAT separately from menu pricing, that's out of scope for now.
