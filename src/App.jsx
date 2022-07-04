import { useAddress, useMetamask, useEditionDrop, useToken, useVote, useNetwork } from '@thirdweb-dev/react';
import { useState, useEffect, useMemo } from 'react';
import { AddressZero } from "@ethersproject/constants";
import { ChainId } from '@thirdweb-dev/sdk';

const App = () => {
  // Use the hooks thirdweb give us.
  const address = useAddress();
  const network = useNetwork();
  const connectWithMetamask = useMetamask();
  console.log("👋 Address:", address);

  const editionDrop = useEditionDrop("0xb59a93C3285151FbDF6F59132b3193Fef4cbC536")
  const token = useToken("0xB1F66720243d403B08eC8dF063936B83ABd5f45B")

  const vote = useVote("0x2142A714D1b33609778D93e870EF2cA346adfBb4")

  const [hasClaimedNFT, setHasClaimedNFT] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)

  const [memberTokenAmounts, setMemberTokenAmounts] = useState([])
  const [memberAddress, setMemberAddress] = useState([])

  const [proposals, setProposals] = useState([])
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)

  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4)
  }

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    const getAllProposals = async () => {
      try {
        const proposals = await vote.getAll()
        setProposals(proposals)
      } catch (error) {
        console.log("failed to get proposals", error)
      }
    }
    getAllProposals()
  }, [hasClaimedNFT, vote])

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    if (!proposals.length) {
      return;
    }

    const checkIfUserHasVoted = async () => {
      try {
        const hasVoted = await vote.hasVoted(proposals[0].proposalId, address);
        setHasVoted(hasVoted)
        if (hasVoted) {
          console.log("🥵 User has already voted");
        } else {
          console.log("🙂 User has not voted yet");
        }
      } catch (error) {
        console.error("failed to check if wallet has voted", error)
      }
    }
    checkIfUserHasVoted()
  }, [hasClaimedNFT, proposals, address, vote])

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    const getAllAddresses = async () => {
      try {
        const memberAddress = await editionDrop.history.getAllClaimerAddresses(0)
        setMemberAddress(memberAddress)
        console.log("🚀 Members addresses", memberAddress)
      } catch (error) {
        console.error("failed to get memeber list", error)
      }
    }

    getAllAddresses()
  }, [hasClaimedNFT, editionDrop.history])

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    const getAllBalances = async () => {
      try {
        const amounts = await token.history.getAllHolderBalances()
        setMemberTokenAmounts(amounts)
        console.log("👜 Amounts", amounts)
      } catch (error) {
        console.error("failed to get member balances", error)
      }
    }

    getAllBalances()
  }, [hasClaimedNFT, token.history])

  const memberList = useMemo(() => {
    return memberAddress.map((address) => {
      const member = memberTokenAmounts?.find(({ holder }) => holder === address)

      return {
        address,
        tokenAmount: member?.balance.displayValue || '0',
      }
    })
  }, [memberAddress, memberTokenAmounts])

  useEffect(() => {
    if (!address) {
      return;
    }
    const checkBalance = async () => {
      try {
        const balance = await editionDrop.balanceOf(address, 0)
        if (balance.gt(0)) {
          setHasClaimedNFT(true)
          console.log("🌟 this user has a membership NFT!")
        } else {
          setHasClaimedNFT(false)
          console.log("😭 this user doesn't have a membership NFT.")
        }
      } catch (error) {
        setHasClaimedNFT(false)
        console.error("Failed to get balance", error)
      }
    }
    checkBalance()
  }, [address, editionDrop])

  const mintNft = async () => {
    try {
      setIsClaiming(true);
      await editionDrop.claim("0", 1)
      console.log(`🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${editionDrop.getAddress()}/0`)
      setHasClaimedNFT(true)
    } catch (error) {
      setHasClaimedNFT(false)
      console.error("Failed to mint NFT", error)
    } finally {
      setIsClaiming(false)
    }
  }

  // This is the case where the user hasn't connected their wallet
  // to your web app. Let them call connectWallet.
  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to NarutoDAO</h1>
        <button onClick={connectWithMetamask} className="btn-hero">
          Connect your wallet
        </button>
      </div>
    );
  }

  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>🍪DAO Member Page</h1>
        <p>Congratulations on being a member</p>
        <div>
          <div>
            <h2>Member List</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div>
            <h2>Active Proposals</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                setIsVoting(true);

                const votes = proposals.map((proposal) => {
                  const voteResult = {
                    proposalId: proposal.proposalId,
                    vote: 2,
                  };
                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(
                      proposal.proposalId + "-" + vote.type
                    );

                    if (elem.checked) {
                      voteResult.vote = vote.type;
                      return;
                    }
                  });
                  return voteResult;
                });

                try {
                  const delegation = await token.getDelegationOf(address);
                  if (delegation === AddressZero) {
                    await token.delegateTo(address);
                  }
                  try {
                    await Promise.all(
                      votes.map(async ({ proposalId, vote: _vote }) => {
                        const proposal = await vote.get(proposalId);
                        if (proposal.state === 1) {
                          return vote.vote(proposalId, _vote);
                        }
                        return;
                      })
                    );
                    try {
                      await Promise.all(
                        votes.map(async ({ proposalId }) => {
                          const proposal = await vote.get(proposalId);

                          if (proposal.state === 4) {
                            return vote.execute(proposalId);
                          }
                        })
                      );
                      setHasVoted(true);
                      console.log("successfully voted");
                    } catch (err) {
                      console.error("failed to execute votes", err);
                    }
                  } catch (err) {
                    console.error("failed to vote", err);
                  }
                } catch (err) {
                  console.error("failed to delegate tokens");
                } finally {
                  setIsVoting(false);
                }
              }}
            >
              {proposals.map((proposal) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map(({ type, label }) => (
                      <div key={type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + "-" + type}
                          name={proposal.proposalId}
                          value={type}
                          defaultChecked={type === 2}
                        />
                        <label htmlFor={proposal.proposalId + "-" + type}>
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting
                  ? "Voting..."
                  : hasVoted
                    ? "You Already Voted"
                    : "Submit Votes"}
              </button>
              {!hasVoted && (
                <small>
                  This will trigger multiple transactions that you will need to
                  sign.
                </small>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  };


  // This is the case where we have the user's address
  // which means they've connected their wallet to our site!
  return (
    <div className="mint-nft">
      <h1>Mint your free 🍪DAO Membership NFT</h1>
      <button
        disabled={isClaiming}
        onClick={mintNft}
      >
        {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
      </button>
    </div>
  );
}

export default App;