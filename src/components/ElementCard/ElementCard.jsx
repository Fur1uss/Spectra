import React from "react";
import './ElementCard.css'

const ElementCard = () =>{

    const infoObjectArray = [
        {icon: "/ic01.webp", text: "total interacción con usuarios en la plataforma"},
        {icon: "/ic02.webp", text: "integridad de todos nuestros casos"},
        {icon: "/ic03.webp", text: "un único lugar para ver todo lo paranormal"}]



    return(
        <div className='element-container'>
            {infoObjectArray.map((item, index) => (
                <div key={index} className='element-item'>
                    <img src={item.icon} alt="" />
                    <p>{item.text}</p>
                </div>
            ))}
 
        </div>
    )
}

export default ElementCard;