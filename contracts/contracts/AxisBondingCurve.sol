// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./AxisToken.sol";

/**
 * @title AxisBondingCurve
 * @notice Factory + market contract for the Axis launchpad.
 *
 *  Bonding Curve Formula (Linear):
 *    Price = K * Supply
 *    Cost to buy N tokens = K * integral from S to S+N of x dx
 *                         = K * ((S+N)^2 - S^2) / 2
 *
 *  Where:
 *    K = pricing constant (set per token at creation)
 *    S = current totalSupply of the token
 *    N = number of tokens being bought
 */
contract AxisBondingCurve {
    // ─── Storage ──────────────────────────────────────────────

    struct TokenInfo {
        address creator;
        uint256 k; // pricing constant (in wei per token^2)
        bool exists;
    }

    /// @notice token address => metadata
    mapping(address => TokenInfo) public tokens;

    /// @notice list of all deployed token addresses
    address[] public allTokens;

    // ─── Events ───────────────────────────────────────────────

    event TokenCreated(
        address indexed token,
        string name,
        string symbol,
        uint256 k,
        address indexed creator
    );

    event TokenBought(
        address indexed token,
        address indexed buyer,
        uint256 amount,
        uint256 cost
    );

    event TokenSold(
        address indexed token,
        address indexed seller,
        uint256 amount,
        uint256 refund
    );

    // ─── Errors ───────────────────────────────────────────────

    error TokenDoesNotExist();
    error InsufficientPayment();
    error InsufficientBalance();
    error ZeroAmount();
    error TransferFailed();
    error InvalidK();

    // ─── Factory ──────────────────────────────────────────────

    /**
     * @notice Deploy a new AxisToken with a linear bonding curve.
     * @param name   Token name
     * @param symbol Token ticker
     * @param k      Pricing constant (wei). Price = k * supply.
     *               A good starting value: 1e12 (0.000001 ETH per token at supply=1M)
     * @return token The address of the newly created token
     */
    function createToken(
        string calldata name,
        string calldata symbol,
        uint256 k
    ) external returns (address token) {
        if (k == 0) revert InvalidK();

        AxisToken newToken = new AxisToken(name, symbol, address(this));
        token = address(newToken);

        tokens[token] = TokenInfo({creator: msg.sender, k: k, exists: true});

        allTokens.push(token);

        emit TokenCreated(token, name, symbol, k, msg.sender);
    }

    // ─── Buy ──────────────────────────────────────────────────

    /**
     * @notice Buy `amount` tokens from the bonding curve.
     *         Sends native currency (ETH/BTC) as payment.
     *
     *  Cost = k * ((S + amount)^2 - S^2) / 2
     *       = k * amount * (2S + amount) / 2
     *
     * @param token  Address of the AxisToken to buy
     * @param amount Number of tokens (in token units, 18 decimals)
     */
    function buy(address token, uint256 amount) external payable {
        if (amount == 0) revert ZeroAmount();
        TokenInfo storage info = tokens[token];
        if (!info.exists) revert TokenDoesNotExist();

        uint256 supply = AxisToken(token).totalSupply();
        uint256 cost = _getCost(info.k, supply, amount);

        if (msg.value < cost) revert InsufficientPayment();

        // Mint tokens to buyer
        AxisToken(token).mint(msg.sender, amount);

        // Refund overpayment
        uint256 refund = msg.value - cost;
        if (refund > 0) {
            (bool ok, ) = msg.sender.call{value: refund}("");
            if (!ok) revert TransferFailed();
        }

        emit TokenBought(token, msg.sender, amount, cost);
    }

    // ─── Sell ─────────────────────────────────────────────────

    /**
     * @notice Sell `amount` tokens back to the bonding curve.
     *         Receives native currency refund.
     *
     *  Refund = k * (S^2 - (S - amount)^2) / 2
     *         = k * amount * (2S - amount) / 2
     *
     * @param token  Address of the AxisToken to sell
     * @param amount Number of tokens to sell (18 decimals)
     */
    function sell(address token, uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        TokenInfo storage info = tokens[token];
        if (!info.exists) revert TokenDoesNotExist();

        uint256 supply = AxisToken(token).totalSupply();
        if (amount > supply) revert InsufficientBalance();

        uint256 refund = _getRefund(info.k, supply, amount);

        // Burn tokens from seller
        AxisToken(token).burn(msg.sender, amount);

        // Send refund
        (bool ok, ) = msg.sender.call{value: refund}("");
        if (!ok) revert TransferFailed();

        emit TokenSold(token, msg.sender, amount, refund);
    }

    // ─── View Functions ───────────────────────────────────────

    /**
     * @notice Get the cost to buy `amount` tokens at current supply.
     */
    function getBuyCost(
        address token,
        uint256 amount
    ) external view returns (uint256) {
        TokenInfo storage info = tokens[token];
        if (!info.exists) revert TokenDoesNotExist();
        uint256 supply = AxisToken(token).totalSupply();
        return _getCost(info.k, supply, amount);
    }

    /**
     * @notice Get the refund for selling `amount` tokens at current supply.
     */
    function getSellRefund(
        address token,
        uint256 amount
    ) external view returns (uint256) {
        TokenInfo storage info = tokens[token];
        if (!info.exists) revert TokenDoesNotExist();
        uint256 supply = AxisToken(token).totalSupply();
        return _getRefund(info.k, supply, amount);
    }

    /**
     * @notice Get current spot price: k * supply
     */
    function getPrice(address token) external view returns (uint256) {
        TokenInfo storage info = tokens[token];
        if (!info.exists) revert TokenDoesNotExist();
        uint256 supply = AxisToken(token).totalSupply();
        return (info.k * supply) / 1e18;
    }

    /**
     * @notice Total number of tokens launched
     */
    function totalTokens() external view returns (uint256) {
        return allTokens.length;
    }

    // ─── Internal Math ────────────────────────────────────────

    /**
     * @dev Cost = k * amount * (2 * supply + amount) / (2 * 1e18)
     *      Division by 1e18 normalizes for 18-decimal token amounts.
     */
    function _getCost(
        uint256 k,
        uint256 supply,
        uint256 amount
    ) internal pure returns (uint256) {
        return (k * amount * (2 * supply + amount)) / (2 * 1e18);
    }

    /**
     * @dev Refund = k * amount * (2 * supply - amount) / (2 * 1e18)
     */
    function _getRefund(
        uint256 k,
        uint256 supply,
        uint256 amount
    ) internal pure returns (uint256) {
        return (k * amount * (2 * supply - amount)) / (2 * 1e18);
    }

    /// @notice Allow contract to receive native currency
    receive() external payable {}
}
