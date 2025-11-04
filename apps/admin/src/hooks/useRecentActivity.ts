import { useNavigate } from 'react-router-dom';
import { type Activity } from '../types/activity';

const mockActivities: Activity[] = [
  {
    id: '1',
    action: 'created',
    entity: 'Student',
    target: 'Sarah Johnson',
    user: 'Amanuel',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    path: '/admin/students/123',
  },
  {
    id: '2',
    action: 'updated',
    entity: 'Grade',
    target: 'Math - Grade 8',
    user: 'Amanuel',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    path: '/admin/grades',
  },
  {
    id: '3',
    action: 'deleted',
    entity: 'Teacher',
    target: 'John Doe',
    user: 'Amanuel',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    path: '/admin/teachers',
  },
  {
    id: '4',
    action: 'created',
    entity: 'Subject',
    target: 'Physics',
    user: 'Amanuel',
    timestamp: new Date(Date.now() - 90 * 60 * 1000),
    path: '/admin/subjects',
  },
  {
    id: '5',
    action: 'updated',
    entity: 'Parent',
    target: 'Lisa Smith',
    user: 'Amanuel',
    timestamp: new Date(Date.now() - 120 * 60 * 1000),
    path: '/admin/parents',
  },
];

export const useRecentActivity = () => {
  const navigate = useNavigate();

  const activities = mockActivities.slice(0, 5);

  const goToActivity = (path: string) => {
    navigate(path);
  };

  return { activities, goToActivity };
};