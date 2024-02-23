import { z } from 'zod'

import {
  CoinbaseCommercePayment,
  zodCoinbaseCommercePayment,
} from '@/utils/server/coinbaseCommerce/paymentRequest'

const v1Response = `	
{
  "attempt_number": 5,
  "event": {
    "api_version": "2018-03-22",
    "created_at": "2024-02-23T05:48:55Z",
    "data": {
      "addresses": {
        "apecoin": "0x375d15a20d1394783b76d2de4732c0c4cfc76d92",
        "bitcoin": "3PNRp5FQr3AA7S4sjBR1V9SvVR1c6yVYX7",
        "bitcoincash": "qqzgghasylsweu2zedgwv465l8lzmfn5duk6mh4pwd",
        "dai": "0x1a8fcf8678854f0c5dfe5540da3593c4b2042b3b",
        "dogecoin": "D83UwwHGE91ZL1o1MqeS9jxBQMniNbaD36",
        "ethereum": "0x86a1481ee3aaf8c75d1afd087ecf71872c1b48c1",
        "litecoin": "MSjFVbyqCqnGGF9SDFrwoEufkWiGJsBSFw",
        "polygon": "0xcc65a5ce133c0b7633a9b08e558cbd937b229f1b",
        "pusdc": "0xe1632dc30744dd9ce8b05e5a0ccbcf0248d4f2b9",
        "pweth": "0x86a1481ee3aaf8c75d1afd087ecf71872c1b48c1",
        "shibainu": "0xc4dee69b541d45bb59bff4320927534f3f61e78e",
        "tether": "0x3126198bccbb1a0685c3a4d95f8285e386bbfd42",
        "usdc": "0x8993c79e2847c886c253c5e9c512a6bf0cfc1e5d"
      },
      "brand_color": "#122332",
      "brand_logo_url": "",
      "cancel_url": "https://www.standwithcrypto.org?sessionId=random-uuid",
      "code": "RANDOMCODE",
      "coinbase_managed_merchant": true,
      "collected_email": true,
      "confirmed_at": "2024-02-23T05:48:54Z",
      "created_at": "2024-02-23T05:42:37Z",
      "exchange_rates": {
        "APE-USD": "1.6645",
        "BCH-USD": "261.355",
        "BTC-USD": "51129.775",
        "DAI-USD": "0.99985",
        "DOGE-USD": "0.08401",
        "ETH-USD": "2955.4",
        "LTC-USD": "68.46",
        "PMATIC-USD": "0.9839",
        "PUSDC-USD": "1.0",
        "PWETH-USD": "2954.685",
        "SHIB-USD": "0.00000952",
        "USDC-USD": "1.0",
        "USDT-USD": "0.999615"
      },
      "expires_at": "2024-02-23T06:42:37Z",
      "fee_rate": 0.01,
      "hosted_url": "https://commerce.coinbase.com/charges/RANDOMCODE",
      "id": "random-uuid",
      "local_exchange_rates": {
        "APE-USD": "1.6645",
        "BCH-USD": "261.355",
        "BTC-USD": "51129.775",
        "DAI-USD": "0.99985",
        "DOGE-USD": "0.08401",
        "ETH-USD": "2955.4",
        "LTC-USD": "68.46",
        "PMATIC-USD": "0.9839",
        "PUSDC-USD": "1.0",
        "PWETH-USD": "2954.685",
        "SHIB-USD": "0.00000952",
        "USDC-USD": "1.0",
        "USDT-USD": "0.999615"
      },
      "logo_url": "",
      "metadata": {
        "email": "first.last@gmail.com",
        "name": null,
        "sessionId": "random-uuid",
        "userId": "random-user-uuid"
      },
      "offchain_eligible": true,
      "organization_name": "",
      "payments": [
        {
          "block": {
            "confirmations": 136,
            "confirmations_required": 128,
            "hash": "0x0ce73c5d4cdea5498504fea0915b3a9da44364274f911c84748f6aec732f3d09",
            "height": 53851495
          },
          "deposited": {
            "amount": {
              "coinbase_fee": {
                "crypto": {
                  "amount": "0.000000000",
                  "currency": "PMATIC"
                },
                "local": null
              },
              "gross": {
                "crypto": {
                  "amount": "0.721948243",
                  "currency": "PMATIC"
                },
                "local": null
              },
              "net": {
                "crypto": {
                  "amount": "0.721948243",
                  "currency": "PMATIC"
                },
                "local": null
              }
            },
            "autoconversion_enabled": true,
            "autoconversion_status": "PENDING",
            "destination": "info@standwithcrypto.org",
            "exchange_rate": null,
            "status": "PENDING"
          },
          "detected_at": "2024-02-23T05:44:13Z",
          "network": "polygon",
          "payer_addresses": null,
          "payment_id": "bf885807-f153-412f-b98a-12f65210b606",
          "status": "CONFIRMED",
          "transaction_id": "0x7e4cf90b6c9b60d506f945a11d35fcc1645bc43cb21a0157316b956135f9e879",
          "value": {
            "crypto": {
              "amount": "0.721948243",
              "currency": "PMATIC"
            },
            "local": {
              "amount": "0.71",
              "currency": "USD"
            }
          }
        }
      ],
      "pricing_type": "no_price",
      "pwcb_only": false,
      "redirect_url": "",
      "resource": "charge",
      "support_email": "info@standwithcrypto.org",
      "timeline": [
        {
          "context": "OTHER",
          "status": "NEW",
          "time": "2024-02-23T05:42:37Z"
        },
        {
          "context": "OTHER",
          "status": "PENDING",
          "time": "2024-02-23T05:44:19Z"
        },
        {
          "context": "OTHER",
          "status": "COMPLETED",
          "time": "2024-02-23T05:48:54Z"
        }
      ]
    },
    "id": "f3224f69-77e7-4979-abce-f672bc28dbc7",
    "resource": "event",
    "type": "charge:confirmed"
  },
  "id": "5e02f688-f95d-48ff-b27e-d73146655fcd",
  "scheduled_for": "2024-02-23T05:53:03Z"
}`

