import React from 'react';
import {
    Typography,
    Grid,
} from '@material-ui/core';
import { Link } from "react-router-dom";
import axios from 'axios';

import PhotoCard from './PhotoCard';
import './userPhotos.css';


 const PHOTOS = "Photos of ";


/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            photos: null
        };
        this.userId = props.match.params.userId;
        this.user = null;

        // pass to PhotoCard to update this.state.photos
        this.refreshCards = this.refreshCards.bind(this);
    }

    refreshCards() {
        //refresh the photos and the database
        axios.get(`/photosOfUser/${this.userId}`)
            .then(response => {
                this.setState({ photos: response.data });
            })
            .catch(err => {
                console.log(err.response);
            });
    }

    componentDidMount() {
        // fetch the photos
        this.refreshCards();

        // fetch user info
        axios.get(`/user/${this.userId}`)
            .then(response => {
                this.user = response.data;
                this.props.changeView(
                    PHOTOS,
                    `${this.user.first_name} ${this.user.last_name}`
                );
            })
            .catch(err => { console.log(err.response); });
    }

    render() {
        return this.user ? (
            <Grid container justify="space-evenly" alignItems="flex-start">
                <Grid item xs={12}>
                    <Typography variant="h3">
                        {this.user.first_name} {this.user.last_name}&apos;s photos
                    </Typography>
                </Grid>
                {
                    this.state.photos ? (this.state.photos.map(photo => (
                        <Grid item xs={6} key={photo._id}>
                            <PhotoCard
                                creator={this.user}
                                refreshCards={this.refreshCards}
                                photo={photo}/>
                        </Grid>
                    ))) : (
                        <div></div>
                )}
            </Grid>
        ) : (
            <div></div>
        );
    }
}

export default UserPhotos;
