import sdk from './1-initialize-sdk.js'

const editionDrop = sdk.getEditionDrop("0xb59a93C3285151FbDF6F59132b3193Fef4cbC536")

const token = sdk.getToken("0xB1F66720243d403B08eC8dF063936B83ABd5f45B");

(async () => {
    try {
        const walletAddress = await editionDrop.history.getAllClaimerAddresses(0);

        if (walletAddress.length === 0) {
            console.log("No NFTs have been claimed yet, maybe get some friends to claim your free NFTs!",);
            process.exit(0)
        }

        const airdropTargets = walletAddress.map((address) => {
            const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000)
            console.log("✅ Going to airdrop", randomAmount, "tokens to", address)

            const airdropTargets = {
                toAddress: address,
                amount: randomAmount
            }

            return airdropTargets
        })

        console.log("🌈 Starting airdrop...")
        await token.transferBatch(airdropTargets)
        console.log("✅ Successfully airdropped tokens to all the holders of the NFT!")
    } catch (err) {
        console.error("Failed to airdrop tokens", err)
    }
})()