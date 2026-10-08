import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadState, saveState } from '../services/storage';

const HotelContext = createContext(null);
export const useHotel = () => useContext(HotelContext);

const ROOM_NEXT = {
  Clean: ['Occupied', 'Dirty', 'Cleaning', 'Maintenance'],
  Dirty: ['Cleaning', 'Maintenance'],
  Cleaning: ['Inspected', 'Dirty', 'Maintenance'],
  Inspected: ['Available', 'Cleaning', 'Maintenance'],
  Maintenance: ['Cleaning', 'Available'],
  Occupied: ['Dirty', 'Maintenance'],
  Available: ['Occupied', 'Dirty', 'Cleaning', 'Maintenance'],
};

function prependRoomHistory(state, room, to, by, comment, taskId = '') {
  const at = new Date().toISOString();
  const staffId = state.staff.find((staff) => staff.name === by)?.id || '';
  const event = { id: `RH-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, roomId: room.id, from: room.status, to, at, by, staffId, comment };
  const taskEvent = { id: `TH-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, taskId, roomId: room.id, staffId, action: to === 'Inspected' ? 'Room Inspected' : 'Room Status Changed', from: room.status, to, at, by, comment };
  return { ...state, roomHistory: [event, ...state.roomHistory], taskHistory: [taskEvent, ...state.taskHistory] };
}

