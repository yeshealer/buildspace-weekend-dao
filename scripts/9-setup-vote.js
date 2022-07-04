import sdk from './1-initialize-sdk.js'

const vote = sdk.getVote("0x2142A714D1b33609778D93e870EF2cA346adfBb4");
const token = sdk.getToken("0xB1F66720243d403B08eC8dF063936B83ABd5f45B");

(async () => {
    try {
        await token.roles.grant("minter", vote.getAddress());
        console.log("Successfully gave vote contract permissions to act on token contract");
    } catch (error) {
        console.error("failed to grant vote contract permissions on token contract", error)
        process.exit(1)
    }

    try {
        const ownedTokenBalance = await token.balanceOf(process.env.WALLET_ADDRESS)

        const ownedAmount = ownedTokenBalance.displayValue;
        const percent90 = Number(ownedAmount) / 100 * 50;

        await token.transfer(vote.getAddress(), percent90)

        console.log("✅ Successfully transferred " + percent90 + " tokens to vote contract")
    } catch (error) {
        console.error("failed to transfer tokens to vote contract", error)
    }
})()