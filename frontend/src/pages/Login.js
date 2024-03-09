import React, { useState } from 'react';
import { findUser } from '../services/UserService';
import { useUserContext } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import {useTranslation} from "react-i18next"; // Import useNavigate hook

const Login = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const { setUser } = useUserContext();
    const navigate = useNavigate(); // Use navigate for redirection after login
    const [error, setError] = useState(''); // State to hold error messages
    // const {t} = useTranslation("global")
    const { t, i18n } = useTranslation();


    // Modified to accept the event argument
    const handleLogin = async (event) => {
        event.preventDefault(); // Prevent the default form submission behavior
        setError(''); // Clear previous errors
        if (!username.trim() || !email.trim()) {
            setError('Please enter both username and email'); // Set error
            return;
        }

        try {
            const user = await findUser(username, email);
            if (user && user !== "User not found. Proceed with creation.") {
                setUser(user); // Set the user in context if found
                navigate('/dashboard'); // Navigate to the Dashboard upon successful login
            }
            else {
                // The user does not exist, so inform them of a failed login attempt
                setError(t("app.loginFailed"));
            }

        } catch (error) {
            // else if (errorMessage.message==="Server error occurred. Please try again later." ) {
            //     setError(t("app.serverError"))
            // }
            if (error.message==="Server error occurred. Please try again later.") {
                setError(t("app.serverError"))
            }

        }
    };


    return (
        <div className="container" >
            <form className="form-horizontal" onSubmit={handleLogin}>
                <h1>{t("app.login-sign-up")}</h1>
                {error && <div style={{color: 'red'}}>{error}</div>}


                <div className="form-group">
                    <div>
                        <label htmlFor="username" className="col-sm-3 control-label">Username</label>
                    </div>

                    <div className="col-sm-9">
                        <input
                            id="username"
                            className="form-control"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onInvalid={(e) => e.target.setCustomValidity(t("app.usernameRequiredMessage"))}
                            onInput={(e) => e.target.setCustomValidity('')}
                            placeholder="Username"
                            required/>
                    </div>
                </div>

                <div className="form-group">
                    <div>
                        <label htmlFor="email" className="col-sm-3 control-label">Email</label>
                    </div>

                    <div className="col-sm-9">
                        <input
                            id="email"
                            className="form-control"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onInvalid={(e) => e.target.setCustomValidity(t("app.emailRequiredMessage"))}
                            onInput={(e) => e.target.setCustomValidity('')}
                            placeholder="Email"
                            required/>
                    </div>
                </div>

                <div className="col-sm-offset-3 col-sm-9">
                    <button type="submit" className="btn-lg btn-primary">
                        {t("app.login-sign-up")} <span className="glyphicon glyphicon-log-in"></span>
                    </button>
                </div>
            </form>
            <div>

                    <span>{t("app.no-account")}</span> &nbsp;
                    <button className="btn btn-default" type="button"
                            onClick={() => navigate('/signup')}>{t("app.sign-up-here")}
                    </button>


            </div>
        </div>
    );
};

export default Login;