export function HotelProvider({ children }) {
  const [data, setData] = useState(loadState);
  const [toast, setToast] = useState(null);
  useEffect(() => { saveState(data); }, [data]);

  const notify = (message, severity = 'success') => setToast({ message, severity });
  const updateSettings = (patch) => setData((state) => ({ ...state, settings: { ...state.settings, ...patch } }));
  const putRoom = useCallback((room) => setData((state) => ({ ...state, rooms: state.rooms.map((item) => item.id === room.id ? room : item) })), []);
  const addRoom = (room) => setData((state) => ({ ...state, rooms: [...state.rooms, { ...room, id: `R${Date.now()}-${Math.random().toString(36).slice(2, 5)}` }] }));
  const deleteRoom = (id) => setData((state) => ({ ...state, rooms: state.rooms.filter((room) => room.id !== id) }));
  const addStaff = (staff) => setData((state) => ({ ...state, staff: [...state.staff, { ...staff, id: `S${Date.now()}-${Math.random().toString(36).slice(2, 5)}` }] }));
  const updateStaff = (staff) => setData((state) => ({ ...state, staff: state.staff.map((item) => item.id === staff.id ? staff : item) }));
  const deleteStaff = (id) => setData((state) => ({ ...state, staff: state.staff.filter((staff) => staff.id !== id) }));

  const changeRoom = (id, to, by = 'Housekeeping', comment = '') => setData((state) => {
    const room = state.rooms.find((item) => item.id === id);
    if (!room || !ROOM_NEXT[room.status]?.includes(to)) return state;
    const updated = {
      ...room,
      status: to,
      ...(to === 'Clean' ? { lastCleaned: new Date().toISOString() } : {}),
      ...(to === 'Inspected' ? { lastInspected: new Date().toISOString() } : {}),
      ...(to === 'Occupied' ? { guest: room.guest || 'Guest' } : {}),
      ...(['Dirty', 'Available'].includes(to) ? { guest: '' } : {}),
    };
    let next = { ...state, rooms: state.rooms.map((item) => item.id === id ? updated : item) };
    next = prependRoomHistory(next, room, to, by, comment);
    return next;
  });

  const assignTask = (payload) => {
    const state = data;
    const room = state.rooms.find((item) => item.id === payload.roomId);
    const staff = state.staff.find((item) => item.id === payload.staffId && item.status === 'Active');
    if (!room || !staff || ['Occupied', 'Cleaning'].includes(room.status)) return null;
    if (room.status === 'Maintenance' && payload.type !== 'Maintenance Follow-up') return null;
    const now = new Date().toISOString();
    const serial = state.tasks.reduce((max, task) => {
      const match = task.number?.match(/^HK-\d{4}-(\d+)$/);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0) + 1;
    const assignedAt = payload.assignedDate ? new Date(`${payload.assignedDate}T12:00:00`).toISOString() : now;
    const task = { ...payload, id: `T${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, number: `HK-${new Date().getFullYear()}-${String(serial).padStart(4, '0')}`, status: 'Assigned', assignedAt, startAt: null, completedAt: null };
    setData((current) => {
      let next = {
        ...current,
        tasks: [task, ...current.tasks],
        taskHistory: [
          { id: `TH-${Date.now()}-created`, taskId: task.id, action: 'Task Created', from: '', to: 'Pending', at: now, by: 'System', comment: 'Task record created' },
          { id: `TH-${Date.now()}-assigned`, taskId: task.id, action: 'Task Assigned', from: 'Pending', to: 'Assigned', at: now, by: staff.name, staffId: staff.id, comment: task.notes },
          ...current.taskHistory,
        ],
      };
      const currentRoom = next.rooms.find((item) => item.id === task.roomId);
      if (currentRoom && ['Dirty', 'Available', 'Clean', 'Inspected'].includes(currentRoom.status)) {
        next = { ...next, rooms: next.rooms.map((item) => item.id === currentRoom.id ? { ...item, status: 'Cleaning', staffId: staff.id } : item) };
        next = prependRoomHistory(next, currentRoom, 'Cleaning', staff.name, 'Task assigned', task.id);
      }
      return next;
    });
    return task;
  };

  const updateTask = (id, action) => setData((state) => {
    const task = state.tasks.find((item) => item.id === id);
    if (!task) return state;
    let status = task.status;
    const patch = {};
    let label = '';
    if (action === 'assign' && status === 'Pending') { status = 'Assigned'; label = 'Task Assigned'; }
    if (action === 'start' && status === 'Assigned') { status = 'In Progress'; patch.startAt = new Date().toISOString(); label = 'Task Started'; }
    if (action === 'complete' && status === 'In Progress') { status = 'Completed'; patch.completedAt = new Date().toISOString(); label = 'Task Completed'; }
    if (action === 'cancel' && !['Completed', 'Cancelled'].includes(status)) { status = 'Cancelled'; label = 'Task Cancelled'; }
    if (status === task.status) return state;

    const staff = state.staff.find((item) => item.id === task.staffId);
    let next = {
      ...state,
      tasks: state.tasks.map((item) => item.id === id ? { ...item, ...patch, status } : item),
      taskHistory: [{ id: `TH-${Date.now()}`, taskId: id, action: label, from: task.status, to: status, at: new Date().toISOString(), by: staff?.name || 'Housekeeping', staffId: staff?.id || '', comment: task.notes }, ...state.taskHistory],
    };
    const room = next.rooms.find((item) => item.id === task.roomId);
    if (action === 'assign' && room && ['Dirty', 'Available', 'Clean', 'Inspected'].includes(room.status)) {
      next = { ...next, rooms: next.rooms.map((item) => item.id === room.id ? { ...item, status: 'Cleaning', staffId: task.staffId } : item) };
      next = prependRoomHistory(next, room, 'Cleaning', staff?.name || 'Housekeeping', 'Task assigned', task.id);
    }
    if (action === 'complete' && room) {
      next = { ...next, rooms: next.rooms.map((item) => item.id === room.id ? { ...item, status: 'Inspected', lastCleaned: new Date().toISOString(), staffId: task.staffId } : item) };
      next = prependRoomHistory(next, room, 'Inspected', staff?.name || 'Housekeeping', 'Cleaning task completed; inspection required', task.id);
    }
    if (action === 'cancel' && room?.status === 'Cleaning') {
      next = { ...next, rooms: next.rooms.map((item) => item.id === room.id ? { ...item, status: 'Dirty' } : item) };
      next = prependRoomHistory(next, room, 'Dirty', staff?.name || 'Housekeeping', 'Cleaning task cancelled', task.id);
    }
    return next;
  });

  const value = useMemo(() => ({ data, toast, setToast, notify, putRoom, addRoom, deleteRoom, addStaff, updateStaff, deleteStaff, changeRoom, assignTask, updateTask, updateSettings }), [data, toast]);
  return <HotelContext.Provider value={value}>{children}</HotelContext.Provider>;
}
