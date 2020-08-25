import React from 'react';
import {
    Typography, Grid, Button
} from '@material-ui/core';
import './userDetail.css';

import { Link } from 'react-router-dom';
import axios from 'axios';

const DETAILS = "info about ";


/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: undefined
        };
    }

    componentDidMount() {
        const newUserId = this.props.match.params.userId;
        axios.get(`/user/${newUserId}`)
            .then(response => {
                const newUser = response.data;
                //console.log(newUser);
                this.setState({ user: newUser });
                this.props.changeView(
                    DETAILS, `${newUser.first_name} ${newUser.last_name}`
                );
            })
            .catch(err => console.log(err.response));

    }

    componentDidUpdate(prevProps, prevState) {
        const newUserId = this.props.match.params.userId;
        if (prevState.user && newUserId !== prevState.user._id) {
            axios.get(`/user/${newUserId}`)
                .then(response => {
                    const newUser = response.data;
                    //console.log(newUser);
                    this.setState({ user: newUser });
                    this.props.changeView(
                        DETAILS, `${newUser.first_name} ${newUser.last_name}`
                    );
                })
                .catch(err => console.log(err.response));
        }
    }

    render() {
        return this.state.user ? (
            <Grid container justify="space-evenly"
                alignItems="center">
                <Grid item xs={6}>
                    <Typography variant="h3">
                        {`${this.state.user.first_name} ${this.state.user.last_name}`}
                    </Typography>
                    <Typography variant="h5">
                        {this.state.user.occupation} <br />
                        based in {this.state.user.location}
                    </Typography>
                    <Typography variant="body1">
                        {this.state.user.description}
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    <Button variant="contained" size="large">
                        <Link to={`/photos/${this.state.user._id}`}>See photos</Link>
                    </Button>
                </Grid>
            </Grid>
        ) : (
            <div></div>
        );
    }
}

export default UserDetail;