const v2Response = `
{
  "attempt_number": 1,
  "event": {
      "api_version": "2018-03-22",
      "created_at": "2024-02-02T23:35:36Z",
      "data": {
          "id": "5c953eda-a5ad-41de-9149-cb8a2c6a2ce0",
          "code": "AJ4YMQN6",
          "name": "TESTING - Support SwC",
          "pricing": {
              "local": {
                  "amount": "1",
                  "currency": "USD"
              },
              "settlement": {
                  "amount": "1",
                  "currency": "USDC"
              }
          },
          "checkout": {
              "id": "582a836d-733c-4a66-84d9-4e3c40c90281"
          },
          "metadata": {
              "name": null,
              "email": "first.last@gmail.com"
          },
          "payments": [
              {
                  "value": {
                      "local": {
                          "amount": "1",
                          "currency": "USD"
                      },
                      "crypto": {
                          "amount": "1",
                          "currency": "USDC"
                      }
                  },
                  "status": "confirmed",
                  "network": "polygon",
                  "payment_id": "0xa354ec3562872e895ffa9d33231a290d0180eb88ae9a9325ddc9e8eafe62ecb7",
                  "detected_at": "2024-02-02T23:30:53Z",
                  "transaction_id": "0xa354ec3562872e895ffa9d33231a290d0180eb88ae9a9325ddc9e8eafe62ecb7",
                  "payer_addresses": [
                      "0xe00a7135e073a0606aa6b5eb895e996ada364ddd"
                  ]
              }
          ],
          "timeline": [
              {
                  "time": "2024-02-02T20:01:55Z",
                  "status": "NEW"
              },
              {
                  "time": "2024-02-02T20:03:20Z",
                  "status": "SIGNED"
              },
              {
                  "time": "2024-02-02T23:31:01Z",
                  "status": "PENDING"
              },
              {
                  "time": "2024-02-02T23:35:36Z",
                  "status": "COMPLETED"
              }
          ],
          "redirects": {
              "cancel_url": "",
              "success_url": "",
              "will_redirect_after_success": false
          },
          "web3_data": {
              "failure_events": [],
              "success_events": [
                  {
                      "sender": "0xe00a7135e073a0606aa6b5eb895e996ada364ddd",
                      "tx_hsh": "0xa354ec3562872e895ffa9d33231a290d0180eb88ae9a9325ddc9e8eafe62ecb7",
                      "chain_id": 137,
                      "finalized": false,
                      "recipient": "0x1d9abdc17763b225a2f7a41c0c9edf25790f8eb0",
                      "timestamp": "2024-02-02T23:30:53Z",
                      "network_fee_paid": "10660120574492642",
                      "input_token_amount": "1000000",
                      "input_token_address": "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
                      "network_fee_paid_local": "0.008493984073755737"
                  },
                  {
                      "sender": "0xe00a7135e073a0606aa6b5eb895e996ada364ddd",
                      "tx_hsh": "0xa354ec3562872e895ffa9d33231a290d0180eb88ae9a9325ddc9e8eafe62ecb7",
                      "chain_id": 137,
                      "finalized": true,
                      "recipient": "0x1d9abdc17763b225a2f7a41c0c9edf25790f8eb0",
                      "timestamp": "2024-02-02T23:30:53Z",
                      "network_fee_paid": "10660120574492642",
                      "input_token_amount": "1000000",
                      "input_token_address": "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
                      "network_fee_paid_local": "0.008493984073755737"
                  }
              ],
              "transfer_intent": {
                  "metadata": {
                      "sender": "0xe00A7135E073A0606aa6B5Eb895E996adA364DDD",
                      "chain_id": 137,
                      "contract_address": "0x7f52269092F2a5EF06C36C91e46F9196deb90336"
                  },
                  "call_data": {
                      "id": "0x24c478eb24ce4124b367b1bb465dd2f2",
                      "prefix": "0x4b3220496e666f726d6174696f6e616c204d6573736167653a20333220",
                      "deadline": "2024-02-04T20:01:55Z",
                      "operator": "0x8fccc78dae0a8f93b0fe6799de888d4c57e273db",
                      "recipient": "0x1d9AbDC17763b225a2F7A41c0C9Edf25790f8eb0",
                      "signature": "0x26b0427e4d04b8e134e28de0f98e2048eee5e3fa29336fddcca576c698ede6ce01f58da8e7bdeaf736f5665e00e1fc0422a264b069fe8b553667d38d6fe3e8fb1c",
                      "fee_amount": "10000",
                      "recipient_amount": "990000",
                      "recipient_currency": "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
                      "refund_destination": "0xe00A7135E073A0606aa6B5Eb895E996adA364DDD"
                  }
              },
              "contract_addresses": {
                  "1": "0x7915f087685fffD71608E5d118f3B70c27D9eF4e",
                  "137": "0x7f52269092F2a5EF06C36C91e46F9196deb90336",
                  "8453": "0x9Bb4D44e6963260A1850926E8f6bEB8d5803836F"
              },
              "settlement_currency_addresses": {
                  "1": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                  "137": "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
                  "8453": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
              }
          },
          "created_at": "2024-02-02T20:01:55Z",
          "expires_at": "2024-02-04T20:01:55Z",
          "hosted_url": "https://commerce.coinbase.com/pay/random-uuid",
          "brand_color": "#122332",
          "charge_kind": "WEB3",
          "confirmed_at": "2024-02-02T23:35:36Z",
          "pricing_type": "no_price",
          "support_email": "first.last+dev@gmail.com",
          "brand_logo_url": "",
          "collected_email": true,
          "organization_name": "Budiman Testing",
          "web3_retail_payment_metadata": {
              "fees": [
                  {
                      "title": "network",
                      "amount": {
                          "amount": "0.0091725483",
                          "currency": "USDC"
                      },
                      "fee_type": "MINER_FEE_REVENUE",
                      "description": "Miner Fee Revenue"
                  },
                  {
                      "title": "coinbase",
                      "amount": {
                          "amount": "0",
                          "currency": "USDC"
                      },
                      "fee_type": "COINBASE",
                      "description": "Coinbase Fee"
                  },
                  {
                      "title": "spread",
                      "amount": {
                          "amount": "0.0050250014",
                          "currency": "USDC"
                      },
                      "fee_type": "SPREAD",
                      "description": "Spread fee"
                  }
              ],
              "quote_id": "29a70631-b739-4498-8618-f0064fc2ae51",
              "source_amount": {
                  "amount": "1.25703565",
                  "currency": "MATIC"
              },
              "exchange_rate_with_spread": {
                  "amount": "0.7994",
                  "currency": "USDC"
              },
              "exchange_rate_without_spread": {
                  "amount": "0E-6176",
                  "currency": ""
              }
          },
          "web3_retail_payments_enabled": true
      },
      "id": "1bb7ce7b-3b16-4f56-b838-d8aa3820e9c3",
      "resource": "event",
      "type": "charge:confirmed"
  },
  "id": "f852430c-b7ef-41e3-a702-b30d7765e9ac",
  "scheduled_for": "2024-02-02T23:35:36Z"
}`

it('JSON object from V1 Coinbase Commerce webhook matches expected format', () => {
  const v1ResponseJson = JSON.parse(v1Response) as CoinbaseCommercePayment

  try {
    zodCoinbaseCommercePayment.parse(v1ResponseJson)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Validation errors: ' + JSON.stringify(error.errors, null, 2))
    } else {
      throw new Error('Unexpected error: ' + error)
    }
  }
})

it('JSON object from V2 Coinbase Commerce webhook matches expected format', () => {
  const v2ResponseJson = JSON.parse(v2Response) as CoinbaseCommercePayment

  try {
    zodCoinbaseCommercePayment.parse(v2ResponseJson)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Validation errors: ' + JSON.stringify(error.errors, null, 2))
    } else {
      throw new Error('Unexpected error: ' + error)
    }
  }
})
