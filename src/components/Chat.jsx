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
import { Redirect } from 'react-router-dom';

class Chat extends React.Component {
  constructor (props) {
    super(props);

    this.from = 'okibeogezi.id.blockstack';
    this.to = 'moxiegirl.id.blockstack';
    this.state = { 
      message: '',
      messages: [],
      isLoadingMessages: false,
      errorLoadingMessages: false,
      errorSendingMessage: false
    };
    BlockStackUtils.init(this);
  }

  componentDidMount () {
    this._loadMessages();
    BlockStackUtils.checkMessagesPeriodically(this, (message) => {
      console.log('New Message Received');
    });
  }

  componentDidUpdate () {
    this._goToBottom();
  }

  _loadMessages = async () => {
    const { from, to } = this;
    this.setState({ isLoadingMessages: true });
    try {
      const messages = await BlockStackUtils.loadMessages(this, from, to);
      this.setState({ 
        errorLoadingMessages: false,
        messages
      });
    }
    catch (e) {
      this.setState({ errorLoadingMessages: true });
      console.error(e);
    }
    finally {
      this.setState({ isLoadingMessages: false });
    }
  }

  _goToBottom () {
    window.scroll(0, window.innerHeight + 256);
  }

  _onClickSend = async (messageBody) => {
    const { from, to } = this;
    this.setState({ 
      message: '',
      messages: this.state.messages.concat({
        from, to, timestamp: Date.now(), body: messageBody, type: 'text'
      }) 
    });
    try {
      await BlockStackUtils.sendMessage(this, messageBody, from, to);
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
    const { to } = this;
    const { isLoadingMessages, messages } = this.state;

    if (!BlockStackUtils.isSignedInOrPending(this)) {
      return (
        <Redirect to='/sign-in/' />
      )
    }

    return (
      <Box align="center" className={classes.container}>
        <Typography align="center" className={classes.header} variant="h6">
          <i><u>{to.toUpperCase()}</u></i>
        </Typography>
        { isLoadingMessages && <CircularProgress /> }
        {
          isLoadingMessages ? '' :
          <List style={{ marginBottom: '80px' }} component="nav" aria-label="main mailbox folders">
            {
              messages.map(message => (
                <ListItem key={message.timestamp} className={classes.message}
                  style={{ 
                    justifyContent: `${message.to === this.from ? 'flex-start' : 'flex-end'}`
                  }}>
                  <Card 
                    style={{ maxWidth: '70%' }} 
                    className={message.to === this.from ? classes.messageCardStart : classes.messageCardEnd}>
                    <CardContent 
                      style={{ 
                        paddingBottom: '16px',
                        backgroundColor: `${message.to === this.from ? 'lightgrey' : '#2A7FFF'}`
                      }} 
                      className={classes.messageCardContent}>
                      <Typography 
                        style={{
                          color: `${message.to === this.from ? '#2A7FFF' : 'white'}`,
                          fontWeight: `${message.to === this.from ? '500' : '400'}`
                        }}
                        className={classes.messageText}>
                        {message.body}
                      </Typography>
                    </CardContent>
                  </Card>
                </ListItem>
              ))
            }
          </List>
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