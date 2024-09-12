import React from 'react';

function SendEmailPopup({ onClose }) {

return (
    <div className="fixed inset- flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-8 max-w-md mx-auto rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Send Email</h2>
            <form className="space-y-4">
                <div>
                    <label htmlFor="to" className="block text-sm font-medium text-gray-700">To:</label>
                    <input type="email" id="to"
                        name="to" className="border-gray-300 rounded-md w-full py-2 px-3 mt-1" placeholder="Recipient's email" />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message: </label>
                    <textarea id="message" name="message" rows="4"
                        className="border-gray-300 rounded-md w-futz py-2 px-3 mt-1" placeholder="Your message">
                    </textarea>
                </div>
                <div className="flex justify-end">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel </button>
                    <button type="submit" className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" >Send </button>
                </div>
            </form>
        </div>
    </div>
);
}
export default SendEmailPopup;