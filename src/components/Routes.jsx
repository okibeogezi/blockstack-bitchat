import React from 'react';
import {
  Route,
  Switch
} from 'react-router-dom';

import Landing from './Landing';
import SignIn from './SignIn';
import LogOut from './LogOut';
import AppHome from './AppHome';
import AddFriend from './AddFriend';
import Chat from './Chat';
import ChatList from './ChatList';

const Routes = () => {
  return (
    <Switch>
      <Route path="/" exact component={Landing} />
      <Route path="/sign-in/" exact component={SignIn} />
      <Route path="/log-out/" exact component={LogOut} />
      <Route path="/app/" exact component={AppHome} />
      <Route path="/app/add/friend/" exact component={AddFriend} />
      <Route path="/app/chats/" exact component={ChatList} />
      <Route path="/app/chats/:fullName/" exact component={Chat} />
    </Switch>
  )
};

export default Routes;