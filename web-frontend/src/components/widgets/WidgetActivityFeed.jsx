import React from 'react';
import ActivityFeed from '../ActivityFeed';

function WidgetActivityFeed({ activities }) {
  return <ActivityFeed activities={activities} />;
}

export default React.memo(WidgetActivityFeed);
