import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  SwipeableDrawer,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import {
  Apps,
  OpenInNew,
  PersonAdd,
  ExitToApp
} from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../constants/appInfo';
import { connect } from 'react-redux';
import { UserSession } from 'blockstack';
import BlockStackUtils from '../lib/BlockStackUtils';

class Navbar extends React.Component {
  constructor (props) {
    super(props);

    this.state = { isDrawerOpen: false };
    BlockStackUtils.init(this);
  }

  _getMenu (classes) {
    return [
      { title: 'Log Out', icon: <ExitToApp className={classes.iconInButton} />, link: '/log-out/' },
      { title: 'Sign In', icon: <OpenInNew className={classes.iconInButton} />, link: '/sign-in/' },
      { title: 'App', icon: <Apps className={classes.iconInButton} />, link: '/app/' },
      { title: 'Add Friend', icon: <PersonAdd className={classes.iconInButton} />, link: '/app/add/friend/' },
    ]
  }

  _visitLink = (link) => {
    this.props.history.push(link);
  }

  _shouldShow = (title) => {
    if ((title === 'Log Out' || title === 'Add Friend') 
        && BlockStackUtils.isSignedInOrPending(this)) {
      return 'block';
    }
    else if (title === 'Sign In' && !BlockStackUtils.isSignedInOrPending(this)) {
      return 'block';
    }
    else if (title === 'App') {
      return 'block'
    }
    else {
      return 'none';
    }
  }

  _closeDrawer = () => this.setState({ isDrawerOpen: false });

  _openDrawer = () => this.setState({ isDrawerOpen: true });

  _renderSiwpeableDrawer = (classes) => {
    return (
      <SwipeableDrawer
        open={this.state.isDrawerOpen} onOpen={this._openDrawer} onClose={this._closeDrawer}>
        <Box onClick={this._closeDrawer} onKeyDown={this._closeDrawer}> 
          <List>
            {
              this._getMenu(classes).map(({ title, icon, link }) => (
                <Box key={title} display={this._shouldShow(title)}>
                  <ListItem button color="inherit" style={{ marginRight: '16px' }}>
                    <Link to={link}><ListItemIcon>{icon}</ListItemIcon></Link>
                    <Link
                      style={{ textDecoration: 'none', color: 'inherit' }}
                      to={link}>
                      <ListItemText primary={title} />
                    </Link>
                  </ListItem>
                </Box>
              ))
            }
          </List>
        </Box>
      </SwipeableDrawer>
    )
  }

  _renderToolbarMenu = (classes) => {
    const getDisplay = (title) => 
      this._shouldShow(title) === 'block' ? { xs: 'none', sm: 'none', md: 'block' } : 'none';

    return this._getMenu(classes).map(({ title, icon, link }) => (
      <Box display={getDisplay(title)} key={title}>
        <Button color="inherit">
          <Link className={classes.iconLink} to={link}>
            {icon}
          </Link>
          <Link className={classes.link} to={link}>
            {title}
          </Link>
        </Button>
      </Box>
    ))
  }

  render () {
    const { classes } = this.props;

    return (
      <Box className={classes.root}>
        <AppBar position="static" className={classes.appBar}>
          <Toolbar>
            <IconButton onClick={this._openDrawer} edge="start" className={classes.menuButton} color="inherit" aria-label="Menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              <Link className={classes.link} to="/">{APP_NAME}</Link>
            </Typography>
            { this._renderToolbarMenu(classes) }
          </Toolbar>
        </AppBar>
        { this._renderSiwpeableDrawer(classes) }
      </Box>
    );
  }
};

const styles = (theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  appBar: {
    backgroundColor: '#2A7FFF'
  },
  iconInButton: {
    marginRight: theme.spacing(1),
  },
  link: {
    textDecoration: 'none',
    color: 'white'
  },
  iconLink: {
    marginBottom: theme.spacing(-0.5),
    textDecoration: 'none',
    color: 'white'
  }
}));

const mapStateToProps = state => {
  return { signedIn: state.signedIn };
};

export default connect(mapStateToProps)(withStyles(styles)(Navbar));