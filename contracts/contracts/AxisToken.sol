// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title AxisToken
 * @notice ERC-20 token created by the AxisBondingCurve factory.
 *         Minting and burning are restricted to the factory contract only.
 */
contract AxisToken is ERC20 {
    /// @notice The factory/bonding curve contract that controls mint/burn
    address public immutable factory;

    error OnlyFactory();

    modifier onlyFactory() {
        if (msg.sender != factory) revert OnlyFactory();
        _;
    }

    /**
     * @param _name   Token name (e.g. "Orbital")
     * @param _symbol Token ticker (e.g. "ORB")
     * @param _factory Address of the AxisBondingCurve contract
     */
    constructor(
        string memory _name,
        string memory _symbol,
        address _factory
    ) ERC20(_name, _symbol) {
        factory = _factory;
    }

    /// @notice Mint tokens — callable ONLY by the factory
    function mint(address to, uint256 amount) external onlyFactory {
        _mint(to, amount);
    }

    /// @notice Burn tokens — callable ONLY by the factory
    function burn(address from, uint256 amount) external onlyFactory {
        _burn(from, amount);
    }
}
