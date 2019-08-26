import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  Container, 
  Box
} from '@material-ui/core';
import {
  FavoriteOutlined
} from '@material-ui/icons';

const styles = theme => ({
  loveIcon: {
    color: 'red'
  },
  credits: {
    marginTop: theme.spacing(4)
  }
});

class Footer extends React.Component {
  render () {
    const { classes } = this.props;
    const isChatsPage = window.location.href.includes('/app/chats/') && 
      !window.location.href.endsWith('/app/chats/');
    console.log('isChatsPage:', isChatsPage);

    return (
      isChatsPage ? '' :
      <footer className="page-footer transparent center-align">
        <Container>
          <Box>
            <Typography variant="subtitle1" className={classes.credits} align="center">
              Designed with&nbsp;
              <FavoriteOutlined className={classes.loveIcon} />
              &nbsp;by&nbsp;
              <a href="https://github.com/okibeogezi">
                Mike Ogezi
              </a>
            </Typography>
          </Box>
        </Container>
      </footer>
    );
  }
};

export default withStyles(styles)(Footer);