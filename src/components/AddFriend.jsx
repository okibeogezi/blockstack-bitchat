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
import { Redirect } from 'react-router-dom';

// Query: https://core.blockstack.org/v1/search?query=okibeogezi.id.blockstack
class AddFriend extends React.Component {
  constructor (props) {
    super(props);

    this.state = { 
      fullName: '',
      isFullNameValid: null,
      errorCheckingFullName: false,
      errorInvalidFullName: false
    };
    BlockStackUtils.init(this);
  }

  _checkIfUserExists = async (name) => {
    let valid;
    try {
      valid = await BlockStackUtils.checkIfUserExists(name);
    }
    catch (e) {
      console.error(e);
      this.setState({ errorCheckingFullName: true });
      return;
    }

    if (valid) {
      console.log('Valid Username', name);
      BlockStackUtils.addFriend(this, name);
      this.setState({ 
        isFullNameValid: true,
        errorInvalidFullName: false
      });
    }
    else {
      console.log('Invalid Username', name);
      this.setState({ 
        isFullNameValid: false,
        errorInvalidFullName: true
      });
    }
  }

  _errorDialogOk = () => {
    const { errorCheckingFullName, errorInvalidFullName } = this.state;
    if (errorInvalidFullName) {
      this.setState({ errorInvalidFullName: false });
    }
    else if (errorCheckingFullName) {
      this.setState({ errorCheckingFullName: false });
    }
  }

  _renderErrorDialog = (classes) => {
    const { errorCheckingFullName, errorInvalidFullName } = this.state;

    return (
      <Dialog
        fullScreen={false}
        open={errorInvalidFullName || errorCheckingFullName}
        onClose={this._errorDialogOk}
        aria-labelledby="responsive-dialog-title">
        <DialogTitle id="responsive-dialog-title">{errorCheckingFullName ? 'Connection' : 'Invalid Username'} Error</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {
              errorCheckingFullName ? 
              'The username that you entered wasn\'t found. Please check your spelling the try again.' :
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
              <Button variant="contained" onClick={e => this._checkIfUserExists(e.target.value)} color="primary" size="large">
                <Typography variant="button" style={{ width: '100px' }}>Add Friend</Typography>
              </Button>
            </InputAdornment>,
          }}
          value={this.state.fullName}
          onChange={e => this.setState({ fullName: e.target.value })}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
      </Box>
    );
  }

  render () {
    const { classes } = this.props;

    if (!BlockStackUtils.isSignedInOrPending(this)) {
      return (
        <Redirect to='/sign-in/' />
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