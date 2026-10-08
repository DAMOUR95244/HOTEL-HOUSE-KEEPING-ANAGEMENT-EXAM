import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Chip, GridLegacy as Grid, Typography } from '@mui/material';
import ArrowOutward from '@mui/icons-material/ArrowOutward';
import MeetingRoomOutlined from '@mui/icons-material/MeetingRoomOutlined';
import CleaningServicesOutlined from '@mui/icons-material/CleaningServicesOutlined';
import TaskAltOutlined from '@mui/icons-material/TaskAltOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts';
import { useHotel } from '../context/AppContext';
import { ROOM_STATUSES, TASK_STATUSES } from '../data/seed';
import { PageTitle, PriorityChip, RoomStatusChip } from '../components/Common';

const statusColors = { Clean: '#23836d', Dirty: '#d45e55', Cleaning: '#dda942', Inspected: '#4884b8', Maintenance: '#8665b7', Occupied: '#566e69', Available: '#85b9a7' };
const taskColors = ['#d9a441', '#5391bb', '#287a68', '#43a384', '#a9b4b0'];

function Metric({ label, value, icon: Icon, tone, caption }) {
  return <Card className="metric-card"><CardContent><Box className="metric-top"><Box className={`metric-icon ${tone}`}><Icon /></Box><Typography className="metric-caption">{caption}</Typography></Box><Typography className="metric-value">{value}</Typography><Typography className="metric-label">{label}</Typography></CardContent></Card>;
}

function ChartPanel({ title, subtitle, children }) {
  return <Card className="panel chart-panel"><CardContent><Box className="panel-heading"><Box><Typography variant="h6">{title}</Typography><Typography color="text.secondary" variant="body2">{subtitle}</Typography></Box></Box>{children}</CardContent></Card>;
}

