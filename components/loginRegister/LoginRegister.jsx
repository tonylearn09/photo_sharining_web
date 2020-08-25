import React from "react";
import { Grid, Typography, Input, TextField } from "@material-ui/core";
const axios = require("axios").default;

class LoginRegister extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // For registration
            firstName: "",
            lastName: "",
            description: "",
            location: "",
            occupation: "",
            registerNameAttempt: "",
            registerPasswordAttempt: "",
            registerPasswordVerify: "",

            // For login
            loginNameAttempt: "",
            passwordAttempt: "",

            // Failure
            failedLoginMsg: "",
            failedRegisterMsg: ""
        };
    }

    handleLogin = (event) => {
        event.preventDefault();
        axios.post("admin/login", {
            login_name: this.state.loginNameAttempt,
            password: this.state.passwordAttempt
        }).then(response => {
            // message 200
            this.setState({ failedLoginMsg: "" });
            const user = response.data;
            this.props.changeLoggedIn(user);
            window.location.href = `#/users/${user._id}`;
            //window.location.href = `/users/${user._id}`;
        }).catch(err => {
            this.setState({ failedLoginMsg: err.response.data });
        });
    }

    handleChangeInput = (statesUpdate) => {
        this.setState(statesUpdate);
    }

    handleRegister = (event) => {
        if (this.state.registerPasswordAttempt !== this.state.registerPasswordVerify) {
            this.setState({failedRegisterMsg: "Passwords don't match"});
            return;
        }

        event.preventDefault();
        axios.post("/user", {
            login_name: this.state.registerNameAttempt,
            password: this.state.registerPasswordAttempt,
            occupation: this.state.occupation,
            location: this.state.location,
            description: this.state.description,
            first_name: this.state.firstName,
            last_name: this.state.lastName
        }).then(response => {
            //message 200
            this.setState({ failedRegisterMsg: "" });
            let user = response.data;
            this.props.changeLoggedIn(user);
            window.location.href = `#/users/${user._id}`;
            //window.location.href = `/users/${user._id}`;
        }).catch(err => {
            this.setState({ failedRegisterMsg: err.response.data });
        });
    }

    render() {
        return (
            <Grid container justify="space-around">
                <Grid item>
                    <Typography variant="h5" color="inherit">
                        Login
                    </Typography>
                    <Typography variant="body1" color="error">
                        {this.state.failedLoginMsg}
                    </Typography>
                    <form onSubmit={this.handleLogin}>
                        <label>
                            <TextField
                                required
                                label="Username"
                                type="text"
                                value={this.state.loginNameAttempt}
                                onChange={event =>
                                        this.handleChangeInput({ loginNameAttempt: event.target.value })
                                }
                            />
                        </label>
                        <br />
                        <label>
                            <TextField
                                required
                                label="Password"
                                type="text"
                                value={this.state.passwordAttempt}
                                onChange={event =>
                                        this.handleChangeInput({
                                            passwordAttempt: event.target.value
                                        })
                                }
                            />
                        </label>
                        {/* consider using Textfield from material UI */}
                        <br />
                        <br />
                        <Input type="submit" value="Submit" />
                    </form>
                </Grid>

                <Grid item>
                    <Typography variant="h5">Register</Typography>
                    <Typography variant="body1" color="error">
                        {this.state.failedRegisterMsg}
                    </Typography>
                    <form onSubmit={this.handleRegister}>
                        <label>
                            <TextField
                                required
                                label="First name"
                                type="text"
                                value={this.state.firstName}
                                onChange={event =>
                                        this.handleChangeInput({ firstName: event.target.value })
                                }
                            />{" "}
                        </label>
                        <br />
                        <label>
                            <TextField
                                required
                                label="Last name"
                                type="text"
                                value={this.state.lastName}
                                onChange={event =>
                                        this.handleChangeInput({ lastName: event.target.value })
                                }
                            />{" "}
                        </label>
                        <br />
                        <label>
                            <TextField
                                required
                                label="Username"
                                type="text"
                                value={this.state.registerNameAttempt}
                                onChange={event =>
                                        this.handleChangeInput({
                                            registerNameAttempt: event.target.value
                                        })
                                }
                            />
                        </label>
                        <br />
                        <label>
                            <TextField
                                label="Password"
                                required
                                type="password"
                                value={this.state.registerPasswordAttempt}
                                onChange={event =>
                                        this.handleChangeInput({
                                            registerPasswordAttempt: event.target.value
                                        })
                                }
                            />
                        </label>
                        <br />
                        <label>
                            <TextField
                                label="Verify password"
                                required
                                error={
                                    this.state.registerPasswordAttempt !==
                                        this.state.registerPasswordVerify
                                }
                                type="password"
                                value={this.state.registerPasswordVerify}
                                onChange={event =>
                                        this.handleChangeInput({
                                            registerPasswordVerify: event.target.value
                                        })
                                }
                            />
                        </label>
                        <br />
                        <label>
                            <TextField
                                label="Where are you from?"
                                type="text"
                                value={this.state.location}
                                onChange={event =>
                                        this.handleChangeInput({ location: event.target.value })
                                }
                            />
                        </label>
                        <br />
                        <label>
                            <TextField
                                label="Describe yourself"
                                type="text"
                                value={this.state.description}
                                onChange={event =>
                                        this.handleChangeInput({ description: event.target.value })
                                }
                            />
                        </label>
                        <br />
                        <label>
                            <TextField
                                label="Occupation"
                                type="text"
                                value={this.state.occupation}
                                onChange={event =>
                                        this.handleChangeInput({ occupation: event.target.value })
                                }
                            />
                        </label>
                        <br />
                        <br />
                        <Input type="submit" value="Register Me!" />
                    </form>
                </Grid>
            </Grid>
        );
    }

}

export default LoginRegister;
