import sdk from './1-initialize-sdk.js'

const token = sdk.getToken("0xB1F66720243d403B08eC8dF063936B83ABd5f45B");

(async () => {
    try {
        const allRoles = await token.roles.getAll()

        console.log("👀 Roles that exist right now:", allRoles)

        await token.roles.setAll({ admin: [], minter: [] })
        console.log("🎉 Roles after revoking ourselves", await token.roles.getAll())
        console.log("✅ Successfully revoked our superpowers from the ERC-20 contract")
    } catch (error) {
        console.error("Failed to revoke ourselves from the DAO trasury", error)
    }
})()