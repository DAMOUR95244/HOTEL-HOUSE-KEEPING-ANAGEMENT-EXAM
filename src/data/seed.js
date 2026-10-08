export const ROOM_STATUSES = ['Clean','Dirty','Cleaning','Inspected','Maintenance','Occupied','Available'];
export const TASK_STATUSES = ['Pending','Assigned','In Progress','Completed','Cancelled'];
export const ROOM_TYPES = ['Single','Double','Twin','Deluxe','Executive','Suite','Family'];
export const TASK_TYPES = ['Regular Cleaning','Deep Cleaning','Bathroom Cleaning','Linen Change','Room Inspection','Maintenance Follow-up','Special Cleaning'];
export const PRIORITIES = ['Low','Medium','High','Urgent'];
export const STAFF_STATUSES = ['Active','Inactive','On Leave'];

const staffNames = [
  'Jean Claude Niyonsenga','Aline Uwimana','Eric Habimana','Sandrine Mukamana','Patrick Tuyisenge',
  'Diane Uwamahoro','Emmanuel Nkurunziza','Grace Ingabire','Samuel Bizimana','Alice Mukamana',
  'Fabrice Ishimwe','Chantal Uwamariya','David Mutesa','Immaculee Nyirabazungu','Kevin Tuyishime'
];

const guests = ['Jean Bosco','Aurore Mukamana','Patrick Nshimiyimana','Claudine Uwase','Eric Irakoze','Diane Mukantabana'];
const locations = ['Kigali','Musanze','Huye','Rubavu','Karongi'];

export const seedStaff = staffNames.map((name,i)=>({
  id:`S${String(i+1).padStart(3,'0')}`,
  number:`HK-${String(i+1).padStart(3,'0')}`,
  name,
  gender:i%2===0?'Male':'Female',
  phone:`+250 78 ${String(20+i).padStart(2,'0')} ${String(10+i).padStart(2,'0')} ${String(100+i).padStart(3,'0')}`,
  email:`${name.toLowerCase().replace(/ /g,'.')}@kigalihospitality.example`,
  status:i===14?'On Leave':'Active'
}));

const statusList=['Clean','Dirty','Cleaning','Inspected','Maintenance','Occupied','Available'];
const types=ROOM_TYPES;
export const seedRooms=Array.from({length:60},(_,i)=>{
  const floor=Math.floor(i/20)+1;
  const num=floor*100+(i%20)+1;
  const status=statusList[i%7];
  return {
    id:`R${String(i+1).padStart(3,'0')}`,
    number:String(num),floor,type:types[i%7],capacity:[1,2,2,2,2,4,5][i%7],
    price:[35000,45000,45000,60000,75000,95000,110000][i%7],
    guest:status==='Occupied'?guests[i%guests.length]:'',
    staffId:`S${String((i%14)+1).padStart(3,'0')}`,
    lastCleaned:status==='Clean'||status==='Inspected'?new Date(Date.now()-((i%5)+1)*86400000).toISOString():null,
    lastInspected:status==='Inspected'?new Date(Date.now()-((i%3)+1)*3600000).toISOString():null,
    status,
    remarks:status==='Maintenance'?'Maintenance inspection required':status==='Dirty'?'Guest checkout pending cleaning':status==='Occupied'?'Guest currently staying':'Ready for housekeeping workflow',
    location:locations[i%locations.length]
  };
});

export const seedTasks=Array.from({length:90},(_,i)=>{
  const room=seedRooms[(i*7)%seedRooms.length];
  const staff=seedStaff[(i*3)%seedStaff.length];
  const status=TASK_STATUSES[i%TASK_STATUSES.length];
  const date=new Date(Date.now()-(i%28)*86400000);
  return {
    id:`T${String(i+1).padStart(4,'0')}`,
    number:`HK-${date.getFullYear()}-${String(i+1).padStart(4,'0')}`,
    roomId:room.id,staffId:staff.id,type:TASK_TYPES[i%TASK_TYPES.length],priority:PRIORITIES[i%PRIORITIES.length],status,
    assignedAt:date.toISOString(),
    startAt:['In Progress','Completed'].includes(status)?new Date(+date+3600000).toISOString():null,
    completedAt:status==='Completed'?new Date(+date+9000000).toISOString():null,
    notes:['Standard turnover clean','Guest requested extra towels','Check bathroom fixtures','Prepare for arrival','Inspect room after maintenance'][i%5]
  };
});

export const seedRoomHistory=seedRooms.flatMap((r,i)=>[
  {id:`RH-${i+1}-a`,roomId:r.id,from:'Occupied',to:'Dirty',at:new Date(Date.now()-(i+5)*86400000).toISOString(),by:'Front Desk',staffId:'',comment:'Guest checkout'},
  {id:`RH-${i+1}-b`,roomId:r.id,from:'Dirty',to:r.status,at:new Date(Date.now()-(i%5+1)*3600000).toISOString(),by:seedStaff[i%15].name,staffId:seedStaff[i%15].id,comment:'Housekeeping update'}
]);

export const seedTaskHistory=seedTasks.flatMap((t,i)=>[
  {id:`TH-${i+1}-a`,taskId:t.id,roomId:t.roomId,staffId:'',action:'Task Created',from:'',to:'Pending',at:t.assignedAt,by:'System',comment:'Task record created'},
  {id:`TH-${i+1}-b`,taskId:t.id,roomId:t.roomId,staffId:t.staffId,action:t.status==='Completed'?'Task Completed':t.status==='In Progress'?'Task Started':t.status==='Cancelled'?'Task Cancelled':'Task Assigned',from:'Pending',to:t.status,at:t.completedAt||t.startAt||t.assignedAt,by:seedStaff[i%15].name,comment:t.notes}
]);

export const DEFAULT_SETTINGS={hotelName:'Kigali Hospitality House',currency:'RWF',locale:'en-RW'};
