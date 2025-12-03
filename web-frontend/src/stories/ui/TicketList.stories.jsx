import React from 'react';
import TicketList from '../../components/TicketList';

export default { title: 'UI/TicketList' };

const tickets = [
  { id: 1, title: 'Login issue', status: 'open', description: 'User cannot login via SSO.' },
  {
    id: 2,
    title: 'Payment failed',
    status: 'in_progress',
    description: 'Transaction failing for one customer.',
  },
];

export const Default = () => (
  <div style={{ width: 600 }}>
    <TicketList tickets={tickets} />
  </div>
);
