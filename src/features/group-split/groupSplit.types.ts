export type Group = {
  id: string;
  name: string;
  created_at: Date;
  members: GroupMemeber[];
};

export type GroupMemeber = {
  id: string;
  user_id: string | null;
  name: string;
};

export type Entry = {
  id: string;
  created_at: Date;
  description: string;
  date: Date;
  amount: number;
  user: string;
  installments: number;
  installment: number;
  obs: string | null;
  payment_type: "credit-card" | "debit-card" | "pix" | "boleto" | "cash";
};
