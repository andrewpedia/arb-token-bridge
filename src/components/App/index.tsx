import React, { useEffect, useState } from 'react'
import styles from './styles.module.scss'
import { statement } from '@babel/template'
import { getInjectedWeb3 } from 'util/web3'
import * as ethers from 'ethers'
import * as ArbProviderEthers from 'arb-provider-ethers'
import { ArbProvider } from 'arb-provider-ethers'
import {
  useArbTokenBridge,
  TokenType,
  ContractStorage,
  BridgeToken
} from 'arb-token-bridge'
import Header from 'components/Header'
import TabsContainer from 'components/TabsContainer'
import { useLocalStorage } from '@rehooks/local-storage'

import 'bootstrap/dist/css/bootstrap.min.css'

const validatorUrl = process.env.REACT_APP_ARB_VALIDATOR_URL || ''
// const validatorUrl = 'http://64.225.27.132:1235'

const App = () => {
  const {
    walletAddress,
    balances,
    vmId,
    cache,
    token,
    bridgeTokens,
    eth
  } = useArbTokenBridge(validatorUrl, getInjectedWeb3())
  useEffect(() => {
    vmId && walletAddress && balances.update()
  }, [vmId, walletAddress])

  const [currentERC20Address, setCurrentERC20Address] = useLocalStorage(
    'currentERC20',
    ''
  )
  const [currentERC721Address, setCurrentERC721Address] = useLocalStorage(
    'currentERC721',
    ''
  )

  useEffect(() => {
    const allAddresses = Object.keys(bridgeTokens).sort()
    if (!currentERC20Address || !bridgeTokens[currentERC20Address]) {
      const firstERC20 = Object.values(bridgeTokens).find(
        token => token && token.type === TokenType.ERC20
      )
      firstERC20 && setCurrentERC20Address(firstERC20.eth.address)
    }

    if (!currentERC721Address || !bridgeTokens[currentERC721Address]) {
      const firstERC721 = Object.values(bridgeTokens).find(
        token => token && token.type === TokenType.ERC721
      )
      firstERC721 && setCurrentERC721Address(firstERC721.eth.address)
    }
  }, [bridgeTokens])

  const erc20Balance = (() => {
    if (currentERC20Address && balances.erc20[currentERC20Address]) {
      return balances.erc20[currentERC20Address]
    }
  })()
  const erc721Balance = (() => {
    if (currentERC721Address && balances.erc721[currentERC721Address]) {
      return balances.erc721[currentERC721Address]
    }
  })()

  return (
    <div className="container">
      <div className="row">
        <Header
        ethAddress={walletAddress}
        vmId={vmId}
        ethBalance={balances.eth}
        erc20Balance={erc20Balance}
        erc721Balance={erc721Balance}
        bridgeTokens={bridgeTokens}
        currentERC20Address={currentERC20Address ?? ''}
        currentERC721Address={currentERC721Address ?? ''}
        />
      </div>
      <div className="row">
        <div id="bridgebody">
          <TabsContainer
            ethBalances={balances.eth}
            erc20BridgeBalance={erc20Balance}
            addToken={token.add}
            eth={eth}
            token={token}
            erc721balance={erc721Balance}
            bridgeTokens={bridgeTokens}
            currentERC20Address={currentERC20Address ?? ''}
            currentERC721Address={currentERC721Address ?? ''}
            setCurrentERC20Address={setCurrentERC20Address}
            setCurrentERC721Address={setCurrentERC721Address}
          />
        </div>
      </div>
    </div>
  )
}

export default App
