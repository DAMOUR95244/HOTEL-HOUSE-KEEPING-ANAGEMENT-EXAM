import { seedRooms,seedStaff,seedTasks,seedRoomHistory,seedTaskHistory,DEFAULT_SETTINGS } from '../data/seed';
const KEY='kigali-hospitality-housekeeping-v2';
export const loadState=()=>{
  try{
    const saved=localStorage.getItem(KEY);
    if(saved){
      const parsed=JSON.parse(saved);
      return {...parsed,settings:{...DEFAULT_SETTINGS,...(parsed.settings||{})}};
    }
  }catch(e){console.error('Could not load saved housekeeping data',e)}
  return {rooms:seedRooms,staff:seedStaff,tasks:seedTasks,roomHistory:seedRoomHistory,taskHistory:seedTaskHistory,settings:DEFAULT_SETTINGS};
};
export const saveState=(state)=>{try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch(e){console.error('Could not save housekeeping data',e);return false}};
export const clearSavedState=()=>{try{localStorage.removeItem(KEY);return true}catch(e){console.error('Could not clear saved housekeeping data',e);return false}};
