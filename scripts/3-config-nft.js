import sdk from './1-initialize-sdk.js'
import { readFileSync } from "fs"

const editionDrop = sdk.getEditionDrop("0xb59a93C3285151FbDF6F59132b3193Fef4cbC536");

(async () => {
    try {
        await editionDrop.createBatch([
            {
                name: "Leaf Village Headband",
                description: "This NFT will give you access to NarutoDAO!",
                image: readFileSync("scripts/assets/headband.png"),
            },
        ]);
        console.log("✅ Successfully created a new NFT in the drop!");
    } catch (error) {
        console.log("failed to create the new NFT", error)
    }
})();