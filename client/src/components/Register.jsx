import React, { useState } from 'react'
import axios from 'axios'

const Register = () => {

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "user"
    })

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

    const handleSubmit = async (e) => {
        
        e.preventDefault()
        try{

        const res = await axios.post('http://localhost:4000/user/register', form)
        alert(res.data.message)

        }catch (err) {
            console.log(err)
        }
    }

  return (
    <div>
        <form onSubmit={handleSubmit}>

            <input type="text" 
            placeholder='name'
            name='name' 
            onChange={handleChange}
            />
            <br /> <br />
            <input type="email"
            placeholder='email' 
            name='name'
            onChange={handleChange}
            />
            <br /><br />

            <input type="password"
            placeholder='password' 
            name='name'
            onChange={handleChange}
            />
            <br /> <br />

            <input type="number"
            placeholder='phone' 
            name='name'
            onChange={handleChange}
            />
            <br /> <br />

            <button>Register</button>
        </form>
    </div>
  )
}

export default Register