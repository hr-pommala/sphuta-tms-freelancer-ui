import React from 'react';
import {FaPaintBrush, FaChevronRight} from 'react-icons/fa';

function PaintIcon(){

    return(
            <div className="flex">
                <FaPaintBrush size={20} className="text-green-600" />
                <h2>Customize Invoice Style </h2>
                <FaChevronRight className="text-gray-500" />
            </div>
        );

    }

export default PaintIcon;