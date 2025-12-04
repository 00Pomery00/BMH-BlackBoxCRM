import React from 'react';
import Sidebar from '../../components/layout/Sidebar';

export default {
  title: 'Layout/Sidebar',
  component: Sidebar,
};

export const Default = () => <Sidebar page="home" onNavigate={(p) => console.log('nav', p)} />;
