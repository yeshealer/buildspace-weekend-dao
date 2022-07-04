import sdk from './1-initialize-sdk.js'
import { ethers } from 'ethers'

const vote = sdk.getVote("0x2142A714D1b33609778D93e870EF2cA346adfBb4")
const token = sdk.getToken("0xB1F66720243d403B08eC8dF063936B83ABd5f45B");

(async () => {
    try {
        const amount = 420_000;
        const description = "Should the DAO mint an additional " + amount + " token into the treasury?"
        const executions = [
            {
                toAddress: token.getAddress(),
                nativeTokenValue: 0,
                transactionData: token.encoder.encode(
                    "mintTo", [
                    vote.getAddress(),
                    ethers.utils.parseUnits(amount.toString(), 18)
                ]
                )
            }
        ]

        await vote.propose(description, executions)

        console.log("✅ Successfully created proposal to mint tokens")
    } catch (error) {
        console.error("failed to create first proposal", error)
        process.exit(1)
    }

    try {
        const amount = 6_900;
        const description = "Should the DAO transfer " + amount + "tokens from the treasury to " + process.env.WALLET_ADDRESS + "for being awesome?"
        const executions = [
            {
                nativeTokenValue: 0,
                transactionData: token.encoder.encode(
                    "transfer",
                    [
                        process.env.WALLET_ADDRESS,
                        ethers.utils.parseUnits(amount.toString(), 18)
                    ]
                ),
                toAddress: token.getAddress()
            }
        ]

        await vote.propose(description, executions)

        console.log("✅ Successfully created proposal to reward ourselves from the treasury, let's hope people vote for it!")
    } catch (error) {
        console.error("failed to create second proposal", error)
    }
})()