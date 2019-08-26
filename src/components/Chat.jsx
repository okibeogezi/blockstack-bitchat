import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import { 
  Box,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  Typography,
  Card, 
  CardContent
} from '@material-ui/core';
import { Message } from '@material-ui/icons';
import Header from './Header';
import BlockStackUtils from '../lib/BlockStackUtils';
import FirebaseUtils from '../lib/FirebaseUtils';
import { Redirect } from 'react-router-dom';
import _ from 'lodash';

const TIME_FREQUENCY = 10;

class Chat extends React.Component {
  constructor (props) {
    super(props);

    BlockStackUtils.init(this);
    this.senderUsername = BlockStackUtils.getUsername(this);
    this.receiverUsername = this.props.match.params.friendUsername;
    this.state = { 
      message: '',
      messages: [],
      newMessages: [],
      isLoadingMessages: false,
      errorLoadingMessages: false,
      errorSendingMessage: false,
      inBackground: false,
    };
  }

  componentDidMount () {
    this._loadMessages();
  }

  componentWillUnmount () {
    this.setState({ inBackground: true });
  }

  componentDidUpdate () {
    this._goToBottom();
  }

  _loadMessages = async (repeatIndefinitely = true, timeFrequency = TIME_FREQUENCY, isRepeat = false) => {
    const { senderUsername, receiverUsername } = this;
    const { inBackground, sendPending } = this.state;
    !isRepeat && this.setState({ isLoadingMessages: true });

    try {
      const messages = await FirebaseUtils.loadMessages(senderUsername, receiverUsername);
      if (sendPending) {
        this.setState({ errorLoadingMessages: false });
      }
      else {
        this.setState({ 
          errorLoadingMessages: false,
          messages: messages
        });
      }
      if (repeatIndefinitely && !inBackground) {
        console.log(`Checking messages in ${timeFrequency} seconds`);
        setTimeout(() => {
            console.log(`Checking messages now`);
            this._loadMessages(repeatIndefinitely, timeFrequency, true);
          },
          timeFrequency * 1000);
      }
    }
    catch (e) {
      !isRepeat && this.setState({ errorLoadingMessages: true });
      console.error(e);
    }
    finally {
      !isRepeat && this.setState({ isLoadingMessages: false });
    }
  }

  _goToBottom () {
    window.scroll(0, window.innerHeight + 256);
  }

  _onClickSend = async (messageBody) => {
    const { senderUsername, receiverUsername } = this;
    const newMessage = {
      senderUsername, receiverUsername, timestamp: Date.now(), body: messageBody, type: 'text'
    };
    this.setState({ 
      message: '',
      messages: this.state.messages.concat(newMessage)
    });
    try {
      this.setState({ sendPending: true });
      await FirebaseUtils.sendMessage(messageBody, senderUsername, receiverUsername);
      this.setState({ sendPending: false });
    }
    catch (e) {
      this.setState({ errorSendingMessage: true });
      console.error(e);
    }
  }

  _errorDialogRetry = () => {
    const { errorLoadingMessages,  errorSendingMessage } = this.state;
    if (errorLoadingMessages) {
      this._loadMessages();
      this.setState({ errorLoadingMessages: false });
    }
    else if (errorSendingMessage) {
      const { messages } = this.state;
      this.setState({ 
        errorSendingMessage: false,
        messages: messages.slice(0, messages.length - 1)
      });
    }
  }

  _renderErrorDialog = (classes) => {
    const { errorLoadingMessages,  errorSendingMessage } = this.state;

    return (
      <Dialog
        fullScreen={false}
        open={errorLoadingMessages || errorSendingMessage}
        onClose={this._errorDialogRetry}
        aria-labelledby="responsive-dialog-title">
        <DialogTitle id="responsive-dialog-title">Connection Error</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`An error occured while ${errorLoadingMessages ? 'loading your messages' : 'sending your message'}. Check your Internet connection then try again.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={this._errorDialogRetry} color="primary" autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  _renderSendMessageBox = (classes) => {
    const { message } = this.state;

    return (
      <Box className={classes.messageBoxContainer}>
        <TextField
          className={classes.search}
          id="search-view"
          style={{ backgroundColor: 'white' }}
          fullWidth
          placeholder="Send message..."
          variant="outlined"
          InputProps={{
            startAdornment: <InputAdornment position="start">
              <Message size="large" />
            </InputAdornment>,
            endAdornment: <InputAdornment position="start" style={{ marginRight: '-8px' }}>
              <Button variant="contained" onClick={e => message.trim() && this._onClickSend(message)} color="primary" size="large">
                Send
              </Button>
            </InputAdornment>,
          }}
          value={this.state.message}
          onChange={e => this.setState({ message: e.target.value })}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
      </Box>
    );
  }

  render () {
    const { classes } = this.props;
    const { receiverUsername } = this;
    const { isLoadingMessages, messages } = this.state;

    if (!BlockStackUtils.isSignedInOrPending(this)) {
      return (
        <Redirect to='/sign-in/' />
      )
    }

    return (
      <Box align="center" className={classes.container}>
        <Typography align="center" className={classes.header} variant="h6">
          <i><u>{receiverUsername.toUpperCase()}</u></i>
        </Typography>
        { isLoadingMessages && <CircularProgress /> }
        {
          isLoadingMessages ? '' :
          messages.length ?
          <List style={{ marginBottom: '80px' }} component="nav" aria-label="main mailbox folders">
            {
              messages.map(message => (
                <ListItem key={message.timestamp} className={classes.message}
                  style={{ 
                    justifyContent: `${message.receiverUsername === this.senderUsername ? 'flex-start' : 'flex-end'}`
                  }}>
                  <Card 
                    style={{ maxWidth: '70%' }} 
                    className={message.receiverUsername === this.senderUsername ? classes.messageCardStart : classes.messageCardEnd}>
                    <CardContent 
                      style={{ 
                        paddingBottom: '16px',
                        backgroundColor: `${message.receiverUsername === this.senderUsername ? 'lightgrey' : '#00D4AA'}`
                      }} 
                      className={classes.messageCardContent}>
                      <Typography 
                        style={{
                          color: `${message.receiverUsername === this.senderUsername ? '#00D4AA' : 'white'}`,
                          fontWeight: `${message.receiverUsername === this.senderUsername ? '500' : '400'}`
                        }}
                        className={classes.messageText}>
                        {message.body}
                      </Typography>
                    </CardContent>
                  </Card>
                </ListItem>
              ))
            }
          </List> :
          <Typography variant="button">No Messages Yet.</Typography>
        }
        { this._renderSendMessageBox(classes) }
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
    marginBottom: theme.spacing(4) 
  },
  message: {},
  messageCardContent: {},
  messageCardEnd: {
    borderTopRightRadius: theme.spacing(2),
    borderTopLeftRadius: theme.spacing(2),
    borderBottomLeftRadius: theme.spacing(2),
  },
  messageCardStart: {
    borderTopRightRadius: theme.spacing(2),
    borderTopLeftRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
  },
  messageText: {},
  messageBoxContainer: {
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    position: 'fixed',
    bottom: theme.spacing(1),
    left: theme.spacing(1),
    right: theme.spacing(1)
  }
});

export default withStyles(styles)(Chat);