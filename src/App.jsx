import React from 'react';

import './App.css';
import 'typeface-roboto';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Routes from './components/Routes';
import { 
  AppProvider,
  AppContext
} from './components/AppContext';
import { BrowserRouter as Router } from 'react-router-dom';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

const theme = createMuiTheme({ palette: { 
  primary: {
    main: '#00AA88',
    contrastText: '#FFF'
  },
  secondary: {
    main: '#008066',
    contrastText: '#FFF'
  }
}});

export default class App extends React.Component {
  render () {
    return (
      <MuiThemeProvider theme={theme}>
        <AppProvider onAuthStateChanged={this._onAuthStateChanged}>
          <Router>
            <Navbar />
            <Box m={2}>
              <Routes />
            </Box>
            <Footer />
          </Router>
        </AppProvider>
      </MuiThemeProvider>
    );
  }
};

App.contextType = AppContext;