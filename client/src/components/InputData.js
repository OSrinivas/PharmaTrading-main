
import React, { useState, useTransition } from 'react'
import wallpaper from "./../assets/wallpaper.png";
const InputData = ({contract}) => {
  //=================Initial Variable Creation==============================
  const [showAlert,setShowAlert]= useState(false);
  const [alertData,setAlertData] = useState('');
  const [batchId,setBatchId] = useState('');
  
  const [haveResult,setHaveResult] = useState(false);
  const [success,setSuccess]= useState(true);
  const [results,setResults] = useState(
    [
      //sample output data
      // {
      //   batchId: 1,
      //   batchDetails: [{pharmaId:101,units:500,pharmaName:"alpha"},{pharmaId:102,units:505,pharmaName:"beta"}],
      //   thresholdCheck: true,
      //   incentive: 5000,
      //   penality: 0,
      //   netPayment: 5000,
      //   manufacturer: 30000,
      //   distributer: 1000,
      //   transporter: 500,
      //   pharmacist: 500
      // }
    ]);

const [complianceScore,setComplianceScore]= useState('');
const [timelinesScore,setTimelinesScore]= useState('');
const [quality,setQuality]= useState('');
const [batchEfficiency,setBatchEfficiency]= useState('');
const [violationFactor,setViolationFactor]= useState('');
const [pharmaData, setPharmaData] = useState([
  { id: "", units: "", name: "" }
]);

//====================== DOM Handle===========================
const addPharmaRow = () => {
  if(pharmaData.length>2){
    setAlertData("Can't add more pharma.");
    setShowAlert(true);
  }else{
    setPharmaData([...pharmaData, { id: "", units: "", name: "" }]);

  }
};


const removePharmaRow = (index) => {
  if (pharmaData.length > 1) {
    const updated = pharmaData.filter((_, i) => i !== index);
    setPharmaData(updated);
  }
};



const handlePharmaDataChange = (index, field, value) => {
  setPharmaData((prev) =>
    prev.map((item, i) =>
       i === index ? { ...item, [field]: value } : item
    )
  );
};



  function handleBatchIdChange (e) {
    setBatchId(Number(e.target.value));
  }


  const handleComplianceScoreChange=(e)=>{
    setComplianceScore(e.target.value);
  }

  const handleTimelinesScoreChange=(e)=>{
    setTimelinesScore(e.target.value);
  }
  const handleQualityChange=(e)=>{
    setQuality(e.target.value);
  }
  const handleBatchEfficiencyChange=(e)=>{
    setBatchEfficiency(e.target.value);
  }
  const handleViolationFactor=(e)=>{
    setViolationFactor(e.target.value);
  }

  //========================= Contract Integration========================
  
  const handleReset= async ()=> {
    try {
      // console.log(contract);
      const[success,message]=await contract.callStatic.reset();
      // console.log("reset result :",success);
      // if(!success){
      //   // setAlertData(message);
      //   setSuccess(false);
      //   setShowAlert(true);
      //   return;
      // }
      const tx=await contract.reset();
      if(success){
        console.log("reset done");
        setBatchId('');
        setComplianceScore('');
        setTimelinesScore('');
        setQuality('');
        setBatchEfficiency('');
        setViolationFactor('');
        setHaveResult(false);
        setPharmaData([
          { id: "", units: "", name: "" }
        ]);
        setSuccess(true);
        setAlertData("All batches cleared.Please Create new Batch");
        setShowAlert(true);

      }else{
      //   setAlertData("Error in reseting Batch details");
      //   setSuccess(false);
      //   setShowAlert(true);
      }
      
    // setPharmaCount({ id: "", units: "", name: "" });
    //reset pharma data
    
    // console.log("Batches data reset successfully.")
    } catch (error) {
      console.log(error);
      // setAlertData(error);
      // setSuccess(false);
      // setShowAlert(true);
    }
    

    
  }
  const handleRegisterBatch= async ()=>{
    // console.log(batchId);
    // console.log(pharmaData);
    try {
      // console.log((batchId+"").length);
      if((batchId+"").length===0){
        setAlertData("Please fill BatchId");
        setSuccess(false);
        setShowAlert(true);
        return;
      }
      let flag=true;
      // console.log("len : ",pharmaData[0]);
      let db = pharmaData.map(row =>{
        // console.log("test : "+(row.id+"").length);
        // console.log((row.id+"").length===0);
        // console.log((row.units+"").length===0);
        // console.log((row.name+"").length===0);
        if(!flag){
          return;
        }
        if((row.id+"").length===0 || (row.units+"").length===0 || (row.name+"").length===0){
          // console.log("error");
          setAlertData("Incomplete pharmaData, Please filled pharma details");
          
          flag=false;
          return;
        }
        return ({
          pharmaId: String(row.id),        // Match Solidity struct
          units: Math.round(row.units),
          pharmaName: String(row.name)         // Match Solidity struct
        });
      } );
      if(!flag){
        setSuccess(false);
        setShowAlert(true);
        return;
      }
      
      console.log(db);
      
      
      
      
      // console.log("callstatic");
      
      const [success, message] = await contract.callStatic.registerBatch(
        batchId,
        db
      );
      
      
      
      if (success) {
        console.log("actual call");
        const tx = await contract.registerBatch(batchId, db);
        await tx.wait();
        setHaveResult(false);
        setAlertData("Batch registered successfully.");
        setSuccess(true);
        setShowAlert(true);
      } else {
        setAlertData("Batch registration failed: " + message);
        setSuccess(false);
        setShowAlert(true);
      }
      
    } catch (error) {
      console.log("error : "+error.Error);
      setAlertData("Error: " + error.message);
      setSuccess(false);
      setShowAlert(true);
    } 
  }

  const handleIotParameters= async()=>{
    if(!batchId){
      setAlertData("Please fill the batchID");
      setSuccess(false);
      setShowAlert(true);
      return;
    }
    if(!((complianceScore+"").length>0 || (timelinesScore+"").length>0 || (quality+"").length>0 || (batchEfficiency+"").length>0 || (violationFactor+"").length>0)){
      setAlertData("Please fill all the threshold parameters");
      setSuccess(false);
      setShowAlert(true);
      return;
    }
    const metrics = {
      complianceScore: Math.round(complianceScore * 100),
      timeline: Math.round(timelinesScore * 100),
      quality: Math.round(quality * 100),
      batchEfficiency: Math.round(batchEfficiency * 100),
      violationFactor: Math.round(violationFactor * 100)
    };
    const [success, message] = await contract.callStatic.readThreshold(
      metrics
    );

    if(success){
      const tx = await contract.readThreshold(metrics);
      await tx.wait();
      setAlertData(message);
      setSuccess(true);
      setShowAlert(true);

    }else{
      setAlertData(message);
      setSuccess(false);
      setShowAlert(true);

    }
  }

  function parseBigNumber(bn) {
    if (!bn || typeof bn !== "object" || !bn.hex) return bn;
    return parseInt(bn.hex, 16);
  }
  
  function decodeResult(item) {
    // assuming raw is your parsed JSON array
    console.log("item",item);
      const [batchId, unitSum, thresholdCheck, incentive, penalty, netPayment,parameters] = item;
      
      
      const params ={
        complianceScore: parseBigNumber(parameters.complianceScore/100),
        timeline: parseBigNumber(parameters.timeline/100),
        quality: parseBigNumber(parameters.quality/100),
        batchEfficiency: parseBigNumber(parameters.batchEfficiency/100),
        violationFactor:parseBigNumber(parameters.violationFactor/100)
      }
  
      return {
        batchId:parseBigNumber( batchId),
        unitSum:parseBigNumber(unitSum),
        thresholdCheck,
        incentive: parseBigNumber(incentive),
        penalty: parseBigNumber(penalty),
        netPayment: parseBigNumber(netPayment),
        parameters: params
      };
  }

  function normalizeResults(item) {  
      const netPayment=item.netPayment.toNumber();
      return ({
        batchId: item.batchId.toNumber(),
        unitSum: item.unitSum.toNumber(),
        thresholdCheck: item.thresholdCheck,
        incentive: item.incentive.toNumber(),
        penality: item.penalty.toNumber(),
        netPayment: netPayment,
        manufacturer: (0.5)*netPayment,
        distributer: (0.25)*netPayment,
        transporter: (0.15)*netPayment,
        pharmacist: (0.1)*netPayment,
        parameters:{
          complianceScore: item.parameters.complianceScore,
          timeline: item.parameters.timeline,
          quality: item.parameters.quality,
          batchEfficiency: item.parameters.batchEfficiency,
          violationFactor: item.parameters.violationFactor
        }
        
      });
  }
  


  const handleIncentivePenalitySettlement=async ()=>{
    const [success,res]=await contract.callStatic.incentivePenalitySettlement();
        if(success){
          const tx=await contract.incentivePenalitySettlement();
          const out=normalizeResults(decodeResult(res));
          setAlertData("Incentives/Penalties calculated successfully");
          setSuccess(true);
          setShowAlert(true);
          
          setResults(out);
          setHaveResult(true);
          console.log("out : ",out);
        }else{

          setAlertData("Batch is not registered or/and Parameters are not read");
          setSuccess(true);
          setShowAlert(true);
        }
  }


  return (
    <>
    {/* <div
    className="fixed inset-0 bg-cover bg-center z-0"
    // style={{ backgroundImage: `url(${wallpaper})` }}
  >
    <div className="absolute inset-0  backdrop-blur-sm"></div>
  </div> */}

  {/* Content div is separate sibling */}
  <div className=" p-4 max-w-6xl mx-auto">
            {showAlert && (
        <div className={`fixed top-5 left-1/2 transform -translate-x-1/2  ${success ? "text-green-600 bg-green-100 border-green-400" :"text-red-700 bg-red-100 border-red-400"} px-6 py-4 rounded shadow-lg z-50`}>
          <div className="flex items-center justify-between space-x-4">
            <span>
              <strong className="font-bold text-2xl  text-center">{alertData}</strong> 
            </span>
            <button onClick={() => setShowAlert(false)} className=" text-lg font-bold ">
              &times;
            </button>
          </div>
        </div>
      )}
      
      <div className={`p-4 rounded-xl shadow-md  mx-auto space-y-6 w-fit bg-white border border-black/50 " `}>
        {!haveResult &&(< >
                  <h2 className="text-2xl font-semibold text-center "> B-TRADE & SUPPLY</h2>
        {/*m For*/}
        <div className="w-p">
          <div className="flex-1 border border-black/50 rounded-xl p-4 w-fit">
            {/* Batch Id*/}
            {/* <h2 className="text-xl font-semibold text-center text-gray-800">Utility</h2> */}
                <label className="block font-medium text-gray-900 text-center">
                  Batch Details
                </label>

                <input
                  type="number"
                  name="batchId"
                  id="batchId"
                  placeholder="Batch ID"
                  value={batchId}
                  onChange={handleBatchIdChange}
                  className="w-20.1 h-10 border border-gray-300 bg-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-600 text-lg"
                />
                <br/>
                {/* Pharma Details*/}
            <div className="flex flex-col sm:flex-col gap-4 my-3">
              {pharmaData.map((p, index) => (
                <div key={index} className="flex flex-row gap-3">
                  <h3 className="whitespace-nowrap">Pharma Id</h3>
                  <input
  className="w-20 h-10 border-[2px] border-gray-400 bg-white rounded-[8px] 
             text-center text-base placeholder:text-gray-600 placeholder:text-sm"
  type="text"
  value={p.id}
  onChange={(e) => handlePharmaDataChange(index, 'id', e.target.value)}
  placeholder="Pharma Id"
/>

<input
  className="w-20 h-10 border-[2px] border-gray-400 bg-white rounded-[8px] 
             text-center text-base placeholder:text-gray-600 placeholder:text-sm"
  type="number"
  value={p.units}
  onChange={(e) => handlePharmaDataChange(index, 'units', e.target.value)}
  placeholder="Units"
/>

<input
  className="w-24 h-10 border-[2px] border-gray-400 bg-white rounded-[8px] 
             text-center text-base placeholder:text-gray-600 placeholder:text-sm"
  type="text"
  value={p.name}
  onChange={(e) => handlePharmaDataChange(index, 'name', e.target.value)}
  placeholder="Pharma Name"
/>
                  <button className='border-[2px] border-black rounded-[10px] p-2 w-fit bg-blue-600/40 hover:bg-blue-600/40 whitespace-nowrap' onClick={()=>removePharmaRow(index)}>Remove Pharma</button>
              
                </div>
              ))}
              <div className='flex flex-row sm:flex-row gap-3 m-auto'>
                <button className='border-[2px] border-black rounded-[10px] p-2 w-fit bg-blue-600/40 hover:bg-blue-600/40' onClick={addPharmaRow}>Add Pharma</button>
                <button className='border-[2px] border-black rounded-[10px] p-2 m-auto  bg-blue-600/40 hover:bg-blue-600/40 w-fit' onClick={handleRegisterBatch}>Batch Register</button>
              
              </div>
              
            </div>
          </div>
          {/*IOT Parameter */}
          <div className=" flex-1 border border-black/50 rounded-xl p-4 ">
              <label className="block font-medium text-gray-900 text-center">
              Threshold Parameters
            </label>

            <div className='grid grid-cols-2  '>
              <div className='flex flex-row'>  
                <div className='whitespace-pre '>{"Compliance Score (Cb): "}</div>
                <input className='w-20 h-10 border border-gray-300 bg-white rounded-md px-1 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-600' type="number" step='0.01' name="complianceScore" placeholder='0.92' onChange={handleComplianceScoreChange} value={complianceScore}/>
              </div>
              <div className='flex flex-row '>  
                <div className='whitespace-pre'>{" Timeline Score (Tb):   "}</div>
                <input className='w-20 h-10 border border-gray-300 bg-white rounded-md pl-1 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-600' type="number" step='0.01' name="timelinesScore" placeholder='0.88' onChange={handleTimelinesScoreChange} value={timelinesScore} />
              </div>
              <div className='flex flex-row '>  
                <div className='whitespace-pre'>{"Quality (Qb)                :  "}</div>
                <input className='w-20 h-10 border border-gray-300 bg-white rounded-md px-1 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-600' type="number" step='0.01' name="quality" placeholder='0.95' onChange={handleQualityChange} value={quality} />
              </div>
              <div className='flex flex-row'>  
                <div className='whitespace-pre'>{" Batch Efficiency (Bb): "}</div>
                <input className='w-20 h-10 border border-gray-300 bg-white rounded-md pl-1 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-600' type="number" step='0.01' name="batchEfficiency" placeholder='0.20' onChange={handleBatchEfficiencyChange} value={batchEfficiency} />
              </div>
              <div className='flex flex-row '>  
                <div className='whitespace-pre'>{"Violation Factor (Vb)   :  "}</div>
                <input className='w-20 h-10 border border-gray-300 bg-white rounded-md px-1 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-600' type="number" step='0.01' name="violationFactor" placeholder='0.00' onChange={handleViolationFactor} value={violationFactor}/>
              </div>
              <button className='border-[2px] border-black rounded-[10px] p-2  m-auto  bg-blue-600/40 hover:bg-blue-600/40 w-fit' onClick={handleIotParameters}>Load Parameters</button>
        </div>
            
          </div>
          
        </div>

        <div className='flex flex-row sm:flex-row m-auto'>
            <button className='border-[2px] border-black rounded-[10px] p-2 w-fit m-auto  bg-blue-600/40 hover:bg-blue-600/40 whitespace-nowrap' onClick={handleIncentivePenalitySettlement}>Incentive/Penality Settlement</button>
            <button className='border-[2px] border-black rounded-[10px] p-2 w-fit m-auto  bg-blue-600/40 hover:bg-blue-600/40' onClick={handleReset}>Reset</button>
          </div>
      </>)}
          
        </div>
        {/* Result */}
        <div className={`p-1 mt-7  rounded-xl shadow-md w-full max-w-4xl mx-auto outline outline-1  overflow-visible ${haveResult===true? "bg-slate-50/40 outline-gray-300" : "outline-none" } `}

>

        {haveResult && (
          <>

            <h2 className="text-xl font-bold mb-4 text-black text-center">
            PHRAMA B-TRADE & SUPPLY - Payment Settlement
            </h2>

            <div className={`text-center mb-4  text-xl `}>
              {/* {<h3 className="text-lg font-semibold">
                {success ? 'Required Goal Achieved!' : 'Required Goal Not Met'}
              </h3> } */}
              <div className="flex">
              <div className="W-40 rounded bg-gray-300 border-2 mx-1 p-1">Compliance Score : {results.parameters.complianceScore}</div>
              <div className="W-40 rounded bg-gray-300 border-2 mx-1 p-1">Time Line : {results.parameters.timeline}</div>
              <div className="W-40 rounded bg-gray-300 border-2 mx-1 p-1">Quality  : {results.parameters.quality}</div>
              <div className="W-40 rounded bg-gray-300 border-2 mx-1 p-1">Batch Efficiency : {results.parameters.batchEfficiency}</div>
              <div className="W-40 rounded bg-gray-300 border-2 mx-1 p-1">Violation Factor : {results.parameters.violationFactor}</div>
            </div>
            </div>

            <table className="table-auto border border-gray-800 border-collapse text-sm sm:text-base mx-1 p-1">
              <thead>
                <tr className="bg-slate-300 text-left">
                  <th className="border border-gray-800 px-2 py-2">Batch <br/>Id</th>
                  <th className="border border-gray-800 px-2 py-2">Batch<br/>Size</th>
                  <th className="border border-gray-800 px-2 py-2">Threshold <br/>Check</th>
                  <th className="border border-gray-800 px-2 py-2">Incentive</th>
                  <th className="border border-gray-800 px-2 py-2">Penality</th>
                  <th className="border border-gray-800 px-2 py-2">Net<br/>Payment</th>
                  <th className="border border-gray-800 px-2 py-2">Manufacturer</th>
                  <th className="border border-gray-800 px-2 py-2">Distributer</th>
                  <th className="border border-gray-800 px-2 py-2">Transporter</th>
                  <th className="border border-gray-800 px-2 py-2">Pharmacist</th>
                </tr>
              </thead>
              <tbody>
              
  <tr className="hover:bg-slate-50/60">
    <td className="border border-gray-800 px-2 py-2">{results.batchId}</td>

    {/*Batch Details (only name and size) */}
    <td className="border border-gray-800 px-2 py-2">
    <div>
  {results.unitSum}
</div>
    </td>

    <td 
  className={`border border-gray-800 px-2 py-2 ${
    results.thresholdCheck ? 'text-green-700' : 'text-red-700 '
  }`}
>
  <b>{results.thresholdCheck ? "Passed" : "Fail"}</b>
</td>

    <td className="border border-gray-800 px-2 py-2">{results.incentive/10000}</td>
    <td className="border border-gray-800 px-2 py-2">{results.penality/10000}</td>
    <td className="border border-gray-800 px-2 py-2">{results.netPayment/10000}</td>
    <td className="border border-gray-800 px-2 py-2">{results.manufacturer/10000}</td>
    <td className="border border-gray-800 px-2 py-2">{results.distributer/10000}</td>
    <td className="border border-gray-800 px-2 py-2">{results.transporter/10000}</td>
    <td className="border border-gray-800 px-2 py-2">{results.pharmacist/10000}</td>
  </tr>
              </tbody>
            </table>
          </>
        )}
      </div>
      </div>
    
    </>
  )
}

export default InputData