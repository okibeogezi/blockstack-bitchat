import React from 'react';

import {
  TextField,
  Button,
  LinearProgress,
  Grid,
  Typography,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  CardContent,
  Card,
} from '@material-ui/core';

import { Redirect } from 'react-router-dom';
import NumberFormat from 'react-number-format';
import { withStyles } from '@material-ui/core/styles';

import Select from 'react-select';
import { UserSession } from 'blockstack';
import BlockStackUtils from '../lib/BlockStackUtils';

import { CRYPTOCOMPARE_API_KEY } from '../constants/appInfo';
import cryptocompare from 'cryptocompare';

import currencies from '../data/currencies.json';
import cryptocurrencies from '../data/cryptocurrencies-small.json';

cryptocompare.setApiKey(CRYPTOCOMPARE_API_KEY);

const currData = cryptocurrencies.Data
const suggestions = Object.keys(currData).map(currency => ({
  value: currData[currency].Name,
  label: `${currData[currency].Name} - ${currData[currency].CoinName}`
})).concat(
  currencies.map(currency => ({
    value: currency.ShortName,
    label: currency.FullName
  }))
);
const allCurrencies = suggestions.reduce((a, b) => a + (a && ',') + b.value, '');

function NumberFormatCustom (props) {
  const { inputRef, onChange, isFrom, isTo, that, ...other } = props;  

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={values => {
        onChange({
          target: {
            value: values.value,
            fmtValue: values.formattedValue
          }
        })
      }}
      thousandSeparator
    />
  );
}

class ResultForm extends React.Component {
  constructor (props) {
    super(props);
    
    this.state = {
      from: 'BTC',
      to: 'USD',
      inputValue: '1',
      fmtInputValue: '1',
      isLoadingData: false,
      isErrorDialogOpen: false
    };

    // this.userSession = new UserSession();
    BlockStackUtils.init(this);
  }

  componentDidMount () {
    this._loadCurrencyData();
  }

  _getAllCurrencies () {
    return allCurrencies;
  }

  async _loadCurrencyData () {
    try {
      this.setState({isLoadingData: true});
      const all = this._getAllCurrencies();
      this._converter = await cryptocompare.priceMulti(all, all);
    }
    catch (e) {
      this.setState({isErrorDialogOpen: true});
      console.error(e);
    }
    finally {
      this.setState({isLoadingData: false});
    }
  }

  _errorDialogCancel = () => {
    this.setState({isErrorDialogOpen: false});
  }

  _errorDialogRetry = () => {
    this.setState({isErrorDialogOpen: false});
    this._loadCurrencyData();
  }

  _generateOutputValue = () => {
    if (!this._converter) {
      return '-';
    }
    const { from, to, inputValue } = this.state;
    const input = parseFloat(inputValue);
    return this._convert(from, to, input) || 0;
  }

  _convert (from, to, input) {
    let res = 0;
    const fromF = this._converter[from];
    const fromT = this._converter[to];
    if (!fromF && !fromT) {}
    else if (fromF) {
      res = fromF[to] * input;
    }
    else if (fromT) {
      res = (1 / fromT[from]) * input;
    }
    else {}
    console.log(`${input} ${from} to ${to} = ${to} ${res}`)
    return res;
  }

  _renderButtonRow = (classes, buttons) => {
    return (
      <Grid container>
        {
          buttons.map(button => (
            <Grid item xs key={button}>
              { this._renderButton(classes, button) }
            </Grid>
          ))
        }
      </Grid>
    )
  }

  _onClick = (text) => {
    const { inputValue, fmtInputValue } = this.state;

    if (text === 'x') {
      this.setState({ inputValue: '0', fmtInputValue: '0' });
    }
    else if (text === '.' && inputValue.includes('.')) {}
    else if (text === '.' && inputValue.length === 1 && inputValue[0] === '0') {
      this.setState({ 
        inputValue: inputValue + text,
        fmtInputValue: fmtInputValue + text
      });
    }
    else if (text === '.' && inputValue[inputValue.length - 1] === '0') {
      this.setState({ 
        inputValue: inputValue.slice(1) + text,
        fmtInputValue: fmtInputValue.slice(1) + text
      });
    }
    else if (inputValue.startsWith('0')) {
      this.setState({ 
        inputValue: inputValue.slice(1) + text, 
        fmtInputValue: fmtInputValue.slice(1) + text 
      });
    }
    else {
      this.setState({ 
        inputValue: inputValue + text, 
        fmtInputValue: fmtInputValue + text 
      });
    }
  }

  _renderButton = (classes, text) => {
    return (
      <Box>
        <Button onClick={e => this._onClick(text)} size="large" fullWidth className={classes.button} variant="contained" color="primary">
          <Typography variant="h4">
            {text}
          </Typography>
        </Button>
      </Box>
    )
  }

  _renderFromCurrencyView = (classes) => {
    return (
      <Box className={classes.fromOrTo}>
        <Box>
          <Typography variant="h6" style={{ fontSize: '1.05rem' }} align="left">
            <i>From Currency</i>
          </Typography>
        </Box>
        <Box className={classes.cardActions}>
          <Select
            classes={classes}
            inputId="from-select"
            TextFieldProps={{
              label: 'Cryptocurrency',
              InputLabelProps: {
                htmlFor: 'from-select',
                shrink: true,
              },
            }}
            placeholder={`${this.state.from}...`}
            options={suggestions}
            value={this.state.from}
            onChange={e => this.setState({from: e.value})}
          />
        </Box>
      </Box>
    )
  }

