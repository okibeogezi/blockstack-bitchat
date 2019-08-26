import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import { 
  Box,
  Button,
  TextField,
  InputAdornment,
  DialogTitle,
  Typography,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@material-ui/core';
import { PersonAdd } from '@material-ui/icons';
import Header from './Header';
import BlockStackUtils from '../lib/BlockStackUtils';
import FirebaseUtils from '../lib/FirebaseUtils';
import { Redirect } from 'react-router-dom';

// Query: https://core.blockstack.org/v1/search?query=okibeogezi.id.blockstack
class AddFriend extends React.Component {
  constructor (props) {
    super(props);

    this.state = { 
      friendUsername: '',
      isUserameValid: null,
      errorCheckingUsername: false,
      errorInvalidUsername: false
    };
    BlockStackUtils.init(this);
  }

  _addFriend = async (username) => {
    let valid;
    try {
      valid = await BlockStackUtils.checkIfUserExists(username);
      if (valid) {
        console.log('Valid username:', username);
        console.log(`Adding Friend ${username}`);
        await FirebaseUtils.addFriend(BlockStackUtils.getUsername(this), username);
        this.setState({ 
          isUserameValid: true,
          errorInvalidUsername: false,
          linkToOpen: `/app/chats/${username}/`
        });
      }
      else {
        console.log('Invalid username:', username);
        this.setState({ 
          isUserameValid: false,
          errorInvalidUsername: true
        });
      }
    }
    catch (e) {
      console.error(e);
      this.setState({ errorCheckingUsername: true });
    }
  }

  _errorDialogOk = () => {
    const { errorCheckingUsername, errorInvalidUsername } = this.state;
    if (errorInvalidUsername) {
      this.setState({ errorInvalidUsername: false });
    }
    else if (errorCheckingUsername) {
      this.setState({ errorCheckingUsername: false });
    }
  }

  _renderErrorDialog = (classes) => {
    const { errorCheckingUsername, errorInvalidUsername } = this.state;

    return (
      <Dialog
        fullScreen={false}
        open={errorInvalidUsername || errorCheckingUsername}
        onClose={this._errorDialogOk}
        aria-labelledby="responsive-dialog-title">
        <DialogTitle id="responsive-dialog-title">{errorCheckingUsername ? 'Connection' : 'Invalid Username'} Error</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {
              errorInvalidUsername ? 
              'The username that you entered wasn\'t found. Please check your spelling then try again.' :
              'An error occured while checking the username. Please check your Internet connection then try again.'
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={this._errorDialogOk} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  _renderSearchBox = (classes) => {
    const { friendUsername } = this.state;

    return (
      <Box className={classes.searchBoxContainer}>
        <TextField
          className={classes.search}
          style={{ backgroundColor: 'white' }}
          id="search-view"
          fullWidth
          placeholder="moxiegirl.id.blockstack"
          variant="outlined"
          InputProps={{
            startAdornment: <InputAdornment position="start">
              <PersonAdd size="large" />
            </InputAdornment>,
            endAdornment: <InputAdornment position="start" style={{ marginRight: '-8px' }}>
              <Button variant="contained" onClick={e => this._addFriend(friendUsername)} color="primary" size="large">
                <Typography variant="button" style={{ width: '100px' }}>Add Friend</Typography>
              </Button>
            </InputAdornment>,
          }}
          value={this.state.friendUsername}
          onChange={e => this.setState({ friendUsername: e.target.value })}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
      </Box>
    );
  }

  render () {
    const { classes } = this.props;
    const { linkToOpen, friendUsername } = this.state;

    if (!BlockStackUtils.isSignedInOrPending(this)) {
      return (
        <Redirect to='/sign-in/' />
      )
    }

    if (linkToOpen) {
      return (
        <Redirect to={linkToOpen} />
      )
    }

    return (
      <Box align="center" className={classes.container}>
        <Header className={classes.header}>Add Friend</Header>
        { this._renderSearchBox(classes) }
        { this._renderErrorDialog(classes) }
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
    marginRight: theme.spacing(0),
    marginLeft: theme.spacing(0)
  },
  header: {
    marginBottom: theme.spacing(16) 
  },
  searchBoxContainer: {
    paddingRight: theme.spacing(12),
    paddingLeft: theme.spacing(12)
  }
});

export default withStyles(styles)(AddFriend);