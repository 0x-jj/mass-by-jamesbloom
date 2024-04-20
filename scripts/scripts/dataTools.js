const providerURL = "https://eth-mainnet.g.alchemy.com/v2/WCVfs4Oi5mlTLOPJzlZXtEL-1Pk37edh";
const contractAddress = "0xCcBE56eA12B845A281431290F202196864F2f576";
const jsonRpcCallDataContract = "0x5681e00b";

// Receipts
async function callProvider(payload) {
    // Helper func to make calls to the RPC provider
    callPayload = {
        method: "POST",
        body: JSON.stringify(payload)
    }
    let response = await fetch(providerURL, callPayload);
    let responsePayload = await response.json();
    return responsePayload;
}
async function getLastBlockReceipts() {
    // Get last block number
    let lastBlockNumber = await callProvider(
        {
            method:"eth_blockNumber",
            params:[],
            id:2,
            jsonrpc:"2.0"
        }
    );
    console.log("Last block number:", lastBlockNumber.result);

    // Use last block number to get last block receipt
    let blockReceipts = await callProvider(
        {
            "method": "eth_getBlockReceipts",
            "params": [lastBlockNumber.result],
            "id": 2,
            "jsonrpc": "2.0"
        }
    );
    for (let receipt of blockReceipts.result) {
        if (WALLETS.indexOf(receipt.from) > -1 || WALLETS.indexOf(receipt.to) > -1) {
            const receiptString = JSON.stringify(receipt, null, 2);
            console.log(receiptString);
        }
    }
}
async function receiptsWrapper() {
    try {
        await getLastBlockReceipts();
    }
    catch (e) {
        console.error(e);
    }
}

// Contract
async function getContractData() {
    // contract data for GOLD
    // approvalCount, uint256,
    // latestApprovalTimestamps, uint256[HISTORY_LENGTH] memory,
    // transferCount, uint256,
    // latestTransferTimestamps, uint256[HISTORY_LENGTH] memory,
    // getHolderCount(), uint256,
    // ethReceipts, RoyaltyReceipt[HISTORY_LENGTH] memory,
    // wethReceipts RoyaltyReceipt[HISTORY_LENGTH] memory
    // mintedSupply, uint256,
    //  uint256, uint256[200], uint256, uint256[200], uint256, tuple[200], tuple[200], uint256

    // token
    // tokenData[tokenId].transferCount,    uint256,
    // tokenData[tokenId].latestTransferTimestamps,    uint256[HISTORY_LENGTH] memory,
    // tokenData[tokenId].minttoken_dataTimestamp,    uint256,
    // tokenData[tokenId].seed,             bytes32,
    // balanceOf(ownerOf(tokenId))          uint256
    // numberOfHodlLayers uint256 NOTE: that one is not yet added to the solidity
    //  uint256, uint256[200], uint256, bytes32, uint256, uint256

    // contract data
    try {
        var contract_data_response = await fetch(
            providerURL,
            {
                method: "POST",
                body: JSON.stringify(
                    {
                        "method": "eth_call",
                        "params": [
                            {
                                "to": contractAddress,
                                "data": jsonRpcCallDataContract
                            },
                            "latest"
                        ],
                        "id": 2,
                        "jsonrpc": "2.0"
                    },
                )
            }
        );
    } catch {
        console.log("Node failed.");
        return;
    }
    let contract_data_json = await contract_data_response.json();
    let contract_data = hexToArray(contract_data_json.result);
    contract_data = splitArray(contract_data, [1, 200, 1, 200, 1, 400, 400, 1]);
    console.log("contract_data:", contract_data);
    return contract_data;
}
function hexToArray(hex) {
    const bytes = hex.slice(2); // remove the "0x" prefix
    const array = [];

    for (let i = 0; i < bytes.length; i += 64) {
        const hexNumber = bytes.slice(i, i + 64);
        const number = parseInt(hexNumber, 16);
        array.push(number);
    }

    return array;
}
function splitArray(A, B) {
    const result = [];
    let startIndex = 0;

    for (let i = 0; i < B.length; i++) {
        const partSize = B[i];
        const part = A.slice(startIndex, startIndex + partSize);
        result.push(part);
        startIndex += partSize;
    }

    // Handle the remaining elements if A has more elements than specified in B
    if (startIndex < A.length) {
        const remainingPart = A.slice(startIndex);
        result.push(remainingPart);
    }

    return result;
}