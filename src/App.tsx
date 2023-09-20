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

import { BrowserRouter as Router, useLocation, Route, Routes, Link, useParams } from 'react-router-dom';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

let network: any = null;
const MerchantPage = () => {
  const {theme, setTheme} = useTheme()
  const [url, setUrl] = React.useState<any>(null)
  const { bytecode, floreAddress, value } = useParams();
  const [amount, setAmount] = React.useState<any>(null)
  const [tip, setTip] = React.useState<any>()
  const [init, setInit] = React.useState<any>(false)
  const [connected, setConnected] = React.useState<any>(false)
  const [tokenAddress, setTokenAddress] = React.useState<any>('')
  const [merchantAddress, setMerchantAddress] = React.useState<any>(null)
  const [test, setTest] = React.useState<any>(null)

  let query = useQuery();

  React.useEffect(() => {
    if(query.get('network')){
      setTest(query.get('network'))
      sequence.initWallet({defaultNetwork: query.get('network')!})
    }else {
      setTest(query.get('network'))
      sequence.initWallet({defaultNetwork: 'polygon'})
    }
  }, [])

  const pay = async () => {
      const wallet = sequence.getWallet()
    
      // Craft your transaction
      const erc20Interface = new ethers.utils.Interface([
        'function transfer(address _to, uint256 _value) public returns (bool)'
      ])

      const data = erc20Interface.encodeFunctionData(
        'transfer', [query.get('receiver'), tip]
      )

      const txn1: any = {
        to: query.get('tokenAddress'),
        data: query.get('data')
      }

      const txn2: any = {
        to: query.get('tokenAddress'),
        data: data
      }

      const network2chainId: any = {
        'polygon': 137,
        'polygon-zkevm': 1101,
        'arbitrum': 42161,
        'arbitrum-nova': 42170,
        'optimism': 10,
        'bsc': 97,
        'avalanche': 43114,
        'base': 8453
      }
      alert(network2chainId[query.get('network')!])
      const signer = wallet.getSigner(network2chainId[query.get('network')!])
      try {
        const txRes = await signer.sendTransaction([txn1, txn2])
        console.log(txRes)
      }catch(err){
        console.log(err)
      }
  }

  const selectAmount = async (amount: number) => {
  
    // Craft your transaction
    const erc20Interface = new ethers.utils.Interface([
      'function transfer(address _to, uint256 _value) public returns (bool)'
    ])

    const data = erc20Interface.encodeFunctionData(
      'transfer', [merchantAddress, amount]
    )

    setUrl(`https://crimson-thunder-2272.on.fleek.co/?data=${data}&?network=${network}&?receiver=${merchantAddress}&?tokenAddress=${tokenAddress}?&value=${amount}`)

  }

  const login = async () => {
    const wallet = sequence.getWallet()
    const details = await wallet.connect({app: 'qr checkout'})
    if(details.connected){
      setMerchantAddress(details.session?.accountAddress)
    }
  }

  React.useEffect(() => {
    console.log(network)
    if(!init){
      setInterval(async () => {
        try{
          const networks = ['polygon','polygon-zkevm','arbitrum','arbitrum-nova','optimism','bsc','avalanche','base']
          if(networks.includes(network)){
            const provider = new ethers.providers.JsonRpcProvider(`https://nodes.sequence.app/${network}`);
            const blockNumber = await provider.getBlockNumber();
            if(blockNumber){
              setConnected(true)
            }
          } else {
            setConnected(false)
          }
        }catch(err){
          console.log(err)
          setConnected(false)
        }
      }, 1000 )
      setInit(true)
    }
  }, [network])
  
  return (
    <div>
      {
        query.get('value') ? 
        <>
          <br/>
          <br/>
          <p style={{color: 'lime'}}> {test}</p>
          <br/>
          <Box justifyContent={'center'}>
            {theme == 'light' ? <img src='https://docs.sequence.xyz/img/icons/sequence-composite-light.svg' /> : <img src="https://docs.sequence.xyz/img/icons/sequence-composite-dark.svg" />}
          </Box>
          <br/>
          <br/>
          <p>Paying {query.get('value')} + <span style={{color: 'blue'}}>{tip ? tip : 0}</span> in {query.get('tokenAddress')?.slice(0,4)}...</p>
          <br/>
          <p style={{color: 'blue'}}>add tip</p>
          <br/>
          <Box justifyContent={'center'} gap='4'>
            <Card width='16' onClick={() => {setTip(Number(query.get('value'))*.1)}}>10%</Card>
            <Card width='16' onClick={() => {setTip(Number(query.get('value'))*.15)}}>15%</Card>
            <Card width='16' onClick={() => {setTip(Number(query.get('value'))*.2)}}>20%</Card>
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
            <Button onClick={() => pay()} label="Checkout with Sequence"/>
          </Box>
        </>
        : 
          <>
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
              <p>Checkout</p>
              <br/>
              {
                merchantAddress ? 
                <>
                <p style={{color: 'lime'}}>
                { connected ? 'connected' : null } </p>
                <br/>
                <Box  justifyContent={'center'}>
                  <Input placeholder="network" style={{textAlign: 'center'}} onChange={(evt: any) => {
                    if(evt.target.value != ''){
                      // setNetwork(evt.target.value)
                      network = evt.target.value
                    }
                  }} />
                </Box>
                <br/>
                <Box  justifyContent={'center'}>
                  <Input placeholder="token" style={{textAlign: 'center'}} onChange={(evt: any) => {
                    if(evt.target.value != ''){
                      setTokenAddress(evt.target.value)
                    }
                  }} />
                </Box>
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
                </>
                : 
                <>
                <br/>
                <p>create payments direct from a qr code</p>
                <br/>
                <br/>
                  <Box justifyContent={'center'}>
                    <Button onClick={() => login()} label="Login with Sequence"/>
                  </Box>
                </>
              }
          </>
      }
    </div>
  );
};

const App = () => {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<MerchantPage />} />
        </Routes>
    </Router>
  );
};

export default App;