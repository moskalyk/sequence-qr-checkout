import React from 'react';
import { sequence } from '0xsequence'
import { ethers } from 'ethers'
import QRCodeGenerator from './QRCodeGenerator';
import './App.css'

import { 
  TextInput as Input,
  Box, 
  IconButton,
  SunIcon,
  MoonIcon,
  Button,
  Card,
  useTheme } from '@0xsequence/design-system'

import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';

// Merchant page component
const MerchantPage = () => {
  const {theme, setTheme} = useTheme()
  const [url, setUrl] = React.useState<any>(null)
  const selectAmount = async (amount: number) => {
    const flore20ContractAddress = '0x6efa2ea57b5ea64d088796af72eddc7f5393dd2b'
  
    // Craft your transaction
    const erc20Interface = new ethers.utils.Interface([
      'function transfer(address _to, uint256 _value) public returns (bool)'
    ])

    const data = erc20Interface.encodeFunctionData(
      'transfer', [flore20ContractAddress, amount]
    )

    setUrl(`https://1551-99-239-106-94.ngrok-free.app/pay/${data}/${flore20ContractAddress}/${amount}`)

  }
  return (
    <div>
      <br/>
      <Box gap='6'>
        <IconButton style={{position: 'fixed', top: '20px', right: '20px'}} icon={theme == 'light' ? SunIcon : MoonIcon } onClick={() => {
          setTheme(theme == 'dark' ? 'light' : 'dark')
        }}/>
      </Box>
      <br/>
      <Box  justifyContent={'center'}>
        {theme == 'light' ? <img src='https://docs.sequence.xyz/img/icons/sequence-composite-light.svg' /> : <img src="https://docs.sequence.xyz/img/icons/sequence-composite-dark.svg" />}
      </Box>
      <br/>
      <p>Checkout in _</p>
      <br/>
      <br/>
      <br/>
      <Box  justifyContent={'center'}>
        <Input placeholder="$0" style={{textAlign: 'center'}} onChange={(evt: any) => {
          if(evt.target.value != ''){
            selectAmount(evt.target.value)
          }
        }} />
      </Box>
      <br/>
      <br/>
      <QRCodeGenerator url={url} />
    </div>
  );
};

// Pay page component
const PayPage = () => {
  const {theme, setTheme} = useTheme()
  const { bytecode, floreAddress, value } = useParams();
  const [amount, setAmount] = React.useState<any>(null)
  const [tip, setTip] = React.useState<any>()

  sequence.initWallet('polygon')

  const pay = async () => {
      const wallet = sequence.getWallet()
      const details = await wallet.connect({app: 'pay', networkId: 137 })

      const flore20ContractAddress = '0x6efa2ea57b5ea64d088796af72eddc7f5393dd2b'
    
      // Craft your transaction
      const erc20Interface = new ethers.utils.Interface([
        'function transfer(address _to, uint256 _value) public returns (bool)'
      ])

      const data = erc20Interface.encodeFunctionData(
        'transfer', [flore20ContractAddress, amount]
      )

      const txn1 = {
        to: floreAddress,
        data: bytecode
      }

      const txn2 = {
        to: floreAddress,
        data: data
      }
      const signer = wallet.getSigner()
      const txRes = await signer.sendTransactionBatch([txn1, txn2])
      console.log(txRes)
  }

  React.useEffect(() => {
    setAmount(value)
  }, [])
  
  return (
    <div>
      <br/>
      <br/>
      <br/>
      <Box justifyContent={'center'}>
        {theme == 'light' ? <img src='https://docs.sequence.xyz/img/icons/sequence-composite-light.svg' /> : <img src="https://docs.sequence.xyz/img/icons/sequence-composite-dark.svg" />}
      </Box>
      <br/>
      <br/>
      <p>Paying {amount} + <span style={{color: 'blue'}}>{tip ? tip : 0}</span> in _</p>
      <br/>
      <p style={{color: 'blue'}}>add tip</p>
      <br/>
      <Box justifyContent={'center'} gap='4'>
        <Card width='16' onClick={() => {setTip(Number(value)*.1)}}>10%</Card>
        <Card width='16' onClick={() => {setTip(Number(value)*.15)}}>15%</Card>
        <Card width='16' onClick={() => {setTip(Number(value)*.2)}}>20%</Card>
      </Box>
      <br/>
      <Box  justifyContent={'center'}>
      <Input placeholder="$0" value={tip} style={{textAlign: 'center'}} onChange={(evt: any) => {
          setTip(evt.target.value)
      }} />
      </Box>
      <br/>
      <br/>
      <Box justifyContent={'center'}>
        <Button onClick={pay} label="Checkout with Sequence"/>
      </Box>
    </div>
  );
};

// App component
const App = () => {
  return (
    <Router>
        <Routes>
          <Route path="merchant" element={<MerchantPage />} />
          <Route path="pay/:bytecode/:floreAddress/:value" element={<PayPage />} />
        </Routes>
    </Router>
  );
};

export default App;