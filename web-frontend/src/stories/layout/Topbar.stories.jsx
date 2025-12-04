import React from 'react';
import Topbar from '../../components/layout/Topbar';

export default {
  title: 'Layout/Topbar',
  component: Topbar,
};

export const Default = () => <Topbar onLogout={() => console.log('logout')} />;