export function Dashboard() {
  const { data } = useHotel();
  const navigate = useNavigate();
  const summary = useMemo(() => {
    const rooms = data.rooms.reduce((counts, room) => ({ ...counts, [room.status]: (counts[room.status] || 0) + 1 }), {});
    const tasks = data.tasks.reduce((counts, task) => ({ ...counts, [task.status]: (counts[task.status] || 0) + 1 }), {});
    return { rooms, tasks };
  }, [data]);
  const roomChart = ROOM_STATUSES.map((name) => ({ name, count: summary.rooms[name] || 0 }));
  const taskChart = TASK_STATUSES.map((name) => ({ name, count: summary.tasks[name] || 0 }));
  const staffChart = data.staff.map((staff) => ({ name: staff.name.split(' ')[0], tasks: data.tasks.filter((task) => task.staffId === staff.id).length })).sort((a, b) => b.tasks - a.tasks).slice(0, 7);
  const dailyActivity = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));
    return { date: day.toLocaleDateString('en-RW', { weekday: 'short' }), count: data.tasks.filter((task) => task.status === 'Completed' && task.completedAt && new Date(task.completedAt).toDateString() === day.toDateString()).length };
  });
  const metricCards = [
    ['Total Rooms', data.rooms.length, MeetingRoomOutlined, 'mint', 'Inventory'],
    ['Clean Rooms', summary.rooms.Clean || 0, TaskAltOutlined, 'green', `${Math.round((summary.rooms.Clean || 0) / (data.rooms.length || 1) * 100)}% of inventory`],
    ['Dirty Rooms', summary.rooms.Dirty || 0, WarningAmberOutlined, 'rose', 'Needs attention'],
    ['Rooms Being Cleaned', summary.rooms.Cleaning || 0, CleaningServicesOutlined, 'amber', 'In progress'],
    ['Inspected Rooms', summary.rooms.Inspected || 0, TaskAltOutlined, 'blue', 'Ready for release'],
    ['Under Maintenance', summary.rooms.Maintenance || 0, WarningAmberOutlined, 'violet', 'Out of service'],
    ['Occupied Rooms', summary.rooms.Occupied || 0, MeetingRoomOutlined, 'slate', 'Currently occupied'],
    ['Available Rooms', summary.rooms.Available || 0, MeetingRoomOutlined, 'mint', 'Ready to assign'],
    ['Pending Tasks', summary.tasks.Pending || 0, CleaningServicesOutlined, 'amber', 'Not yet assigned'],
    ['Completed Tasks', summary.tasks.Completed || 0, TaskAltOutlined, 'green', 'All time'],
  ];
  const attentionRooms = data.rooms.filter((room) => ['Dirty', 'Maintenance'].includes(room.status)).slice(0, 5);
  const now = Date.now();
  const priorityTasks = data.tasks.filter((task) => task.status !== 'Completed' && task.status !== 'Cancelled' && (task.priority === 'Urgent' || (['Pending', 'Assigned'].includes(task.status) && now - new Date(task.assignedAt).getTime() > 86400000))).slice(0, 5);

  return <Box className="page-wrap">
    <PageTitle title="Good morning" subtitle="Here’s the housekeeping overview for Kigali Hospitality House." action={<Button variant="contained" onClick={() => navigate('/assign-task')}>Assign a task</Button>} />
    <Grid container spacing={2} className="metrics-grid">{metricCards.map(([label, value, icon, tone, caption]) => <Grid item key={label} xs={6} sm={4} lg={2.4}><Metric label={label} value={value} icon={icon} tone={tone} caption={caption} /></Grid>)}</Grid>

    <Grid container spacing={2.25} sx={{ mt: 0.2 }}>
      <Grid item xs={12} lg={7}>
        <Card className="panel"><CardContent>
          <Box className="panel-heading"><Box><Typography variant="h6">Room status overview</Typography><Typography color="text.secondary" variant="body2">Room distribution and grouped room numbers</Typography></Box><Button size="small" endIcon={<ArrowOutward />} onClick={() => navigate('/rooms')}>View rooms</Button></Box>
          <Box className="status-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={roomChart} margin={{ top: 12, right: 12, bottom: 0, left: -18 }}><CartesianGrid vertical={false} stroke="#edf1ef" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} interval={0} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} /><ChartTooltip /><Bar dataKey="count" radius={[5, 5, 0, 0]} isAnimationActive={false}>{roomChart.map((item) => <Cell key={item.name} fill={statusColors[item.name]} />)}</Bar></BarChart></ResponsiveContainer></Box>
          <Grid container spacing={1.2} sx={{ mt: 0.4 }}>{ROOM_STATUSES.map((status) => <Grid item xs={12} sm={6} key={status}><Box className={`status-group ${status === 'Dirty' || status === 'Maintenance' ? 'attention' : ''}`}><Box className="status-group-head"><RoomStatusChip status={status} /><Typography fontWeight={700}>{summary.rooms[status] || 0}</Typography></Box><Box className="room-pills">{data.rooms.filter((room) => room.status === status).sort((a, b) => Number(a.number) - Number(b.number)).map((room) => <Chip key={room.id} label={room.number} size="small" variant="outlined" onClick={() => navigate(`/rooms/${room.id}`)} />)}</Box></Box></Grid>)}</Grid>
        </CardContent></Card>
      </Grid>
      <Grid item xs={12} lg={5}><ChartPanel title="Housekeeping tasks" subtitle="Current task pipeline"><Box className="task-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={taskChart} layout="vertical" margin={{ top: 10, right: 18, bottom: 0, left: 2 }}><CartesianGrid horizontal={false} stroke="#edf1ef" /><XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} /><YAxis type="category" dataKey="name" width={86} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} /><ChartTooltip /><Bar dataKey="count" radius={[0, 5, 5, 0]} isAnimationActive={false}>{taskChart.map((item, index) => <Cell key={item.name} fill={taskColors[index]} />)}</Bar></BarChart></ResponsiveContainer></Box></ChartPanel></Grid>
      <Grid item xs={12} md={6}><ChartPanel title="Daily cleaning activity" subtitle="Completed housekeeping tasks by date"><Box className="small-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={dailyActivity}><CartesianGrid vertical={false} stroke="#edf1ef" /><XAxis dataKey="date" axisLine={false} tickLine={false} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} /><ChartTooltip /><Bar dataKey="count" fill="#27806e" radius={[5, 5, 0, 0]} isAnimationActive={false} /></BarChart></ResponsiveContainer></Box></ChartPanel></Grid>
      <Grid item xs={12} md={6}><ChartPanel title="Staff workload" subtitle="Tasks assigned across your team"><Box className="small-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={staffChart} layout="vertical" margin={{ left: 8 }}><CartesianGrid horizontal={false} stroke="#edf1ef" /><XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={62} /><ChartTooltip /><Bar dataKey="tasks" fill="#83b9a9" radius={[0, 5, 5, 0]} isAnimationActive={false} /></BarChart></ResponsiveContainer></Box></ChartPanel></Grid>
    </Grid>

    <Grid container spacing={2.25} sx={{ mt: 0.2 }}>
      <Grid item xs={12} md={6}><Card className="panel"><CardContent><Box className="panel-heading"><Box><Typography variant="h6">Rooms needing attention</Typography><Typography variant="body2" color="text.secondary">Dirty and maintenance rooms need follow-up</Typography></Box><Button size="small" onClick={() => navigate('/rooms')}>See all</Button></Box>{attentionRooms.length ? attentionRooms.map((room) => <Box className="attention-row" key={room.id}><Box><Typography fontWeight={650}>Room {room.number}</Typography><Typography variant="caption" color="text.secondary">Floor {room.floor} · {room.type}</Typography></Box><RoomStatusChip status={room.status} /></Box>) : <Typography color="text.secondary" sx={{ mt: 2 }}>No rooms need attention.</Typography>}</CardContent></Card></Grid>
      <Grid item xs={12} md={6}><Card className="panel"><CardContent><Box className="panel-heading"><Box><Typography variant="h6">Priority task queue</Typography><Typography variant="body2" color="text.secondary">Urgent and overdue pending tasks</Typography></Box><Button size="small" onClick={() => navigate('/housekeeping-tasks')}>All tasks</Button></Box>{priorityTasks.length ? priorityTasks.map((task) => { const room = data.rooms.find((item) => item.id === task.roomId); return <Box className="attention-row" key={task.id}><Box><Typography fontWeight={650}>{task.number} · Room {room?.number}</Typography><Typography variant="caption" color="text.secondary">{task.type} · {task.status}</Typography></Box><PriorityChip priority={task.priority} /></Box>; }) : <Typography color="text.secondary" sx={{ mt: 2 }}>No urgent or overdue tasks.</Typography>}</CardContent></Card></Grid>
    </Grid>
  </Box>;
}
