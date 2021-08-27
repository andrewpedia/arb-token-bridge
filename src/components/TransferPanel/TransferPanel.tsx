import React, { useCallback, useContext, useEffect, useState } from 'react'

import { Provider, TransactionReceipt } from '@ethersproject/providers'
import { useLatest } from 'react-use'
import { Transaction, txnTypeToLayer } from 'token-bridge-sdk'

import { useAppState } from '../../state'
import { Button } from '../common/Button'
import { NetworkSwitchButton } from '../common/NetworkSwitchButton'
import { StatusBadge } from '../common/StatusBadge'
import { TokenModal } from '../TokenModal/TokenModal'
import { NetworkBox } from './NetworkBox'

const TransferPanel = (): JSX.Element => {
  const {
    app: {
      changeNetwork,
      selectedToken,
      isDepositMode,
      networkDetails,
      pendingTransactions,
      arbTokenBridge: { eth, token, bridgeTokens }
    }
  } = useAppState()
  const [tokeModalOpen, setTokenModalOpen] = useState(false)
  const latestEth = useLatest(eth)
  const latestNetworkDetails = useLatest(networkDetails)

  const [depositing, setDepositing] = useState(false)

  const [l1Amount, setl1Amount] = useState<string>('')
  const [l2Amount, setl2Amount] = useState<string>('')

  const deposit = async () => {
    setDepositing(true)
    try {
      const amount = isDepositMode ? l1Amount : l2Amount
      if (isDepositMode) {
        if (networkDetails?.isArbitrum === true) {
          await changeNetwork?.(networkDetails.partnerChainID)
          while (
            latestNetworkDetails.current?.isArbitrum ||
            !latestEth.current
          ) {
            await new Promise(r => setTimeout(r, 100))
          }
        }
        if (selectedToken) {
          // TODO allowed returns false even after approval
          if (!bridgeTokens[selectedToken.address]?.allowed) {
            await token.approve(selectedToken.address)
          }
          token.deposit(selectedToken.address, amount)
        } else {
          latestEth.current.deposit(amount)
        }
      } else {
        if (networkDetails?.isArbitrum === false) {
          await changeNetwork?.(networkDetails.partnerChainID)
          while (
            !latestNetworkDetails.current?.isArbitrum ||
            !latestEth.current
          ) {
            await new Promise(r => setTimeout(r, 100))
          }
        }
        if (selectedToken) {
          if (!bridgeTokens[selectedToken.address]?.allowed) {
            await token.approve(selectedToken.address)
          }
          token.withdraw(selectedToken.address, amount)
        } else {
          eth.withdraw(amount)
        }
      }
    } catch (ex) {
      console.log(ex)
    } finally {
      setDepositing(false)
    }
  }

  return (
    <>
      <TokenModal isOpen={tokeModalOpen} setIsOpen={setTokenModalOpen} />

      <div className="flex justify-between max-w-networkBox mx-auto mb-4">
        <button
          type="button"
          onClick={() => setTokenModalOpen(true)}
          className="bg-white border border-gray-300 shadow-sm rounded-md py-2 px-4"
        >
          Token: {selectedToken ? selectedToken.symbol : 'Eth'}
        </button>
        {pendingTransactions?.length > 0 && (
          <StatusBadge>{pendingTransactions?.length} Processing</StatusBadge>
        )}
      </div>
      <div className="flex flex-col w-full max-w-networkBox mx-auto mb-8">
        <div className="flex flex-col">
          <NetworkBox
            isL1
            amount={l1Amount}
            setAmount={setl1Amount}
            className={isDepositMode ? 'order-1' : 'order-3'}
          />
          <div className="h-2 relative flex justify-center order-2">
            <div className="flex items-center justify-center">
              <NetworkSwitchButton />
            </div>
          </div>
          <NetworkBox
            isL1={false}
            amount={l2Amount}
            setAmount={setl2Amount}
            className={isDepositMode ? 'order-3' : 'order-1'}
          />
        </div>

        <div className="h-6" />
        {isDepositMode ? (
          <Button
            onClick={deposit}
            disabled={depositing || (isDepositMode && l1Amount === '')}
            isLoading={depositing}
          >
            Deposit
          </Button>
        ) : (
          <Button
            onClick={deposit}
            disabled={depositing || (!isDepositMode && l2Amount === '')}
            variant="navy"
            isLoading={depositing}
          >
            Withdraw
          </Button>
        )}
      </div>
    </>
  )
}

export { TransferPanel }