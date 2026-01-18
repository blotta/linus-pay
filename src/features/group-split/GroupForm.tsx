import { Field, Input } from "@chakra-ui/react";
import { forwardRef, useImperativeHandle, useState, type Ref } from "react";
import type { FormHandle } from "@/components/FormDrawer";
import { useGroupSplit } from "./useGroupSplit";
import { useNavigate } from "react-router";

interface GroupFormProps {
  group_id: string | null;
  onUpdateLoading?: (val: boolean) => void;
}

const GroupForm = forwardRef((props: GroupFormProps, ref: Ref<FormHandle>) => {
  const [name, setName] = useState<string>("");
  const { createGroup, loadingGroupCreateUpdateDelete } = useGroupSplit();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (props.group_id == null) {
      // new group
      props.onUpdateLoading?.(true);
      const id = await createGroup(name);
      props.onUpdateLoading?.(false);
      if (id) {
        navigate(`/group-split/${id}`);
      }
    } else {
      // update group
    }
  };

  useImperativeHandle(ref, () => ({
    triggerSubmit: handleSubmit,
  }));

  if (props.group_id != null) {
    return <p>edit form</p>;
  }

  return (
    <>
      <Field.Root disabled={loadingGroupCreateUpdateDelete}>
        <Field.Label>Name</Field.Label>
        <Input
          type="text"
          required
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
      </Field.Root>
    </>
  );
});

export default GroupForm;
