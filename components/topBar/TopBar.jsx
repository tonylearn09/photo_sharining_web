import React from 'react';
import {
  AppBar, Toolbar, Typography, Grid, Button, Dialog, Input
} from '@material-ui/core';
import './TopBar.css';
import axios from 'axios';

/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            view: this.props.view,
            uploadDialogOpen: false
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.view !== this.props.view) {
            this.setState({view: this.props.view});
        }
    }

    // this function is called when user presses the update button
    handleUploadButtonClicked = (event) => {
        event.preventDefault();
        if (this.uploadInput.files.length > 0) {
            // Create a DOM form and add the file to it under the name uploadedphoto
            const domForm = new FormData();
            domForm.append("uploadedphoto", this.uploadInput.files[0]);

            axios.post('/photos/new', domForm)
                .then((res) => {
                    console.log(res);
                    this.setState({uploadDialogOpen: false});
                    window.location.href=`#/photos/${this.props.currUser._id}`;
                })
                .catch(err => console.log(`POST ERR: ${err}`));
        }
    }

    uploadButton = (event) => {
        this.setState({uploadDialogOpen: true});
    }
    handleCloseDialog = (event) => {
        this.setState({uploadDialogOpen: false})
    }

    handleLogOut = (event) => {
        this.props.changeLoggedIn(null);
    }

    render() {
        return (
            <AppBar className="cs142-topbar-appBar" position="absolute">
                <Toolbar>
                    {this.props.currUser ? (
                        <Grid container  direction="row"
                            justify="space-between"
                            alignItems="center">
                            <Grid item>
                                <Typography variant="h5">{this.state.view}</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h5">
                                    Hi {this.props.currUser.first_name}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Button variant="contained" color="primary" onClick={this.uploadButton}>
                                    Upload Photo
                                </Button>
                                <Dialog open={this.state.uploadDialogOpen} onClose={this.handleCloseDialog}>
                                    <form onSubmit={this.handleUploadButtonClicked}>
                                        <label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={domFileRef => {
                                                    this.uploadInput = domFileRef;
                                                }}
                                            />
                                        </label>

                                        <Input color="primary" type="submit" value="Post" />
                                    </form>
                                </Dialog>
                            </Grid>
                            <Grid item>
                                <Button onClick={this.handleLogOut} variant="contained">
                                    Log out
                                </Button>
                            </Grid>
                        </Grid>
                    ) : (
                        <Typography variant="h5">Please login</Typography>
                    )}
                </Toolbar>
            </AppBar>
        );
    }
}

export default TopBar;
