// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;
import "@openzeppelin/contracts/access/Ownable.sol";

contract LabRegistry is Ownable {
    uint256 public constant ANCHOR_FEE = 1e8; // 1 HBAR
    struct LabReport { string results; string tech; uint256 time; address patient; }
    mapping(uint256 => LabReport) private labReports;
    event ReportAnchored(uint256 indexed id, address indexed patient, string tech, uint256 time);

    constructor(address _owner) Ownable(_owner) {}

    function addReport(uint256 _id, string memory _res, string memory _tech, address _pat) public payable onlyOwner {
        require(msg.value >= ANCHOR_FEE, "Pay 1 HBAR");
        labReports[_id] = LabReport(_res, _tech, block.timestamp, _pat);
        emit ReportAnchored(_id, _pat, _tech, block.timestamp);
    }
}