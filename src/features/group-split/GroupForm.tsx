interface GroupFormProps {
  group_id: string | null;
}

export default function GroupForm({ group_id }: GroupFormProps) {
  if (group_id != null) {
    return <p>edit form</p>;
  }
  return <p>new form</p>;
}
