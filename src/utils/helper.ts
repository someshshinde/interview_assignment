export const generateTaskCode=()=> {
 const num = Math.floor(1000 + Math.random() * 9000);
 const str = Math.random().toString(36).substring(2,5).toUpperCase();
 return `TSK-${num}-${str}`;
}