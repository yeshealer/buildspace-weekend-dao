import sdk from './1-initialize-sdk.js'
import { MaxUint256 } from '@ethersproject/constants'

const editionDrop = sdk.getEditionDrop("0xb59a93C3285151FbDF6F59132b3193Fef4cbC536");

(async () => {
    try {
        const claimConditions = [{
            startTime: new Date(),
            maxQuantity: 50_000,
            price: 0,
            quantityLimitPerTransaction: 1,
            waitInSeconds: MaxUint256,
        }]
        await editionDrop.claimConditions.set("0", claimConditions);
        console.log("✅ Sucessfully set claim condition!")
    } catch (error) {
        console.error("Failed to set claim condition", error)
    }
})();