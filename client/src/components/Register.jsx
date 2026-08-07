import React, { useState } from 'react'
import axios from 'axios'
import { GoogleLogin } from '@react-oauth/google'
import { Navigate, useNavigate } from 'react-router-dom'
import API from '../api/axios.js'

const Register = () => {

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        // phone: "",
        // role: "user"
    })

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

    const handleSubmit = async (e) => {
        // console.log("sdf");

        e.preventDefault()
        try {

            const res = await API.post('/api/auth/register', form)
            alert(res.data.message)

        } catch (err) {
            console.log(err)
            alert(err.response?.data?.message || "Registra on failed");
        }
    }

    const handleGoogleSuccess = async (CredentialResponse) => {
        try {

            const res = await API.post("/user/google-login", {
                Credential: CredentialResponse.Credential,
            });

            localStorage.setItem("token", res.data.token);

            Navigate("/dashboard");


        } catch (err) {
            alert(err.response?.data?.message || "Google Login Failed");
        }
    }

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>

                <input type="text"
                    placeholder='name'
                    name='name'
                    onChange={handleChange}
                />
                <br /> <br />
                <input type="email"
                    placeholder='email'
                    name='email'
                    onChange={handleChange}
                />
                <br /><br />

                <input type="password"
                    placeholder='password'
                    name='password'
                    onChange={handleChange}
                />
                <br /> <br />


                <button type='submit'>Register</button>
            </form>

            <br />
            <hr />
            <br />

            <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log("login Failed")}
            />
        </div>
    )
}




export default Register