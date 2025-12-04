import React from 'react';
import ExampleButton from './ExampleButton';

export default {
  title: 'Example/ExampleButton',
  component: ExampleButton,
};

export const Primary = () => <ExampleButton label="Primary" />;

export const WithAction = () => (
  <ExampleButton label="With Action" onClick={() => alert('clicked')} />
);
