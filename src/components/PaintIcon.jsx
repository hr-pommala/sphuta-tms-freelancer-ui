import React from 'react';
import {FaPaintBrush} from 'react-icons/fa';

function PaintIcon(){

    return(
            <div className="flex">
                <FaPaintBrush size={20} className="text-green-600" />
                <h2>Customize Invoice Style &gt;</h2>
            </div>
        );

    }

export default PaintIcon;