  _renderToCurrencyView = (classes) => {
    return (
      <Box className={classes.fromOrTo}>
      <Box>
        <Typography variant="h6" style={{ fontSize: '1rem' }} align="left">
          <i>To Currency</i>
        </Typography>
      </Box>
      <Box className={classes.cardActions}>
        <Select
          classes={classes}
          inputId="to-select"
          TextFieldProps={{
            label: 'Cryptocurrency',
            InputLabelProps: {
              htmlFor: 'to-select',
              shrink: true,
            },
          }}
          placeholder={`${this.state.to}...`}
          options={suggestions}
          value={this.state.from}
          onChange={e => this.setState({to: e.value})}
        />
      </Box>
    </Box>
    )
  }

  _renderFromAndToViews = (classes) => {
    return (
      <Grid container>
        <Grid item xs className={classes.fromSelect}>
          { this._renderFromScreen(classes) }  
        </Grid>
        <Grid item xs className={classes.toSelect}>
          { this._renderToScreen(classes) }  
        </Grid>
      </Grid>
    )
  } 

  _renderFromScreen = (classes, from) => {
    return (
      <Box>
        <TextField
          style={{ backgroundColor: 'white' }}
          id="from-input"
          type="text"
          fullWidth
          variant="outlined"
          InputProps={{
            startAdornment: <InputAdornment position="start">
              <Typography variant="h6">
                {from}
              </Typography>
            </InputAdornment>,
            inputComponent: NumberFormatCustom,
          }}
          value={this.state.fmtInputValue}
          onChange={e => this.setState({ 
            inputValue: e.target.value, 
            fmtInputValue: e.target.fmtValue 
          })}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
      </Box>
    )
  }

  _renderToScreen = (classes, to) => {
    return (
      <Box>
        <TextField
          style={{ backgroundColor: 'white' }}
          id="to-output"
          fullWidth
          variant="outlined"
          InputProps={{
            startAdornment: <InputAdornment position="start">
              <Typography variant="h6">
                {to}
              </Typography>
            </InputAdornment>,
            readOnly: true,
            inputComponent: NumberFormatCustom,
          }}
          value={this._generateOutputValue()}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
      </Box>
    )
  }

  _renderCalculatorScreen = (classes) => {
    const { from, to } = this.state;

    return (
      <Grid container>
        <Grid item xs className={classes.from}>
          { this._renderFromScreen(classes, from) }  
        </Grid>
        <Grid item xs className={classes.to}>
          { this._renderToScreen(classes, to) }  
        </Grid>
      </Grid>
    )
  }

  _renderAllButtons = (classes) => {
    return (
      <Grid container className={classes.container}>
        { this._renderButtonRow(classes, ['1', '2', '3', '4']) }
        { this._renderButtonRow(classes, ['5', '6', '7', '8']) }
        { this._renderButtonRow(classes, ['9', '0', '.', 'x']) }
      </Grid>
    )
  }

  _renderCalculator = (classes) => {
    return (
      <Box className={classes.container}>
        { this._renderCalculatorScreen(classes) }
        { this._renderAllButtons(classes) }
      </Box>
    )
  }

  _renderFromAndToViews = (classes) => {
    return (
      <Grid container>
        <Grid item xs className={classes.fromSelect}>
          { this._renderFromCurrencyView(classes) }  
        </Grid>
        <Grid item xs className={classes.toSelect}>
          { this._renderToCurrencyView(classes) }  
        </Grid>
      </Grid>
    )
  } 

  _renderErrorDialog = (classes) => {
    return (
      <Dialog
        fullScreen={false}
        open={this.state.isErrorDialogOpen}
        onClose={this._errorDialogCancel}
        aria-labelledby="responsive-dialog-title">
        <DialogTitle id="responsive-dialog-title">Connection Error</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A error occured while we were trying to download some data that the app needs to work. Please check your Internet connection then try again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={this._errorDialogCancel} color="secondary">
            Cancel
          </Button>
          <Button variant="contained" onClick={this._errorDialogRetry} color="primary" autoFocus>
            Retry
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  render () {
    const { classes } = this.props;

    if (!BlockStackUtils.isSignedInOrPending(this)) {
      return (
        <Redirect to='/sign-in/' />
      )
    }

    return (
      <Box className={classes.container}>
        { this._renderErrorDialog(classes) }
        { this._renderFromAndToViews(classes) }
        <Card className={classes.calculator}>
          { this.state.isLoadingData && <LinearProgress /> }
          <CardContent>
            { this._renderCalculator(classes) }                  
          </CardContent>
        </Card>
      </Box>
    );
  }
};

const styles = theme => ({
  textField: {},
  button: {
    margin: theme.spacing(0),
    padding: theme.spacing(2),
    borderRadius: 0,
  },
  heading: {},
  container: {
    // display: 'flex',
    flexGrow: 1,
    flexWrap: 'wrap',
  },
  subContainer: {
    flexGrow: 1
  },
  fromSelect: {
    marginRight: theme.spacing(1)
  },
  toSelect: {
    marginLeft: theme.spacing(1)
  },
  from: {
    marginBottom: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  to: {
    marginBottom: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
  calculator: {
    marginTop: theme.spacing(2),
    backgroundColor: 'lightgrey'
  }
});

export default withStyles(styles)(ResultForm);