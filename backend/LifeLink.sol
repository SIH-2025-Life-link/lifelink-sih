// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract LifeLink {
    // Events for off-chain indexing & verification
    event DonationRecorded(address indexed sender, string donorName, uint256 amount, string purpose, bytes32 txId, uint256 timestamp);
    event DispatchRecorded(address indexed sender, string item, uint256 qty, string fromLoc, string toLoc, bytes32 trackingId, uint256 timestamp);

    address public admin;
    mapping(bytes32 => bool) public exists; // quick on-chain existence check

    constructor() {
        admin = msg.sender;
    }

    // Record a donation on-chain
    function recordDonation(string calldata donorName, uint256 amount, string calldata purpose, bytes32 txId) external {
        require(!exists[txId], "tx exists");
        exists[txId] = true;
        emit DonationRecorded(msg.sender, donorName, amount, purpose, txId, block.timestamp);
    }

    // Record a dispatch on-chain
    function recordDispatch(string calldata item, uint256 qty, string calldata fromLoc, string calldata toLoc, bytes32 trackingId) external {
        require(!exists[trackingId], "tracking exists");
        exists[trackingId] = true;
        emit DispatchRecorded(msg.sender, item, qty, fromLoc, toLoc, trackingId, block.timestamp);
    }

    // Admin-only utility to check on-chain existence
    function isRecorded(bytes32 id) external view returns (bool) {
        return exists[id];
    }
}