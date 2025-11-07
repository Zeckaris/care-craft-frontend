export type Activity = {
  id: string;
  action: 'created' | 'updated' | 'deleted';
  entity: string; 
  target: string; 
  user: string;   
  timestamp: Date;
  path: string;  
};