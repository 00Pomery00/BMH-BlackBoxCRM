import React from 'react';
import Calendar from '../../components/ui/Calendar';

export default { title: 'UI/Calendar' };

const events = [
  { date: new Date().toLocaleDateString(), title: 'Demo meeting' },
  { date: new Date().toLocaleDateString(), title: 'Call with client' },
];

export const Default = () => (
  <div style={{ width: 800 }}>
    <Calendar events={events} />
  </div>
);
