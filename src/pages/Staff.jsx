import { useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, GridLegacy as Grid, LinearProgress, MenuItem, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useHotel } from '../context/AppContext';
import { STAFF_STATUSES } from '../data/seed';
import { ConfirmDialog, PageTitle, PriorityChip, TaskStatusChip } from '../components/Common';

const blankStaff = { number: '', name: '', gender: 'Female', phone: '', email: '', status: 'Active' };

export function Staff() {
  const { data, addStaff, updateStaff, deleteStaff, notify } = useHotel();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [form, setForm] = useState(null);
  const [remove, setRemove] = useState(null);
  const [view, setView] = useState(null);

  const rows = useMemo(() => data.staff
    .filter((staff) => `${staff.number} ${staff.name} ${staff.phone} ${staff.email}`.toLowerCase().includes(search.toLowerCase()) && (!status || staff.status === status))
    .map((staff) => {
      const tasks = data.tasks.filter((task) => task.staffId === staff.id);
      return {
        ...staff,
        rooms: data.rooms.filter((room) => room.staffId === staff.id).length,
        pending: tasks.filter((task) => ['Pending', 'Assigned', 'In Progress'].includes(task.status)).length,
        completed: tasks.filter((task) => task.status === 'Completed').length,
      };
    }), [data, search, status]);

  const columns = [
    { field: 'id', headerName: 'STAFF ID', width: 145 },
    { field: 'number', headerName: 'STAFF NO.', width: 120 },
    { field: 'name', headerName: 'FULL NAME', width: 190 },
    { field: 'gender', headerName: 'GENDER', width: 95 },
    { field: 'phone', headerName: 'PHONE', width: 155 },
    { field: 'email', headerName: 'EMAIL', width: 235 },
    { field: 'rooms', headerName: 'ROOMS', width: 85 },
    { field: 'pending', headerName: 'OPEN TASKS', width: 110 },
    { field: 'completed', headerName: 'COMPLETED', width: 110 },
    { field: 'status', headerName: 'STATUS', width: 120, renderCell: (params) => <span className={`staff-status ${params.value.toLowerCase().replace(' ', '-')}`}>{params.value}</span> },
    { field: 'actions', headerName: 'ACTIONS', width: 235, sortable: false, renderCell: (params) => <Box className="row-actions"><Button size="small" onClick={() => setView(params.row)}>Tasks</Button><Button size="small" onClick={() => setForm({ ...params.row })}>Edit</Button><Button size="small" color="error" onClick={() => setRemove(params.row)}>Delete</Button></Box> },
  ];

  const save = () => {
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || '');
    if (!form.name?.trim() || !form.phone?.trim() || !validEmail) {
      notify('Enter a name, phone number, and valid email address.', 'error');
      return;
    }
    if (form.id) updateStaff(form);
    else addStaff({ ...form, name: form.name.trim(), number: form.number || `HK-${String(data.staff.length + 1).padStart(3, '0')}` });
    notify(form.id ? 'Staff record updated' : 'Staff member added');
    setForm(null);
  };

  const staffTasks = view ? data.tasks.filter((task) => task.staffId === view.id).sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt)) : [];

  return <Box className="page-wrap">
    <PageTitle title="Housekeeping staff" subtitle={`${data.staff.length} team members · View assignments and workload.`} action={<Button variant="contained" onClick={() => setForm({ ...blankStaff })}>Add staff member</Button>} />
    <Card className="panel"><CardContent>
      <Box className="filterbar"><TextField size="small" placeholder="Search staff…" value={search} onChange={(event) => setSearch(event.target.value)} /><TextField size="small" select label="Staff status" value={status} onChange={(event) => setStatus(event.target.value)} sx={{ minWidth: 160 }}><MenuItem value="">All staff</MenuItem>{STAFF_STATUSES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField><Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>{rows.length} members</Typography></Box>
      <Box className="grid-frame"><DataGrid rows={rows} columns={columns} getRowId={(row) => row.id} pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } }, sorting: { sortModel: [{ field: 'name', sort: 'asc' }] } }} autoHeight disableRowSelectionOnClick /></Box>
      {!rows.length && <Alert severity="info" sx={{ mt: 2 }}>No staff members match this filter.</Alert>}
    </CardContent></Card>

    <Grid container spacing={2} sx={{ mt: 1 }}>{rows.slice(0, 4).map((staff) => <Grid item xs={12} sm={6} lg={3} key={staff.id}><Card className="panel workload-card"><CardContent>
      <Box className="staff-avatar">{staff.name.split(' ').map((word) => word[0]).join('').slice(0, 2)}</Box><Typography fontWeight={700}>{staff.name}</Typography><Typography variant="caption" color="text.secondary">{staff.number} · {staff.status}</Typography>
      <Box className="workload-line"><Typography variant="caption">Open workload</Typography><Typography variant="caption">{staff.pending} tasks</Typography></Box><LinearProgress variant="determinate" value={Math.min(staff.pending * 14, 100)} />
      <Box className="staff-task-list">{data.tasks.filter((task) => task.staffId === staff.id).slice(0, 3).map((task) => <Typography variant="caption" key={task.id}>{task.number} · Room {data.rooms.find((room) => room.id === task.roomId)?.number || '—'} · {task.status}</Typography>)}</Box>
      <Button size="small" sx={{ mt: 1 }} onClick={() => setView(staff)}>View details and tasks</Button>
    </CardContent></Card></Grid>)}</Grid>

    <Dialog open={Boolean(view)} onClose={() => setView(null)} maxWidth="md" fullWidth>
      <DialogTitle>{view?.name} · Staff details and assigned tasks</DialogTitle>
      <DialogContent>
        {view && <><Grid container spacing={1.5} sx={{ mt: 0.2, mb: 2 }}>{[['Staff ID', view.id], ['Staff number', view.number], ['Gender', view.gender], ['Phone', view.phone], ['Email', view.email], ['Status', view.status], ['Assigned rooms', data.rooms.filter((room) => room.staffId === view.id).length]].map(([label, value]) => <Grid item xs={12} sm={6} md={4} key={label}><Box className="detail-field"><Typography variant="caption">{label}</Typography><Typography fontWeight={600}>{value}</Typography></Box></Grid>)}</Grid>
          <Typography variant="h6" sx={{ mb: 1 }}>Assigned tasks ({staffTasks.length})</Typography>
          {staffTasks.length ? staffTasks.map((task) => <Box className="history-row" key={task.id}><Box><Typography fontWeight={650}>{task.number} · Room {data.rooms.find((room) => room.id === task.roomId)?.number || '—'}</Typography><Typography variant="body2" color="text.secondary">{task.type} · {new Date(task.assignedAt).toLocaleDateString()}</Typography></Box><Box sx={{ display: 'flex', gap: 1 }}><PriorityChip priority={task.priority} /><TaskStatusChip status={task.status} /></Box></Box>) : <Box className="empty-state">No tasks are assigned to this staff member.</Box>}
        </>}
      </DialogContent>
      <DialogActions><Button onClick={() => setView(null)}>Close</Button><Button variant="contained" onClick={() => { setForm({ ...view }); setView(null); }}>Edit staff member</Button></DialogActions>
    </Dialog>

    <Dialog open={Boolean(form)} onClose={() => setForm(null)} maxWidth="sm" fullWidth><DialogTitle>{form?.id ? 'Edit staff member' : 'Add staff member'}</DialogTitle><DialogContent><Grid container spacing={2} sx={{ mt: 0.2 }}>
      { [['number', 'Staff number'], ['name', 'Full name'], ['phone', 'Phone'], ['email', 'Email']].map(([key, label]) => <Grid item xs={12} sm={6} key={key}><TextField fullWidth label={label} value={form?.[key] || ''} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></Grid>)}
      <Grid item xs={12} sm={6}><TextField select fullWidth label="Gender" value={form?.gender || 'Female'} onChange={(event) => setForm({ ...form, gender: event.target.value })}>{['Female', 'Male', 'Non-binary', 'Prefer not to say'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
      <Grid item xs={12} sm={6}><TextField select fullWidth label="Status" value={form?.status || 'Active'} onChange={(event) => setForm({ ...form, status: event.target.value })}>{STAFF_STATUSES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
    </Grid></DialogContent><DialogActions><Button onClick={() => setForm(null)}>Cancel</Button><Button variant="contained" onClick={save}>Save member</Button></DialogActions></Dialog>
    <ConfirmDialog open={Boolean(remove)} title="Remove staff member?" danger confirmLabel="Delete member" onClose={() => setRemove(null)} onConfirm={() => { deleteStaff(remove.id); setRemove(null); notify('Staff member removed'); }}>Delete {remove?.name}? Existing tasks keep their assignment history.</ConfirmDialog>
  </Box>;
}
