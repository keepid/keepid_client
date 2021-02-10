import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';

interface FormatterProps {
  row: any,
  handleEdit: (event: any, row: any) => void,
  handleSave: (event: any, row: any) => void,
}

// This function controls formatting on the edit/save column (needed because of a glitch with the Edit/Save text)
export default function EditFormatter(props: FormatterProps): React.ReactElement {
  const [editing, setEditing] = useState(false);
  const toggleEditState = () => setEditing(!editing);

  const handleEdit = (e): void => {
    setEditing(true);
    props.handleEdit(e, props.row);
  };

  const handleSave = (e): void => {
    setEditing(false);
    props.handleSave(e, props.row);
  };

  return (
    <Button
      variant="link"
      className={`action table-button ${editing ? 'save-text' : 'edit-text'}`}
      onClick={(e) => (editing ? handleSave(e) : handleEdit(e))}
    >
      <div className="row align-items-center">
        <div className="d-none d-sm-block">{ editing ? 'Save' : 'Edit' }</div>
      </div>
    </Button>
  );
}
