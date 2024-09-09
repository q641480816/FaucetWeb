import './App.css';
import faucetImg from './recourses/faucet.png';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const App = () => {

  const [init, setInit] = useState(false);
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [severity, setSeverity] = useState('success');
  const [toastMessage, setToastMessage] = useState('Test');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!init) {
      getFaucetHistory();
    }
  }, [init])

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') { return; } setToastOpen(false);
  };

  const getFaucetHistory = () => {
    axios.get('http://localhost:3025/getFaucetHistory')
      .then(list => setHistory(list.data))
      .catch(err => {
        setAddress('');
        setIsSubmitting(false);
        setSeverity('error');
        setToastMessage("Error getting faucet history....");
        setToastOpen(true);
        console.log(err);
      })
  }

  const faucet = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    axios.post('http://localhost:3025/faucet', {
      address: address
    })
      .then(res => {
        setAddress('');
        setSeverity('success');
        setToastMessage('Token has been added to your address!');
        setIsSubmitting(false);
        setToastOpen(true);
        getFaucetHistory();
      })
      .catch(err => {
        setAddress('');
        setIsSubmitting(false);
        setSeverity('error');
        setToastMessage(err.response.data.reason);
        setToastOpen(true);
        console.log(err.response.data.reason)
      });
  }

  const timeDifferenceFromNow = (milliseconds) => {
    const now = Date.now(); // Get the current system time in milliseconds
    const timeDiff = Math.abs(now - milliseconds); // Calculate the absolute time difference

    // Calculate hours, minutes, and seconds
    const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
    const seconds = Math.floor((timeDiff / 1000) % 60);

    // Build the readable time difference string
    const hoursStr = hours > 0 ? `${hours} hours ` : '';
    const minutesStr = minutes > 0 ? `${minutes} minutes ` : '';
    const secondsStr = seconds > 0 ? `${seconds} seconds` : '';

    return `${hoursStr}${minutesStr}${secondsStr}`.trim();
}

  return (
    <div className="App">
      <div id="header">
        <div id="headerLogo">Some Faucet</div>
      </div>

      <div id="faucetBody">
        <div id="contentWrapper" style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="faucet-text-bold">Voting token</span>
          <span className="faucet-text-bold">Enter your wallet address and wait for your token be credited</span>
          <div id="requestBox">
            <input disabled={isSubmitting} id="addressInput" value={address} onChange={(e) => setAddress(e.target.value.trim())} />
            <div id="requestButton" style={isSubmitting ? { backgroundColor: 'grey' } : null} onClick={() => faucet()}>Receive Token</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <h1>Transaction history</h1>
        <span id="historySubTitle">Showing most recent 10 transactions cross the network</span>
      </div>

      <div id="historyBody">
        <div className='historyRow'>
          <div className='history-cell cell-title'>Address</div>
          <div className='history-cell cell-title'>Age</div>
          <div className='history-cell cell-title'>Amount</div>
        </div>
        {history.map((h, i) => {
          return (
            <div key={i} className='historyRow'>
              <div className='history-cell'>{`${h.address.substring(0, 5)}......${h.address.substring(h.address.length-5)}`}</div>
              <div className='history-cell'>{timeDifferenceFromNow(h.timestamp)}</div>
              <div className='history-cell'>{h.amount}</div>
            </div>
          )
        })}
      </div>

      <Snackbar open={toastOpen} autoHideDuration={4000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;
