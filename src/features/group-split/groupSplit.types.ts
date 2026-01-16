export type Entry = {
  timestamp: Date;
  description: string;
  date: Date;
  amount: number;
  user: string;
  installments: number;
  obs: string | null;
};
