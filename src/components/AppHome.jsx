import React from 'react';
import { Redirect } from 'react-router-dom';

export default function AppHome (props) {
  return (
    <Redirect to='/app/chats/' />
  );
};