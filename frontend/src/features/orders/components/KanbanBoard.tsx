import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCenter,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Container, Paper, Stack, Text, Badge, Group, Loader, Tabs } from '@mantine/core';
import { useState } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { OrderStatus } from '../../../types';
import type { Order } from '../../../types';
import { KanbanOrderCard } from './KanbanOrderCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  orders: Order[];
  onView: (id: number) => void;
  onStatusChange: (orderId: number, newStatus: OrderStatus) => void;
}

function KanbanColumn({ id, title, orders, onView, onStatusChange }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <Paper
      ref={setNodeRef}
      p="md"
      withBorder
      h="100%"
      style={{
        minHeight: '500px',
        backgroundColor: isOver ? 'var(--mantine-color-blue-0)' : 'var(--mantine-color-gray-0)',
        transition: 'background-color 0.2s',
      }}
    >
      <Stack gap="md" h="100%">
        <Group justify="space-between">
          <Text fw={600} size="lg">
            {title}
          </Text>
          <Badge size="lg" variant="light">
            {orders.length}
          </Badge>
        </Group>

        <Stack gap="sm" style={{ flex: 1, overflowY: 'auto' }}>
          <SortableContext items={orders.map((o) => o.id.toString())} strategy={verticalListSortingStrategy}>
            {orders.map((order) => (
              <SortableOrderCard key={order.id} order={order} onView={onView} onStatusChange={onStatusChange} />
            ))}
          </SortableContext>
          {orders.length === 0 && (
            <Text c="dimmed" size="sm" ta="center" py="xl">
              Нет заказов
            </Text>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

interface SortableOrderCardProps {
  order: Order;
  onView: (id: number) => void;
  onStatusChange: (orderId: number, newStatus: OrderStatus) => void;
}

function SortableOrderCard({ order, onView, onStatusChange }: SortableOrderCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanOrderCard order={order} onView={onView} onStatusChange={onStatusChange} />
    </div>
  );
}

interface KanbanBoardProps {
  orders: Order[];
  onView: (id: number) => void;
  onStatusChange: (orderId: number, newStatus: OrderStatus) => void;
}

function KanbanBoardDesktop({
  orders,
  onView,
  onStatusChange,
  isUpdating,
  activeOrder,
  sensors,
  onDragStart,
  onDragEnd,
}: {
  orders: Order[];
  onView: (id: number) => void;
  onStatusChange: (orderId: number, newStatus: OrderStatus) => void;
  isUpdating: boolean;
  activeOrder: Order | null;
  sensors: ReturnType<typeof useSensors>;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
}) {
  const newOrders = orders.filter((o) => o.status === OrderStatus.NEW);
  const assemblingOrders = orders.filter((o) => o.status === OrderStatus.ASSEMBLING);
  const transferredOrders = orders.filter((o) => o.status === OrderStatus.TRANSFERRED);

  return (
    <div style={{ position: 'relative' }}>
      {isUpdating && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <Loader size="lg" />
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            minHeight: '600px',
          }}
        >
          <KanbanColumn id="new" title="Новый" orders={newOrders} onView={onView} onStatusChange={onStatusChange} />
          <KanbanColumn id="assembling" title="В сборке" orders={assemblingOrders} onView={onView} onStatusChange={onStatusChange} />
          <KanbanColumn id="transferred" title="Передан курьеру" orders={transferredOrders} onView={onView} onStatusChange={onStatusChange} />
        </div>

        <DragOverlay>
          {activeOrder ? (
            <div style={{ opacity: 0.8, transform: 'rotate(5deg)' }}>
              <KanbanOrderCard order={activeOrder} onView={onView} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function KanbanBoardMobile({
  orders,
  onView,
  onStatusChange,
  isUpdating,
}: {
  orders: Order[];
  onView: (id: number) => void;
  onStatusChange: (orderId: number, newStatus: OrderStatus) => void;
  isUpdating: boolean;
}) {
  const newOrders = orders.filter((o) => o.status === OrderStatus.NEW);
  const assemblingOrders = orders.filter((o) => o.status === OrderStatus.ASSEMBLING);
  const transferredOrders = orders.filter((o) => o.status === OrderStatus.TRANSFERRED);

  const renderColumn = (id: string, title: string, items: Order[]) => (
    <Stack gap="md" key={id}>
      <Group justify="space-between">
        <Text fw={600} size="lg">
          {title}
        </Text>
        <Badge size="lg" variant="light">
          {items.length}
        </Badge>
      </Group>

      <Stack gap="sm">
        {items.map((order) => (
          <KanbanOrderCard key={order.id} order={order} onView={onView} onStatusChange={onStatusChange} />
        ))}
        {items.length === 0 && (
          <Text c="dimmed" size="sm" ta="center" py="xl">
            Нет заказов
          </Text>
        )}
      </Stack>
    </Stack>
  );

  return (
    <div style={{ position: 'relative' }}>
      {isUpdating && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <Loader size="lg" />
        </div>
      )}
      <Tabs defaultValue="new">
        <Tabs.List>
          <Tabs.Tab value="new" leftSection={<Badge size="sm">{newOrders.length}</Badge>}>
            Новый
          </Tabs.Tab>
          <Tabs.Tab value="assembling" leftSection={<Badge size="sm">{assemblingOrders.length}</Badge>}>
            В сборке
          </Tabs.Tab>
          <Tabs.Tab value="transferred" leftSection={<Badge size="sm">{transferredOrders.length}</Badge>}>
            Передан
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="new" pt="lg">
          <Paper p="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
            {renderColumn('new', '', newOrders)}
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="assembling" pt="lg">
          <Paper p="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
            {renderColumn('assembling', '', assemblingOrders)}
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="transferred" pt="lg">
          <Paper p="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
            {renderColumn('transferred', '', transferredOrders)}
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

export function KanbanBoard({ orders, onView, onStatusChange }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const orderId = parseInt(active.id as string);
    let targetColumnId = over.id as string;

    // Если перетащили на другой заказ, определяем его колонку по статусу
    if (targetColumnId !== 'new' && targetColumnId !== 'assembling' && targetColumnId !== 'transferred') {
      const targetOrder = orders.find((o) => o.id.toString() === targetColumnId);
      if (targetOrder) {
        switch (targetOrder.status) {
          case OrderStatus.NEW:
            targetColumnId = 'new';
            break;
          case OrderStatus.ASSEMBLING:
            targetColumnId = 'assembling';
            break;
          case OrderStatus.TRANSFERRED:
            targetColumnId = 'transferred';
            break;
          default:
            return;
        }
      } else {
        return;
      }
    }

    // Определяем новый статус на основе колонки
    let newStatus: OrderStatus;
    switch (targetColumnId) {
      case 'new':
        newStatus = OrderStatus.NEW;
        break;
      case 'assembling':
        newStatus = OrderStatus.ASSEMBLING;
        break;
      case 'transferred':
        newStatus = OrderStatus.TRANSFERRED;
        break;
      default:
        return;
    }

    // Находим текущий заказ
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.status === newStatus) {
      return;
    }

    setIsUpdating(true);
    try {
      await onStatusChange(orderId, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const activeOrder = activeId ? orders.find((o) => o.id.toString() === activeId) : null;

  return (
    <Container size="xl" style={{ position: 'relative' }}>
      {isMobile ? (
        <KanbanBoardMobile
          orders={orders}
          onView={onView}
          onStatusChange={onStatusChange}
          isUpdating={isUpdating}
        />
      ) : (
        <KanbanBoardDesktop
          orders={orders}
          onView={onView}
          onStatusChange={onStatusChange}
          isUpdating={isUpdating}
          activeOrder={activeOrder}
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />
      )}
    </Container>
  );
}

