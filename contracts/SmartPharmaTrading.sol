// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;
contract SmartPharmaTrading {
    address public owner;
    

    struct Parameters {
        uint complianceScore;
        uint timeline;
        uint quality;
        uint batchEfficiency;
        uint violationFactor;
    }
    struct PharmaBatch {
        string pharmaId;
        uint units;
        string pharmaName;
                
    }
    struct Batch{
        uint batchId;
        PharmaBatch[] pharmas;
        Parameters parameters;
    }
    struct Result{
        uint batchId;
        uint unitSum;
        bool thresholdCheck;
        uint incentive;
        uint penalty;
        uint netPayment;
        Parameters parameters;
        // uint manufacturerPayment;
        // uint distributerPayment;
        // uint transporterPayment;
        // uint pharmacistPayment;
    }
    struct Weights{
        uint8 a;
        uint8 b;
        uint8 c;
        uint8 d;
        uint8 e;
        uint8 f;
        uint8 g;
        uint8 h;

    }
    Batch public batch;
    Weights internal weights;
    uint price=10;
    bool public batchRegistered=false;
    bool public parametersRead=false;
    bool public dataReset=true;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    constructor() {
        owner = msg.sender; 
        weights=Weights({
            a:15,
            b:20,
            c:25,
            d:10,
            e:10,
            f:15,
            g:25,
            h:20
        });

    }
    function compareStrings(string memory a, string memory b) public pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

        

    function registerBatch(uint _batchId, PharmaBatch[] memory _pharmaBatches) public returns(bool success,string memory message){
        

        if(!dataReset){
            return (false,"Batch already Registered, Reset first");
        }

        success=true;
        uint unitSum=0;
        for(uint i=0;i<_pharmaBatches.length;i++){
            for(uint j=0;j<_pharmaBatches.length;j++){
                if(i!=j && compareStrings(_pharmaBatches[i].pharmaId,_pharmaBatches[j].pharmaId)){
                    return(false,"Duplicate Pharma Id Detected");
                }
            }
            if(_pharmaBatches[i].units>0){
                unitSum+=_pharmaBatches[i].units;
            }else{
                return (false,"Recreate batch with required units between 1 to 1000. ");
            }
            
        }

        if(unitSum>1000 || unitSum<1){
            return (false,"Recreate batch with unitSum between 1 to 1000.");
        }
        
        if(success){
            batch=Batch({
                batchId: _batchId,
                pharmas: _pharmaBatches,
                parameters:Parameters({
                    complianceScore:0,
                    timeline:0,
                    quality:0,
                    batchEfficiency:0,
                    violationFactor:0
                })
            });
            batchRegistered=true;
            dataReset=false;
            return (true,"Batch Register Successfully.");
        }else{
            return (false,"Error in Batch Register.");
            
        }
    }
    function incentivePenalitySettlement() public view onlyOwner returns(bool success,Result memory res){
        if(!batchRegistered){
            return(false,res);
        }
         
        //batch-> batchId, pharmas , parameter
        PharmaBatch[] memory _pharmas=batch.pharmas; 
        uint unitSum=0;
        for(uint i=0;i<_pharmas.length;i++){
            unitSum+=_pharmas[i].units;
        }
        Parameters memory parameter=batch.parameters;
        if(parameter.complianceScore<50 || parameter.quality<60 ){
            //payemnt failed
            res=Result({
                batchId:batch.batchId,
                unitSum: unitSum,
                thresholdCheck:false,
                incentive:0,
                penalty:0,
                netPayment:0,
                parameters:batch.parameters
                // manufacturerPayment:0,
                // distributerPayment:0,
                // transporterPayment:0,
                // pharmacistPayment:0
            });
            
        }else{
            //all calulation is done with multiple of hundred
            // Incentive= a*ComplianceFactor + b*TimelineScore + c*Quality + d.batchEfficiency
            // Penalty = e*(100-ComplainceFactor) + f*(100 - timeline) + g*(100 - quality) + h*violationFactor
            // factor= 10000+(incentive-penality)
            //netPayment=pharmaunits*price*factor ->considered rs 10 per unit
            uint incentive= weights.a*parameter.complianceScore + weights.b*parameter.timeline+weights.c*parameter.quality+weights.d*parameter.batchEfficiency;
            uint penalty= weights.e*(100-parameter.complianceScore) + weights.f*(100-parameter.timeline)+weights.g*(100-parameter.quality) + weights.h*parameter.violationFactor;
            uint factor= 10000 + incentive-penalty;
            
            uint netPayment= unitSum*price*factor;
            res=Result({
                batchId: batch.batchId,
                unitSum: unitSum,
                thresholdCheck: true,
                incentive:incentive,
                penalty:penalty,
                netPayment:netPayment, //result is 10000of actual
                parameters:parameter
            });
            

        }
        return (true,res);
    }

    function readThreshold(Parameters memory _parameters) public onlyOwner returns(bool success,string memory message){
        if(!batchRegistered){
            return(false,"Plese register batch first");
        }
        if(parametersRead){
            return (false,"Parameters already read,Calculate incentive/Penalty");
        }
            
            batch.parameters=_parameters;
            parametersRead=true;
            return (true, "Threshold value saved successfully.");

    }

    function reset() public onlyOwner returns (bool success,string memory message) {

            delete batch;
            dataReset=true;
            batchRegistered=false;
            parametersRead=false;
            return(true,"reset successfully.");
            

    }
    
}