import React from 'react';
import ActivityFeed from '../../components/ActivityFeed';

export default {
  title: 'Activity/Feed',
  component: ActivityFeed,
};

export const Default = () => (
  <div style={{ width: 320 }}>
    <ActivityFeed />
  </div>
);
