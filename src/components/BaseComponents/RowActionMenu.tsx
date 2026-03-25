import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import React, { useState } from 'react';

export interface RowAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface Props {
  actions: RowAction[];
}

export default function RowActionMenu({ actions }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  if (actions.length === 0) return null;

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
        aria-label="Actions"
        sx={{ color: 'text.secondary' }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 160,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              borderRadius: '8px',
            },
          },
        }}
      >
        {actions.map((action) => (
          <MenuItem
            key={action.label}
            onClick={() => {
              action.onClick();
              setAnchorEl(null);
            }}
            sx={action.danger ? { color: 'error.main' } : {}}
          >
            {action.icon && (
              <ListItemIcon sx={action.danger ? { color: 'error.main' } : {}}>
                {action.icon}
              </ListItemIcon>
            )}
            <ListItemText>{action.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
