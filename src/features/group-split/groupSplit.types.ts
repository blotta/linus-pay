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
  user: string;
  installments: number;
  installment: number;
  obs: string | null;
  payment_type: "credit-card" | "debit-card" | "pix" | "boleto" | "cash";
};
