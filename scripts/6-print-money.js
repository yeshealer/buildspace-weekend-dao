import sdk from './1-initialize-sdk.js'

const token = sdk.getToken("0xB1F66720243d403B08eC8dF063936B83ABd5f45B");

(async () => {
    try {
        const amount = 99999999999;

        await token.mint(amount)
        const totalSupply = await token.totalSupply()

        console.log("✅ There now is", totalSupply.displayValue, "$KAGE is circulation");
    } catch (error) {
        console.log(error, "Failed to print money")
    }
})()