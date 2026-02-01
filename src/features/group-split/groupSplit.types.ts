// enums
export const PAYMENT_TYPES = [
  "credit-card",
  "debit-card",
  "pix",
  "boleto",
  "cash",
] as const;

export type PaymentType = (typeof PAYMENT_TYPES)[number];

export function labelForPaymentType(type: PaymentType): string {
  switch (type) {
    case "credit-card":
      return "Credit Card";
    case "debit-card":
      return "Debit Card";
    case "pix":
      return "Pix";
    case "boleto":
      return "Boleto";
    case "cash":
      return "Cash";
  }
}

export const SPLIT_TYPES = ["percentage", "amount", "remainder"] as const;

export type SplitType = (typeof SPLIT_TYPES)[number];

export function labelForSplitType(type: SplitType): string {
  switch (type) {
    case "percentage":
      return "Percentage";
    case "amount":
      return "Amount";
    case "remainder":
      return "Remainder";
  }
}

// models
export type Group = {
  id: string;
  name: string;
  created_at: Date;
  admin_id: string;
  members: GroupMember[];
};

export type GroupMember = {
  id: string;
  user_id: string | null;
  name: string;
  group_id: string;
  created_at: Date;
};

export type Entry = {
  id: string;
  created_at: Date;
  group_id: string;
  member_id: string;
  description: string;
  date: Date;
  amount: number;
  installment: number;
  installments: number;
  obs: string | null;
  payment_type: PaymentType;
  splits: EntrySplit[];
};

export type EntrySplit = {
  // id: string;
  entry_id: string;
  member_id: string;
  split_type: SplitType;
  amount: number | null;
  percentage: number | null;
};
