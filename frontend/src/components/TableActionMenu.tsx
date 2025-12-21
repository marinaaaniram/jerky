import React from 'react';
import { Menu, ActionIcon } from '@mantine/core';
import { IconDots } from '@tabler/icons-react';

export interface TableActionItem {
  label: string;
  onClick: () => void;
  color?: string;
  icon?: React.ReactNode;
  visible?: boolean;
}

export interface TableActionMenuProps {
  actions: TableActionItem[];
}

export const TableActionMenu: React.FC<TableActionMenuProps> = ({ actions }) => {
  const visibleActions = actions.filter((action) => action.visible !== false);

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <Menu shadow="md" position="bottom-end" withArrow>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" size="xs">
          <IconDots size={16} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {visibleActions.map((action, index) => (
          <Menu.Item
            key={index}
            onClick={action.onClick}
            color={action.color}
            leftSection={action.icon}
          >
            {action.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};
