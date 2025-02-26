import React from 'react'
import { useState } from 'react'

const Form = () => {
    const [forData,setFormData]=useState({
        name:"",
        email:""
    })
    const handleChange=(e)=>{
        setFormData({...forData,[e.target.name]:e.target.value})
    }
    const handleSubmit=(e)=>{
        e.preventDefault()
        console.log("From Data ",forData);
    }

    
  return (
    <div>
        <form onSubmit={handleSubmit}>
            <lable>Name:</lable>
            <input type="text" name="name" value={forData.name} onChange={handleChange} />
            
            <lable>Email:</lable>
            <input type="text" name="email" value={forData.email} onChange={handleChange} />

            <button type="submit">Submit</button>


        </form>
    </div>
  )
}
export default Form