import React from 'react';
import GamificationPanel from '../GamificationPanel';

function WidgetGamification({ gamification }) {
  return <GamificationPanel stats={gamification} />;
}

export default React.memo(WidgetGamification);
