# Kigali Hospitality House — Hotel Housekeeping Management System

A professional frontend-only Hotel Housekeeping Management System built for the **ITLDF601 – Frontend Development practical assessment**. The application demonstrates React.js, Vite, React Router, Material UI, MUI DataGrid, Recharts, responsive design, CRUD operations, status workflows, audit history, reports, mock data, and browser localStorage.

## Assessment coverage

### Required pages
1. Dashboard
2. Rooms
3. Room Details — `/rooms/:roomId`
4. Housekeeping Tasks
5. Assign Housekeeping Task
6. Task Details — `/housekeeping-tasks/:taskId`
7. Housekeeping Staff
8. Task History
9. Reports

Room Details and Task Details are dynamic pages reached from the Rooms and Housekeeping Tasks tables.

## Technologies

- React 19
- Vite
- JavaScript ES6+
- React Router
- Material UI (MUI)
- MUI DataGrid
- Recharts
- HTML5/CSS3
- Browser localStorage

## Mock data

The application starts with realistic Rwanda-localized mock data:

- **60 rooms** across all 7 required room types
- **15 housekeeping staff**
- **90 housekeeping tasks**
- **120 room status history records**
- **180 task history records**
- All 7 required room statuses represented
- All required task types, priorities, and task statuses represented
- RWF room rates and Rwanda +250 phone numbers

## Room status workflow

The system supports the required housekeeping workflow:

`Occupied → Dirty → Cleaning → Inspected → Available`

It also supports valid operational maintenance and occupancy transitions. Invalid transitions are blocked by the application rules. Status changes record the previous status, new status, date/time, staff member, and comment.

## Housekeeping workflow

`Pending → Assigned → In Progress → Completed`

Tasks may also be cancelled when appropriate. Assigning a task stores the staff member and assignment date, updates eligible rooms to **Cleaning**, creates history, updates dashboard statistics, and persists the change. Completing a cleaning task records completion time and moves the room to **Inspected** so it can be released after inspection.

## Dashboard

The dashboard dynamically calculates:

- Total Rooms
- Clean Rooms
- Dirty Rooms
- Rooms Being Cleaned
- Inspected Rooms
- Rooms Under Maintenance
- Occupied Rooms
- Available Rooms
- Pending Housekeeping Tasks
- Completed Tasks

It also includes room-status visualization, housekeeping task charts, staff workload, daily cleaning activity, rooms requiring attention, and priority task monitoring.

## Room management

The Rooms page provides MUI DataGrid with:

- Add, edit, delete, and view details
- Search
- Status, floor, and room-type filters
- Sorting and pagination
- Delete confirmation
- MUI status Chips
- Status-change workflow
- Current guest, staff, cleaning and inspection information

## Staff management

The Housekeeping Staff page supports add, edit, delete, search, status filtering, staff details, assigned rooms, assigned tasks, and workload counts.

## Reports

The Reports page is generated from current frontend data and includes:

- All rooms
- Clean, dirty, cleaning, inspected, maintenance, occupied and available rooms
- Assigned, pending, completed and cancelled tasks
- Tasks by staff
- Tasks by room
- Daily cleaning activity
- Room status summary
- Room status history
- Status changes by date
- Rooms requiring attention

Filters include **Date, Room, Floor, Room Type, Status, Staff, Task Type, and Priority**. Reports support **Print** and **Export CSV**.

## LocalStorage

The following are persisted in browser localStorage:

- Rooms
- Housekeeping staff
- Housekeeping tasks
- Room status history
- Task history
- Application settings

Refresh the browser without losing application changes.

## Installation

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

## Practical demonstration sequence

For the strongest demonstration, show this sequence to the trainer:

1. Open Dashboard and explain dynamic room/task statistics.
2. Open Rooms and demonstrate search, filters, pagination, status Chips and DataGrid.
3. Open a Room Details page and show Overview, Housekeeping Tasks, Status History and Cleaning History.
4. Assign a housekeeping task.
5. Open Task Details and demonstrate **Start Task**.
6. Demonstrate **Complete Task** and show the room becoming **Inspected**.
7. Change the room from **Inspected → Available**.
8. Open Task History and show the generated audit records.
9. Open Reports, apply filters, export CSV and demonstrate Print.
10. Refresh the browser and demonstrate localStorage persistence.

## Screenshots

The project includes screenshots of the Dashboard, Rooms, Room Details, Assign Task, Task Details, Staff, Reports, Task History, and mobile layout in the `screenshots/` folder.

## Important project rule

This is intentionally a **frontend-only** system. It does not use Laravel, PHP, MySQL, Firebase, or another backend/database.

## Future improvements

- Role-based authentication
- Backend synchronization for multi-user operation
- Configurable hotel settings
- Bulk data import/export
- Scheduled recurring housekeeping tasks
- PDF report generation
