import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import { 
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  List,
  Typography,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@material-ui/core';
import {
  Person as Person,
  VerifiedUser,
  PersonAdd
} from '@material-ui/icons';
import Header from './Header';
import BlockStackUtils from '../lib/BlockStackUtils';
import FirebaseUtils from '../lib/FirebaseUtils';
import { Redirect } from 'react-router-dom';

// Query: https://core.blockstack.org/v1/search?query=okibeogezi.id.blockstack
class ChatList extends React.Component {
  constructor (props) {
    super(props);

    this.state = { 
      friends: [],
      isLoadingFriends: false,
      errorLoadingFriends: false,
      isGoingToChat: false,
      destinationFullName: ''
    };
    BlockStackUtils.init(this);
  }

  componentDidMount () {
    this._loadFriends();
  }

  _loadFriends = async () => {
    this.setState({ isLoadingFriends: true });
    try {
      const { friends } = await FirebaseUtils.loadFriends(BlockStackUtils.getUsername(this));
      this.setState({ 
        errorLoadingFriends: false,
        friends
      });
    }
    catch (e) {
      this.setState({ errorLoadingFriends: true });
      console.error(e);
    }
    finally {
      this.setState({ isLoadingFriends: false });
    }
  }

  _onClickFriend = (username) => {
    console.log(username, 'friend clicked');
    this.setState({ 
      isGoingToChat: true,
      destinationFullName: username
    });
  }


  _errorDialogRetry = () => {
    this._loadFriends();
    this.setState({ errorInvalidFullName: false });
  }

  _renderErrorDialog = (classes) => {
    return (
      <Dialog
        fullScreen={false}
        open={this.state.errorLoadingFriends}
        onClose={this._errorDialogRetry}
        aria-labelledby="responsive-dialog-title">
        <DialogTitle id="responsive-dialog-title">Connection Error</DialogTitle>
        <DialogContent>
          <DialogContentText>
            An error occured while loading your friends. Check your Internet connection then try again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={this._errorDialogCancel} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  render () {
    const { classes } = this.props;
    const { 
      isLoadingFriends, friends, 
      isGoingToChat, destinationFullName 
    } = this.state;

    if (!BlockStackUtils.isSignedInOrPending(this)) {
      return (
        <Redirect to='/sign-in/' />
      );
    }

    if (isGoingToChat) {
      return (
        <Redirect to={`/app/chats/${destinationFullName}/`} />
      );
    }

    return (
      <Box align="center" className={classes.container}>
        <Header className={classes.header}>Chats</Header>
        { isLoadingFriends && <CircularProgress /> }
        {
          isLoadingFriends ? '' :
          friends.length ?
          <List component="nav" aria-label="main mailbox folders">
            {
              friends.map(({ username }, i) => (
                <Box key={i}>
                  <Divider />
                  <ListItem key={username} button onClick={e => this._onClickFriend(username)}>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText primary={username} />
                  </ListItem>
                  <Divider />
                </Box>
              ))
            }
          </List> :
          <Typography variant="button">No Friends Yet.</Typography>
        }
      </Box>
    );
  }
};

const styles = theme => ({
  container: {
    flexWrap: 'wrap',
    flexGrow: 1
  },
  search: {
    marginRight: theme.spacing(8),
    marginLeft: theme.spacing(8)
  },
  header: {
    marginBottom: theme.spacing(16) 
  }
});

export default withStyles(styles)(ChatList);