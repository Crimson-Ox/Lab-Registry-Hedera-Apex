// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title LabRegistry V5.0 - Final Clean Slate Build
 * @author Crimson Ox
 * @notice Official Submission for Hedera Apex 2026.
 */
contract LabRegistry is AccessControl, Pausable {
    bytes32 public constant FACTORY_ADMIN_ROLE = keccak256("FACTORY_ADMIN_ROLE");
    bytes32 public constant LAB_DIRECTOR_ROLE = keccak256("LAB_DIRECTOR_ROLE");

    address public agentPermissionToken;
    uint256 public anchorFee = 1 ether; // Set to 1 HBAR (18-decimal parity)
    bool public automationEnabled; 
    
    mapping(address => bool) public authorizedAgents; 

    struct LabReport {
        string results;
        string technician;
        uint256 timestamp;
        address patientAddress;
    }

    mapping(uint256 => LabReport) private labReports;

    event ReportAnchored(uint256 indexed id, address indexed patient, string tech, uint256 time);
    event FeeUpdated(uint256 newFee);
    event AgentStatusChanged(address indexed agent, bool status);

    constructor(address _factoryAdmin, address _localDirector, address _tokenID) {
        _grantRole(DEFAULT_ADMIN_ROLE, _factoryAdmin);
        _grantRole(FACTORY_ADMIN_ROLE, _factoryAdmin);
        _grantRole(LAB_DIRECTOR_ROLE, _localDirector);

        // Factory Admin (Acc 1) manages the Director role (Acc 2)
        _setRoleAdmin(LAB_DIRECTOR_ROLE, FACTORY_ADMIN_ROLE);
        
        agentPermissionToken = _tokenID; 
    }

    // --- CORE LOGIC ---

    function addReport(uint256 _id, string memory _res, string memory _tech, address _pat) 
        public payable whenNotPaused 
    {
        require(labReports[_id].timestamp == 0, "ID already exists");

        bool isDirector = hasRole(LAB_DIRECTOR_ROLE, msg.sender);
        uint256 agentBalance = IERC20(agentPermissionToken).balanceOf(msg.sender);
        bool isAuthAgent = (automationEnabled && authorizedAgents[msg.sender] && agentBalance > 0);
        
        if (!isDirector && !isAuthAgent) revert("Unauthorized: Missing Role or HTS Token");
        if (msg.value < anchorFee) revert("Insufficient HBAR Fee"); 

        labReports[_id] = LabReport(_res, _tech, block.timestamp, _pat);
        emit ReportAnchored(_id, _pat, _tech, block.timestamp);
    }

    function getReport(uint256 _id) public view returns (LabReport memory) {
        LabReport memory r = labReports[_id];
        require(r.timestamp != 0, "Report not found");
        // Only Director or the specific Patient can view
        if (!hasRole(LAB_DIRECTOR_ROLE, msg.sender) && msg.sender != r.patientAddress) revert("Access Denied");
        return r;
    }

    // --- ADMIN CONTROLS ---

    function setAnchorFee(uint256 _newFee) external onlyRole(LAB_DIRECTOR_ROLE) {
        anchorFee = _newFee;
        emit FeeUpdated(_newFee);
    }

    function setAgentStatus(address _agent, bool _status) external onlyRole(LAB_DIRECTOR_ROLE) {
        authorizedAgents[_agent] = _status;
        emit AgentStatusChanged(_agent, _status);
    }

    function setAutomation(bool _status) external onlyRole(LAB_DIRECTOR_ROLE) {
        automationEnabled = _status;
    }

    function pause() external onlyRole(FACTORY_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(FACTORY_ADMIN_ROLE) { _unpause(); }

    function withdraw() external onlyRole(LAB_DIRECTOR_ROLE) {
        payable(msg.sender).transfer(address(this).balance);
    }

    receive() external payable {}
}
