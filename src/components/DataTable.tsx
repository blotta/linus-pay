import { Table } from "@chakra-ui/react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
};

export default function DataTable<T>({ data, columns }: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table.Root>
      <Table.Caption />
      <Table.Header>
        {table.getHeaderGroups().map((hg) => (
          <Table.Row key={hg.id}>
            {hg.headers.map((header) => (
              <Table.ColumnHeader key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        ))}
      </Table.Header>
      <Table.Body>
        {table.getRowModel().rows.map((row) => (
          <Table.Row key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <Table.Cell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
      <Table.Footer>
        {table.getFooterGroups().map((fg) => (
          <Table.Row key={fg.id}>
            {fg.headers.map((header) => (
              <Table.ColumnHeader key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.footer,
                      header.getContext(),
                    )}
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        ))}
      </Table.Footer>
    </Table.Root>
  );
}
