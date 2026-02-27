 // SPDX-License-Identifier: MIT 
pragma solidity 0.8.18; // cats are cool 
   
contract LabRegistry {
    
    // A CONTRACT FOR RECORDING AND RETRIEVING LAB REPORTS[DATA]

    struct labReports { 
        string results;
        string technician;
        uint256 timestamp;
    }

    mapping(uint256 => labReports) public labReport;
         
    // RECORDING DATA
   
    function addfunction (uint256 _id, string memory _results, string memory _technician) public {
        labReport[_id] = labReports(_results, _technician, block.timestamp);
    }

    // RETRIEVING FUNCTION (Fixed the spacing error here)
    function getreports(uint256 _id) public view returns (labReports memory) {
        return labReport[_id];
    }
}