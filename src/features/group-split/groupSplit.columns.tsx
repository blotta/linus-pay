import { type ColumnDef } from "@tanstack/react-table";
import type { Entry } from "./groupSplit.types";
import { FormatNumber, LocaleProvider } from "@chakra-ui/react";

export const columns: ColumnDef<Entry>[] = [
  {
    accessorKey: "timestamp",
    header: "CreatedAt",
    cell: (info) => (info.getValue() as Date).toDateString(),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: (info) => (info.getValue() as Date).toDateString(),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: (info) => (
      <LocaleProvider locale="pt-br">
        <FormatNumber
          style="currency"
          currency="BRL"
          value={info.getValue() as number}
        />
      </LocaleProvider>
    ),
  },
  {
    accessorKey: "user",
    header: "User",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "installments",
    header: "Installments",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "obs",
    header: "Obs",
    cell: (info) => info.getValue(),
  },
];
