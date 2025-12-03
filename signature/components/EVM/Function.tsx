import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Contract, JsonRpcProvider } from "ethers";
import { ABI } from "../../config";

interface FunctionCallFormProps {
  props: {
    contractAddress: string;
    senderAddress: string;
    isLoading: boolean;
    rpcUrl: string;
    Evm: any;
  };
}

export const FunctionCallForm = forwardRef<any, FunctionCallFormProps>(
    (
      { props: { contractAddress, senderAddress, isLoading, rpcUrl, Evm } },
      ref,
    ) => {
      const [number, setNumber] = useState(1000);
      const [currentNumber, setCurrentNumber] = useState("");
  
      const provider = new JsonRpcProvider(rpcUrl);
      const contract = new Contract(contractAddress, ABI, provider);
  
      const getNumber = async () => {
        const result = await contract.get();
        setCurrentNumber(String(result));
      };
  
      useEffect(() => {
        getNumber();
      }, []);
  
      useImperativeHandle(ref, () => ({
        async createTransaction() {
          const data = contract.interface.encodeFunctionData("set", [number]);
  
          return await Evm.prepareTransactionForSigning({
            from: senderAddress,
            to: contractAddress,
            data,
          });
        },
        async afterRelay() {
          getNumber();
        },
      }));
  
      return (
        <>
          <div className="row mb-3">
            <label className="col-sm-2 col-form-label col-form-label-sm">
              Counter:
            </label>
            <div className="col-sm-10">
              <input
                type="text"
                className="form-control form-control-sm"
                value={contractAddress}
                disabled
              />
              <div className="form-text">Contract address</div>
            </div>
          </div>
          <div className="row mb-3">
            <label className="col-sm-2 col-form-label col-form-label-sm">
              Number:
            </label>
            <div className="col-sm-10">
              <input
                type="number"
                className="form-control form-control-sm"
                value={number}
                onChange={(e) => setNumber(Number(e.target.value))}
                step="1"
                disabled={isLoading}
              />
              <div className="form-text">
                {" "}
                The number to save, current value: <b> {currentNumber} </b>{" "}
              </div>
            </div>
          </div>
        </>
      );
    },
  );
  
  
  FunctionCallForm.displayName = "FunctionCallForm";