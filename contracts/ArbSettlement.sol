// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ArbSettlement
 * @notice Contrato de settlement omnichaín para profits de arbitraje detectados por OmniArbYa
 * @dev ElCryptoBoy - Combina LayerZero messaging + profit distribution
 *      En producción integrar LayerZero Endpoint para cross-chain claims
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ArbSettlement is Ownable, ReentrancyGuard {
    struct Opportunity {
        bytes32 id;
        string pair;
        address executor;
        uint256 profitAmount;
        uint256 timestamp;
        bool settled;
    }

    mapping(bytes32 => Opportunity) public opportunities;
    mapping(address => uint256) public pendingProfits;

    event OpportunityRegistered(bytes32 indexed id, string pair, address executor, uint256 profit);
    event ProfitClaimed(address indexed user, uint256 amount);
    event OmnichainMessageSent(bytes32 indexed id, uint32 dstChainId);

    constructor() Ownable(msg.sender) {}

    /// @notice Registra una oportunidad ejecutada (llamado por el bot o relayer)
    function registerOpportunity(
        bytes32 id,
        string calldata pair,
        address executor,
        uint256 profitAmount
    ) external onlyOwner {
        require(opportunities[id].timestamp == 0, "Already registered");
        opportunities[id] = Opportunity({
            id: id,
            pair: pair,
            executor: executor,
            profitAmount: profitAmount,
            timestamp: block.timestamp,
            settled: false
        });
        pendingProfits[executor] += profitAmount;
        emit OpportunityRegistered(id, pair, executor, profitAmount);
    }

    /// @notice Claim de profits en esta chain (o después de bridge)
    function claimProfit() external nonReentrant {
        uint256 amount = pendingProfits[msg.sender];
        require(amount > 0, "No profits");
        pendingProfits[msg.sender] = 0;
        // En prod: transferir USDC o el token correspondiente
        // IERC20(USDC).transfer(msg.sender, amount);
        emit ProfitClaimed(msg.sender, amount);
    }

    /// @notice Placeholder para enviar mensaje omnichaín (LayerZero / CCIP)
    function sendOmnichainSettlement(
        bytes32 id,
        uint32 dstChainId,
        bytes calldata payload
    ) external onlyOwner {
        // Integrar con LayerZero Endpoint.send()
        emit OmnichainMessageSent(id, dstChainId);
        // TODO: lzEndpoint.send{value: fee}(...)
    }

    function getPending(address user) external view returns (uint256) {
        return pendingProfits[user];
    }
}
