// SPDX-License-Identifier: MIT
pragma solidity 0.8.23; // V4.4

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title LabRegistry V4.4 - Institutional Redundancy
 * @author Crimson Ox
 * @dev Implements RBAC for dual-layer security (Factory Admin & Lab Director)
 */
contract LabRegistry is AccessControl, Pausable {
    // Role Definitions
    bytes32 public constant FACTORY_ADMIN_ROLE = keccak256("FACTORY_ADMIN_ROLE");
    bytes32 public constant LAB_DIRECTOR_ROLE = keccak256("LAB_DIRECTOR_ROLE");

    uint256 public anchorFee = 1e8; // Default: 1 HBAR
    bool public automationEnabled; 
    mapping(address => bool) public authorizedAgents; 

    struct LabReport {
        string results;
        string technician;
        uint256 timestamp;
        address patientAddress;
    }

    mapping(uint256 => LabReport) private labReports;

    // Events for Mirror Node Indexing
    event ReportAnchored(uint256 indexed id, address indexed patient, string tech, uint256 time);
    event FeeUpdated(uint256 newFee);
    event AgentStatusChanged(address indexed agent, bool status);

    constructor(address _factoryAdmin, address _localDirector) {
        // Master Admin Setup (The Recovery Key)
        _grantRole(DEFAULT_ADMIN_ROLE, _factoryAdmin);
        _grantRole(FACTORY_ADMIN_ROLE, _factoryAdmin);
        
        // Operational Setup (The Local Key)
        _grantRole(LAB_DIRECTOR_ROLE, _localDirector);

        // Factory Admin is established as the manager of the Director role
        _setRoleAdmin(LAB_DIRECTOR_ROLE, FACTORY_ADMIN_ROLE);
    }

    // --- EMERGENCY OVERRIDES (Both Admin & Director) ---

    function pause() external {
        require(hasRole(FACTORY_ADMIN_ROLE, msg.sender) || hasRole(LAB_DIRECTOR_ROLE, msg.sender), "Unauthorized");
        _pause();
    }

    function unpause() external {
        require(hasRole(FACTORY_ADMIN_ROLE, msg.sender) || hasRole(LAB_DIRECTOR_ROLE, msg.sender), "Unauthorized");
        _unpause();
    }

    // --- ADMINISTRATIVE CONTROLS (Director Only) ---

    function setAnchorFee(uint256 _newFee) external {
        require(hasRole(LAB_DIRECTOR_ROLE, msg.sender), "Only Director can set fees");
        anchorFee = _newFee;
        emit FeeUpdated(_newFee);
    }

    function setAutomation(bool _status) external {
        require(hasRole(LAB_DIRECTOR_ROLE, msg.sender), "Only Director can toggle AI");
        automationEnabled = _status;
    }

    /**
     *  Explicitly authorizes an AI Agent to anchor reports
     */
    function setAgentStatus(address _agent, bool _status) external {
        require(hasRole(LAB_DIRECTOR_ROLE, msg.sender), "Only Director can manage agents");
        authorizedAgents[_agent] = _status;
        emit AgentStatusChanged(_agent, _status);
    }

    // --- CORE LOGIC (Hybrid Agentic Protocol) ---

    function addReport(uint256 _id, string memory _res, string memory _tech, address _pat) 
        public 
        payable 
        whenNotPaused 
    {
        bool isDirector = hasRole(LAB_DIRECTOR_ROLE, msg.sender);
        bool isAuthAgent = (automationEnabled && authorizedAgents[msg.sender]);
        
        if (!isDirector && !isAuthAgent) revert("Unauthorized Access");
        if (msg.value < anchorFee) revert("Insufficient HBAR Fee");

        labReports[_id] = LabReport(_res, _tech, block.timestamp, _pat);
        emit ReportAnchored(_id, _pat, _tech, block.timestamp);
    }

    function withdraw() external whenNotPaused {
        require(hasRole(LAB_DIRECTOR_ROLE, msg.sender), "Only Director can withdraw");
        payable(msg.sender).transfer(address(this).balance);
    }

    function getReport(uint256 _id) public view returns (LabReport memory) {
        LabReport memory r = labReports[_id];
        // Privacy Shield: Only Director and Patient can access
        if (!hasRole(LAB_DIRECTOR_ROLE, msg.sender) && msg.sender != r.patientAddress) revert("Access Denied");
        return r;
    }
}