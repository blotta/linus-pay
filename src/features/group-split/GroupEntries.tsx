import DataTable from "@/components/DataTable";
import { useGroupSplit } from "./useGroupSplit";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Entry } from "./groupSplit.types";
import { FormatNumber, LocaleProvider } from "@chakra-ui/react";
import { useEntries } from "./useEntries";
import { formatDate } from "@/utils/date";

export default function GroupEntries() {
  const { selectedGroup, loadingGroup } = useGroupSplit();
  const { entries, loading: loadingEntries } = useEntries(selectedGroup!.id);

  const memberById = useMemo(() => {
    return new Map(selectedGroup?.members.map((m) => [m.id, m]));
  }, [selectedGroup]);

  const columns = useMemo<ColumnDef<Entry>[]>(
    () => [
      {
        header: "Date",
        accessorKey: "date",
        cell: (info) => formatDate(info.getValue() as Date, "dd/MM/yyyy"),
      },
      {
        header: "Description",
        accessorKey: "description",
        cell: (info) => info.getValue(),
      },
      {
        header: "Amount",
        accessorKey: "amount",
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
        header: "Payment Type",
        accessorKey: "payment_type",
        cell: (info) => info.getValue(),
      },
      {
        header: "Member",
        accessorKey: "member_id",
        cell: (info) => {
          const mid = info.getValue() as string;
          return memberById.get(mid)?.name;
        },
      },
      {
        header: "Installments",
        accessorFn: (entry) => {
          if (entry.installments == 1) {
            return "1";
          }
          return `${entry.installment}/${entry.installments}`;
        },
        // accessorKey: "installments",
        // cell: (info) => info.getValue(),
      },
      {
        header: "Obs",
        accessorKey: "obs",
        cell: (info) => info.getValue(),
      },
    ],
    [memberById],
  );

  if (loadingGroup || loadingEntries) {
    return (
      <>
        <p>loading</p>
      </>
    );
  }

  return <DataTable data={entries} columns={columns} />;
}
