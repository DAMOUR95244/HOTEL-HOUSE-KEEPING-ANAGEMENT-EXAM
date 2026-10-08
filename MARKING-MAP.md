# Practical Exam Marking Map

This map helps the trainer quickly verify the required competence evidence.

| Requirement | Where to demonstrate it |
|---|---|
| Dashboard | `src/pages/Dashboard.jsx` + `/` |
| Rooms CRUD/DataGrid | `src/pages/Rooms.jsx` + `/rooms` |
| Room Details | `src/pages/RoomDetails.jsx` + `/rooms/:roomId` |
| Task management | `src/pages/Tasks.jsx` + `/housekeeping-tasks` |
| Assign task | `src/pages/AssignTask.jsx` + `/assign-task` |
| Task Details | `src/pages/TaskDetails.jsx` + `/housekeeping-tasks/:taskId` |
| Staff management | `src/pages/Staff.jsx` + `/staff` |
| Task history | `src/pages/History.jsx` + `/history` |
| Reports | `src/pages/Reports.jsx` + `/reports` |
| Room status Chips | `src/components/Common.jsx` (`RoomStatusChip`) |
| Room workflow rules | `src/context/AppContext.jsx` (`ROOM_NEXT`) |
| Task workflow | `src/context/AppContext.jsx` (`updateTask`) |
| Assignment workflow | `src/context/AppContext.jsx` (`assignTask`) |
| LocalStorage | `src/services/storage.js` |
| Mock data | `src/data/seed.js` |
| Recharts | `src/pages/Dashboard.jsx` |
| MUI DataGrid | Rooms, Tasks, Staff, History, Reports |
| CSV export | `src/pages/Reports.jsx` |
| Print report | `src/pages/Reports.jsx` |
| Responsive styling | `src/styles.css` |
| Documentation | `README.md` |

## Suggested live demonstration

1. Dashboard: show dynamic summary cards and charts.
2. Rooms: search, filter, sort, paginate, edit and open details.
3. Room Details: show all four tabs and change a valid room status.
4. Assign Task: choose room, staff, type, priority, date and notes.
5. Task Details: Start → Complete and show the confirmation dialog.
6. Show the room becoming Inspected.
7. Release Inspected → Available.
8. Task History: filter by room/staff/action/date/status.
9. Reports: show Room Status Summary, Room Status History, Status Changes by Date and Rooms Requiring Attention.
10. Export CSV and print a report.
11. Refresh the browser and demonstrate localStorage persistence.
