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
};

export type ReceiptCharges = {
  serviceCharge: number;
};

/** unitId -> personIds sharing that unit */
export type Assignments = Record<string, string[]>;

export type Split = {
  id: string;
  createdAt: string;
  items: Item[];
  people: Person[];
  assignments: Assignments;
  charges: ReceiptCharges;
};

export type Unit = {
  unitId: string;
  itemId: string;
  index: number;
  item: Item;
};
