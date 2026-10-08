import { useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, MenuItem, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DownloadOutlined from '@mui/icons-material/DownloadOutlined';
import PrintOutlined from '@mui/icons-material/PrintOutlined';
import { useHotel } from '../context/AppContext';
import { PRIORITIES, ROOM_STATUSES, ROOM_TYPES, TASK_TYPES } from '../data/seed';
import { PageTitle, PriorityChip, RoomStatusChip, TaskStatusChip } from '../components/Common';

const reportTypes = ['All rooms', ...ROOM_STATUSES.map((status) => `${status} rooms`), 'All tasks', 'Assigned tasks', 'Pending tasks', 'Completed tasks', 'Cancelled tasks', 'Tasks by staff', 'Tasks by room', 'Daily cleaning activity', 'Room status summary', 'Room status history', 'Status changes by date', 'Rooms requiring attention'];
const roomColumns = [
  { field: 'number', headerName: 'ROOM', width: 100 }, { field: 'floor', headerName: 'FLOOR', width: 85 },
  { field: 'type', headerName: 'ROOM TYPE', width: 145 }, { field: 'capacity', headerName: 'CAPACITY', width: 100 },
  { field: 'price', headerName: 'RATE / NIGHT', width: 130, renderCell: (p) => `RWF ${Number(p.value).toLocaleString('en-RW')}` },
  { field: 'guest', headerName: 'CURRENT GUEST', width: 160 }, { field: 'staffName', headerName: 'STAFF', width: 175 },
  { field: 'status', headerName: 'STATUS', width: 150, renderCell: (p) => <RoomStatusChip status={p.value} /> },
  { field: 'remarks', headerName: 'REMARKS', width: 230 },
];
const taskColumns = [
  { field: 'number', headerName: 'TASK', width: 160 }, { field: 'roomNumber', headerName: 'ROOM', width: 85 },
  { field: 'type', headerName: 'TASK TYPE', width: 190 }, { field: 'staffName', headerName: 'STAFF', width: 170 },
  { field: 'priority', headerName: 'PRIORITY', width: 110, renderCell: (p) => <PriorityChip priority={p.value} /> },
  { field: 'status', headerName: 'STATUS', width: 135, renderCell: (p) => <TaskStatusChip status={p.value} /> },
  { field: 'assignedAt', headerName: 'ASSIGNED DATE', width: 165, renderCell: (p) => p.value ? new Date(p.value).toLocaleDateString() : '—' },
];
const historyColumns = [
  { field: 'id', headerName: 'HISTORY ID', width: 155 }, { field: 'roomNumber', headerName: 'ROOM', width: 90 },
  { field: 'from', headerName: 'PREVIOUS', width: 135, renderCell: (p) => ROOM_STATUSES.includes(p.value) ? <RoomStatusChip status={p.value} /> : p.value }, { field: 'to', headerName: 'NEW STATUS', width: 140, renderCell: (p) => ROOM_STATUSES.includes(p.value) ? <RoomStatusChip status={p.value} /> : p.value },
  { field: 'by', headerName: 'UPDATED BY', width: 170 }, { field: 'at', headerName: 'DATE / TIME', width: 210, renderCell: (p) => new Date(p.value).toLocaleString() },
  { field: 'comment', headerName: 'COMMENT', width: 270 },
];

export function Reports() {
  const { data } = useHotel();
  const [report, setReport] = useState('All rooms');
  const [date, setDate] = useState('');
  const [room, setRoom] = useState('');
  const [floor, setFloor] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [staff, setStaff] = useState('');
  const [taskType, setTaskType] = useState('');
  const [priority, setPriority] = useState('');
  const isHistory = ['Room status history', 'Status changes by date'].includes(report);
  const isTask = ['All tasks', 'Assigned tasks', 'Pending tasks', 'Completed tasks', 'Cancelled tasks', 'Tasks by staff', 'Tasks by room', 'Daily cleaning activity'].includes(report);

  const { rows, columns } = useMemo(() => {
    let source;
    if (isHistory) {
      source = data.roomHistory.map((entry) => {
        const linkedRoom = data.rooms.find((item) => item.id === entry.roomId);
        const staffId = entry.staffId || data.staff.find((person) => person.name === entry.by)?.id;
        return { ...entry, staffId, staffName: entry.by || '—', roomNumber: linkedRoom?.number || '—', floor: linkedRoom?.floor, roomType: linkedRoom?.type, dateKey: entry.at.slice(0, 10) };
      });
    } else if (isTask) {
      source = data.tasks.map((task) => {
        const linkedRoom = data.rooms.find((item) => item.id === task.roomId);
        return { ...task, roomNumber: linkedRoom?.number || '—', floor: linkedRoom?.floor, roomType: linkedRoom?.type, staffName: data.staff.find((item) => item.id === task.staffId)?.name || '—', dateKey: (task.completedAt || task.assignedAt || '').slice(0, 10) };
      });
    } else {
      source = data.rooms.map((item) => ({ ...item, roomNumber: item.number, roomType: item.type, staffName: data.staff.find((person) => person.id === item.staffId)?.name || '—', dateKey: (item.lastCleaned || '').slice(0, 10) }));
    }

    if (report.endsWith(' rooms') && report !== 'All rooms') source = source.filter((item) => item.status === report.replace(' rooms', ''));
    if (report === 'Rooms requiring attention') source = source.filter((item) => ['Dirty', 'Maintenance'].includes(item.status));
    if (report === 'Assigned tasks') source = source.filter((item) => item.status === 'Assigned');
    if (report === 'Pending tasks') source = source.filter((item) => item.status === 'Pending');
    if (report === 'Completed tasks' || report === 'Daily cleaning activity') source = source.filter((item) => item.status === 'Completed');
    if (report === 'Cancelled tasks') source = source.filter((item) => item.status === 'Cancelled');
    source = source.filter((item) =>
      (!room || item.roomId === room || item.id === room) && (!floor || String(item.floor) === floor) &&
      (!type || item.roomType === type || (!isHistory && item.type === type)) &&
      (!status || item.status === status || item.to === status) && (!staff || item.staffId === staff) &&
      (!taskType || (isTask && item.type === taskType)) && (!priority || (isTask && item.priority === priority)) &&
      (!date || item.dateKey === date || item.at?.slice(0, 10) === date),
    );

    let result = source;
    let cols = isHistory ? historyColumns : isTask ? taskColumns : roomColumns;
    if (report === 'Tasks by staff') {
      result = data.staff.map((person) => {
        const assigned = source.filter((task) => task.staffId === person.id);
        return { id: person.id, staffName: person.name, assigned: assigned.length, pending: assigned.filter((task) => ['Pending', 'Assigned', 'In Progress'].includes(task.status)).length, completed: assigned.filter((task) => task.status === 'Completed').length };
      }).filter((item) => item.assigned);
      cols = [{ field: 'staffName', headerName: 'STAFF', width: 220 }, { field: 'assigned', headerName: 'TOTAL TASKS', width: 140 }, { field: 'pending', headerName: 'OPEN TASKS', width: 140 }, { field: 'completed', headerName: 'COMPLETED', width: 140 }];
    }
    if (report === 'Tasks by room') {
      result = data.rooms.map((linkedRoom) => {
        const assigned = source.filter((task) => task.roomId === linkedRoom.id);
        return { id: linkedRoom.id, roomNumber: linkedRoom.number, floor: linkedRoom.floor, assigned: assigned.length, pending: assigned.filter((task) => ['Pending', 'Assigned', 'In Progress'].includes(task.status)).length, completed: assigned.filter((task) => task.status === 'Completed').length };
      }).filter((item) => item.assigned);
      cols = [{ field: 'roomNumber', headerName: 'ROOM', width: 120 }, { field: 'floor', headerName: 'FLOOR', width: 100 }, { field: 'assigned', headerName: 'TOTAL TASKS', width: 140 }, { field: 'pending', headerName: 'OPEN TASKS', width: 140 }, { field: 'completed', headerName: 'COMPLETED', width: 140 }];
    }
    if (report === 'Room status summary') {
      result = ROOM_STATUSES.map((roomStatus) => { const matches = source.filter((item) => item.status === roomStatus); return { id: roomStatus, status: roomStatus, count: matches.length, rooms: matches.map((item) => item.number).join(', ') }; });
      cols = [{ field: 'status', headerName: 'ROOM STATUS', width: 180, renderCell: (p) => <RoomStatusChip status={p.value} /> }, { field: 'count', headerName: 'ROOM COUNT', width: 140 }, { field: 'rooms', headerName: 'ROOM NUMBERS', width: 550 }];
    }
    if (report === 'Room status history') {
      result = source.map((item) => ({ id: item.id, date: item.dateKey, roomNumber: item.roomNumber, from: item.from || '—', to: item.to || '—', staffName: item.staffName || '—', time: item.at ? new Date(item.at).toLocaleString() : '—', comment: item.comment || '—' }));
      cols = [{ field: 'date', headerName: 'DATE', width: 130 }, { field: 'roomNumber', headerName: 'ROOM', width: 100 }, { field: 'from', headerName: 'PREVIOUS', width: 140, renderCell: (p) => <RoomStatusChip status={p.value} /> }, { field: 'to', headerName: 'NEW STATUS', width: 140, renderCell: (p) => <RoomStatusChip status={p.value} /> }, { field: 'staffName', headerName: 'STAFF', width: 190 }, { field: 'time', headerName: 'DATE / TIME', width: 190 }, { field: 'comment', headerName: 'COMMENT', width: 260 }];
    }
    if (report === 'Status changes by date') {
      const days = [...new Set(source.map((item) => item.dateKey))].sort().reverse();
      result = days.map((day) => { const changes = source.filter((item) => item.dateKey === day); return { id: day, date: day, count: changes.length, changes: changes.map((entry) => `${entry.roomNumber}: ${entry.from} → ${entry.to}`).join('; ') }; });
      cols = [{ field: 'date', headerName: 'DATE', width: 170 }, { field: 'count', headerName: 'STATUS CHANGES', width: 160 }, { field: 'changes', headerName: 'DETAILS', width: 700 }];
    }
    if (report === 'Daily cleaning activity') {
      const days = [...new Set(source.map((item) => item.dateKey))].sort().reverse();
      result = days.map((day) => { const tasks = source.filter((item) => item.dateKey === day); return { id: day, date: day, completed: tasks.length, rooms: tasks.map((item) => item.roomNumber).join(', ') }; });
      cols = [{ field: 'date', headerName: 'COMPLETION DATE', width: 190 }, { field: 'completed', headerName: 'TASKS COMPLETED', width: 180 }, { field: 'rooms', headerName: 'ROOMS', width: 600 }];
    }
    return { rows: result, columns: cols };
  }, [data, report, date, room, floor, type, status, staff, taskType, priority, isTask, isHistory]);

  const exportCsv = () => {
    if (!rows.length) return;
    const fields = Object.keys(rows[0]);
    const escapeCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const csv = [fields.join(','), ...rows.map((row) => fields.map((field) => escapeCell(row[field])).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${report.toLowerCase().replaceAll(' ', '-')}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return <Box className="page-wrap">
    <PageTitle title="Reports" subtitle="Explore operational performance, room conditions, and service history." action={<Box sx={{ display: 'flex', gap: 1 }}><Button variant="outlined" startIcon={<PrintOutlined />} onClick={() => window.print()}>Print</Button><Button variant="contained" startIcon={<DownloadOutlined />} onClick={exportCsv} disabled={!rows.length}>Export CSV</Button></Box>} />
    <Card className="panel"><CardContent>
      <Box className="report-summary"><Box><Typography variant="overline">SELECTED REPORT</Typography><Typography variant="h6">{report}</Typography></Box><Box className="report-count"><Typography variant="h4">{rows.length}</Typography><Typography variant="caption">records</Typography></Box></Box>
      <Box className="report-filters">
        <TextField select size="small" label="Report type" value={report} onChange={(event) => setReport(event.target.value)} sx={{ minWidth: 210 }}>{reportTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
        <TextField size="small" type="date" label="Date" value={date} onChange={(event) => setDate(event.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField select size="small" label="Room" value={room} onChange={(event) => setRoom(event.target.value)} sx={{ minWidth: 125 }}><MenuItem value="">All rooms</MenuItem>{data.rooms.map((item) => <MenuItem key={item.id} value={item.id}>{item.number}</MenuItem>)}</TextField>
        <TextField select size="small" label="Floor" value={floor} onChange={(event) => setFloor(event.target.value)} sx={{ minWidth: 110 }}><MenuItem value="">All floors</MenuItem>{[...new Set(data.rooms.map((item) => item.floor))].map((item) => <MenuItem key={item} value={item}>Floor {item}</MenuItem>)}</TextField>
        <TextField select size="small" label="Room type" value={type} onChange={(event) => setType(event.target.value)} sx={{ minWidth: 135 }}><MenuItem value="">All types</MenuItem>{ROOM_TYPES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
        <TextField select size="small" label="Status" value={status} onChange={(event) => setStatus(event.target.value)} sx={{ minWidth: 140 }}><MenuItem value="">All statuses</MenuItem>{[...ROOM_STATUSES, 'Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
        <TextField select size="small" label="Staff" value={staff} onChange={(event) => setStaff(event.target.value)} sx={{ minWidth: 160 }}><MenuItem value="">All staff</MenuItem>{data.staff.map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}</TextField>
        <TextField select size="small" label="Task type" value={taskType} onChange={(event) => setTaskType(event.target.value)} sx={{ minWidth: 170 }}><MenuItem value="">All task types</MenuItem>{TASK_TYPES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
        <Button size="small" onClick={()=>{setDate('');setRoom('');setFloor('');setType('');setStatus('');setStaff('');setTaskType('');setPriority('')}}>Clear filters</Button><TextField select size="small" label="Priority" value={priority} onChange={(event) => setPriority(event.target.value)} sx={{ minWidth: 130 }}><MenuItem value="">All priorities</MenuItem>{PRIORITIES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
      </Box>
      <Box className="grid-frame report-grid"><DataGrid rows={rows} columns={columns} getRowId={(row) => row.id} pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } }, sorting: { sortModel: [{ field: isTask ? 'assignedAt' : 'number', sort: 'desc' }] } }} autoHeight disableRowSelectionOnClick /></Box>
      {!rows.length && <Alert severity="info" sx={{ mt: 2 }}>No report records match the selected filters.</Alert>}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>CSV output contains the current filtered report records.</Typography>
    </CardContent></Card>
  </Box>;
}
