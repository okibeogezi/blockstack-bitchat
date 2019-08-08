import React from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { APP_NAME } from '../constants/appInfo';
import { 
    Typography,
    Box,
    Button,
    Card,
    CardContent,
    CardActions
} from '@material-ui/core';
import { 
    OpenInNew, 
    Message, 
} from '@material-ui/icons';
import Header from './Header';

const styles = theme => ({
    ctaButton: {
        margin: theme.spacing(1)
    },
    firstBox: {
        marginBottom: theme.spacing(4)
    },
    card: {
        backgroundColor: '#EEE'
    },
    buttonIcon: {
        marginLeft: theme.spacing(2)
    },
    titleIcon: {
        marginTop: theme.spacing(2),
        marginRight: theme.spacing(2)
    },
    cardActions: {
        justifyContent: 'center'
    },
    iconLink: {
        marginBottom: theme.spacing(-0.75),
        textDecoration: 'none',
        color: 'white'
    }
});

class Landing extends React.Component {
    _renderSlideshow () {
        return (
            <Box>
            </Box>
        )
    }
    render () {
        const { classes } = this.props;

        return (
            <Box>
                <Header>Welcome to {APP_NAME}</Header>

                <Box className={classes.firstBox}>
                    <Card className={classes.card}>
                        <CardContent>
                            <Typography variant="body1" align="center">
                                {APP_NAME} is a decentralized and highly encrypted messaging service.
                            </Typography>
                        </CardContent>
                        <CardActions>
                            { this._renderSlideshow() }
                        </CardActions>
                    </Card>
                </Box>

                <Box>
                    <Card className={classes.card}>
                        <CardContent>
                            <Typography variant="h5" align="center">
                                <Message size="large" className={classes.titleIcon} />
                                Welcome To Secure Messaging
                            </Typography>
                        </CardContent>
                        <CardActions className={classes.cardActions}>
                            <Button size="large" variant="contained" color="secondary" align="center" className={classes.ctaButton}>
                                <Link className={classes.iconLink} to="/app/">
                                    Get Started
                                </Link>
                                <Link className={classes.iconLink} to="/app/">
                                    <OpenInNew className={classes.buttonIcon} />
                                </Link>
                            </Button>
                        </CardActions>
                    </Card>
                </Box>
            </Box>
        )
    }
};

export default withStyles(styles)(Landing);