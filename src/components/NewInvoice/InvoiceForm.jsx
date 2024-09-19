import React, {useState} from 'react';
import PaymentIcons from './PaymentIcons';
import PaintIcon from './PaintIcon';
import RedoIcons from './RedoIcons';
import PaymentModal from './PaymentModal';
import MakeRecurringModal from './MakeRecurringModal';
import AddLineItem from './AddLineItem';
import SendEmailPopup from './SendEmailPopup';
import { FaCreditCard, FaPalette, FaSyncAlt, FaChevronRight } from 'react-icons/fa'; // Icons


function NewInvoice(){
        const [isModalOpen, setIsModalOpen] = useState (false);
        const [isMakeRecurringModalOpen, setIsMakeRecurringModalOpen] = useState (false) ;
        const [lineItems, setLineItems] = useState ([{description: '', rate: '', lineTotal: ''}]);
        const [sendEmailPopup, setSendEmailPopup] = useState (false);

        const toggleSendEmailPopup = () => setSendEmailPopup (!sendEmailPopup);
        const openModal = () => setIsModalOpen(true);
        const closeModal = () => setIsModalOpen (false);
        const openMakeRecurringModal = () => setIsMakeRecurringModalOpen (true);
        const cLoseMakeRecurringModal = () => setIsMakeRecurringModalOpen (false);

        return(

            <>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-9">
                        <h1 className="text-xl text-left font-bold"> New Invoice</h1>
                    </div>
                    <div className="sm:col-span-3">
                        <button className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">cancel</button>
                        <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Save</button>
                        <button onClick={toggleSendEmailPopup} className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Send To..</button>
                        {sendEmailPopup && <SendEmailPopup onClose={toggleSendEmailPopup} />}
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-9 border p-4">
                        <div className="grid grid-cols-2 gap-4 p-4">
                            <div className="border p-1 flex flex-col justify-center items-center">
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <div className="text-center">
                                        <p>Drag the logo here</p>
                                        <span>or</span>
                                        <p>Select a file</p>
                                    </div>
                                </label>
                            </div>
                            <div className="flex flex-col text-right">
                                <p>Address:</p>
                                <p>123 Example sr, City, Country</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 p-4">
                            <div className="flex flex-col text-left">
                                <div className="mb-2">
                                        <label htmlFor="client-name" className="font-bold">Billed To</label>
                                        <input id="client-name" type="text" className="border p-2" defaultValue="Select a Client" />
                                </div>
                                <div>
                                    <p className="mt-2 text-blue-500 cursor-pointer hover:underline"> + Create a Client </p>
                                </div>
                            </div>
                            <div className="flex flex-col text-left">
                                <div className="mb-2">
                                    <label htmlFor="Date of Issue" className="block text-sm font-medium text-gray-700 font-bold">Date of Issue</label>
                                    <input type="Date" className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-5m" />
                                </div>
                                <div>
                                    <label htmlFor="Date of Issue" className="block text-sm font-medium text-gray-700 font-bold">Due Date</label>
                                    <input type="Date" className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-5m" />
                                </div>
                            </div>
                            <div className="flex flex-col text-left">
                                <div className="mb-2">
                                    <label htmlFor="Invoice Number" className="font-bold">Invoice Number</label>
                                    <div className="mt-1 block w-full p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">00001</div>
                                </div>
                                <div>
                                    <label htmlFor="Reference" className="font-bold">Reference</label>
                                    <div className="mt-1 block w-full p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">Enter Value (e.g PO#)</div>
                                </div>
                            </div>
                            <div className="flex flex-col text-left">
                                <label htmlFor="amount-due" className="font-bold">Amount Due</label>
                                <div className="mt-1 block w-full p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">$0.00</div>
                            </div>
                        </div>
                        <hr className="my-4 border-t border"/>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-8 text-left"><span>Description</span></div>
                            <div className="col-span-1"><span>Rate</span></div>
                            <div className="col-span-1"><span>Qty</span></div>
                            <div className="col-span-2"><span>Line Total</span></div>
                        </div>
                        <div className="border border-dashed border-gray-300 p-4 rounded-md cursor-pointer text-center">
                            <AddLineItem lineItems={lineItems} setLineItems={setLineItems} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4">
                                <div>Subtotal</div>
                                <div>Add a Discount</div>
                                <div>Tax</div>
                                <hr className="my-4 border-t"/>
                                <div>Total</div>
                                <div>Amount paid</div>
                            </div>
                            <div className="p-4">
                                <div>500.00</div>
                                <div>0.00</div>
                                <div>50.00</div>
                                <hr className="my-4 border-t"/>
                                <div>550.00</div>
                                <div>0.00</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid sm:col-span-3 grid-rows-5 grid-flow-col">
                        {/* Settings For This Invoice */}
                        <div className="mt-4 space-y-4">
                          <h2 className="text-xl font-semibold">Settings For This Invoice</h2>

                          {/* Settings options with icons and '>' caret */}
                          <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                              <div className="flex items-center">
                                <FaCreditCard className="text-blue-500 w-6 h-6 mr-2" />
                                <span className="font-medium">Accept Online Payments: <span className="text-red-500">NO</span></span>
                              </div>
                              <FaChevronRight className="text-gray-500" onClick={openModal} />
                            </div>

                            <div className="flex justify-between items-center border-b pb-2">
                              <div className="flex items-center">
                                <FaPalette className="text-blue-500 w-6 h-6 mr-2" />
                                <span className="font-medium">Customize Invoice Style</span>
                              </div>
                              <FaChevronRight className="text-gray-500" />
                            </div>

                            <div className="flex justify-between items-center border-b pb-2">
                              <div className="flex items-center">
                                <FaSyncAlt className="text-blue-500 w-6 h-6 mr-2" />
                                <span className="font-medium">Make Recurring</span>
                              </div>
                              <FaChevronRight className="text-gray-500" onClick={openMakeRecurringModal} />
                            </div>
                          </div>
                        </div>
                    </div>
                    <PaymentModal isOpen={isModalOpen} onRequestClose={closeModal} />
                    <MakeRecurringModal isOpen={isMakeRecurringModalOpen} onRequestClose={cLoseMakeRecurringModal} />
                </div>

            </>

        )

    }

export default NewInvoice;