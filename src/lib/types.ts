export type Item = {
  id: string;
  name: string;
  quantity: number;
  totalPrice: number;
};

export type Person = {
  id: string;
  name: string;
  color: string;
  initials: string;
  paid: boolean;
};

export type ReceiptCharges = {
  serviceCharge: number;
};

/** "everyone" splits equally across the whole table; a string[] names the specific Person ids it splits across. */
export type DiscountTarget = "everyone" | string[];

export type Discount = {
  id: string;
  label: string;
  amount: number;
  appliesTo: DiscountTarget;
};

/** unitId -> personIds sharing that unit */
export type Assignments = Record<string, string[]>;

export type Split = {
  id: string;
  name: string;
  createdAt: string;
  items: Item[];
  people: Person[];
  assignments: Assignments;
  charges: ReceiptCharges;
  discounts: Discount[];
};

export type Unit = {
  unitId: string;
  itemId: string;
  index: number;
  item: Item;
};
