import { useState } from "react";
import type { Entry } from "./groupSplit.types";
import DataTable from "@/components/DataTable";
import { columns } from "./groupSplit.columns";

const defaultData: Entry[] = [
  {
    timestamp: new Date(),
    description: "Condominio",
    date: new Date("2025-12-08"),
    amount: 236.18,
    user: "Lucas",
    installments: 1,
    obs: null,
  },
];

interface GroupSplitProps {
  groupId: string | null;
}

export default function GroupSplit({ groupId }: GroupSplitProps) {
  const [data] = useState<Entry[]>([...defaultData]);

  if (groupId === null) {
    // return (
    //   <>
    //     <p>No group Id</p>
    //   </>
    // );
  }

  return <DataTable<Entry> data={data} columns={columns} />;
}
