import React from 'react';

function AddLineItem ({lineItems, setLineItems}){

    const addLineItem = () => {
        setLineItems([...lineItems,{description: '', rate: '', qty: '', total: ''}]);
    };

    const handleLineItemChange = (index, field, value) => {
      const newLineItems = [...lineItems];
      newLineItems[index][field]= value;
      setLineItems(newLineItems);
    };

    const removeLineItems = (index) => {
        const newLineItems = [...lineItems];
        newLineItems.splice(index,1);
        setLineItems(newLineItems);
    };

return(
        <div className="border-t border-b border-grav-300 pV-4 mb-6">
            { lineItems.map
                ((item, index) => (
                    <div key={index} className="flex space-x-4 mb-4">
                        <input type="text" className="border border-gray-300 p-2 rounded-md fLex-1"
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => handleLineItemChange (index, 'description', e.target.value)} />
                        <input type="text" className="border border-gray-300 p-2 rounded-md w-20"
                                placeholder="Rate"
                                value={item.rate}
                                onChange={(e) => handleLineItemChange (index,'rate', e.target.value)} />
                        <input type="text" className="border border-gray-300 p-2 rounded-md w-20"
                                placeholder="Qty"
                                value={item.qty}
                                onChange={(e) => handleLineItemChange (index, 'qty', e.target. value)} />
                        <input type="text" className="border border-gray-300 p-2 rounded-md w-20"
                                placeholder="Total"
                                value={item.total}
                                onChange={(e) => handleLineItemChange (index,'total', e.target.value)} />
                        <button className="bg-red-500 text-white px-2 py-1 rounded-mad" onClick={() => removeLineItems(index)}>Remove</button>
                    </div>
                )
                )
            }
            <div className="border border-dashed border-gray-300 p-4 rounded-ma cursor-pointer text-center" onClick={addLineItem}>
                <p>+ Add a Line</p>
            </div>
        </div>
   );

};
export default AddLineItem;