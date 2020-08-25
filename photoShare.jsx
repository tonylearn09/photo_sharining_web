import React from 'react';
import ReactDOM from 'react-dom';
import {
    HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
    Grid, Typography, Paper
} from '@material-ui/core';
import './styles/main.css';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/UserDetail';
import UserList from './components/userList/UserList';
import UserPhotos from './components/userPhotos/UserPhotos';
import LoginRegister from "./components/loginRegister/LoginRegister";

class PhotoShare extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            view: "Home",
            isLoggerIn: true,
            currUser: null
        }
        this.changeView = this.changeView.bind(this);
        this.changeLoggedIn = this.changeLoggedIn.bind(this);
    }

    changeView = (newView, name) => {
        this.setState({view: newView + name});
    }

    changeLoggedIn = newUser => {
        this.setState({currUser: newUser});
    }

    render() {
        return (
            <HashRouter>
                <div>
                    <Grid container spacing={8}>
                        <Grid item xs={12}>
                            <TopBar view={this.state.view} 
                                changeLoggedIn={this.changeLoggedIn}
                                currUser={this.state.currUser}
                            />
                        </Grid>
                        <div className="cs142-main-topbar-buffer"/>
                        <Grid item sm={3}>
                            <Paper  className="cs142-main-grid-item">
                                {this.state.currUser ? <UserList /> : null}
                            </Paper>
                        </Grid>
                        <Grid item sm={9}>
                            <Paper className="cs142-main-grid-item">
                                <Switch>
                                    {/*<Route exact path="/"
                                        render={() =>
                                            <Typography variant="body1">
                                                Welcome to your photosharing app! This 
                                                <a href="https://material-ui.com/demos/paper/">Paper</a> component
                                                displays the main content of the application. The {"sm={9}"} prop in
                                                the <a href="https://material-ui.com/layout/grid/">Grid</a> item component makes 
                                                it responsively display 9/12 of the window. The Switch component enables us to
                                                conditionally render different components to this part of the screen. 
                                                You don&apos;t need to display anything here on the homepage,
                                                so you should delete this Route component once you get started.
                                            </Typography>}
                                    />*/}
                                    <Redirect exact path="/" to="/login-register" />
                                    <Route path="/login-register"
                                        render={ props => <LoginRegister 
                                            {...props} changeLoggedIn={this.changeLoggedIn} /> }
                                    />
                                    {this.state.currUser ? (
                                        <Route path="/users/:userId"
                                            render={ props => <UserDetail 
                                                {...props} changeView={this.changeView} /> }
                                        />
                                    ) : (
                                        <Redirect path="/users/:userId" to="/login-register" />
                                    )}
                                    {this.state.currUser ? (<Route path="/photos/:userId"
                                        render ={ props => <UserPhotos 
                                            {...props} changeView={this.changeView} /> }
                                    />) : (
                                        <Redirect path="/photos/:userId" to="/login-register" />
                                    )}
                                    {/*<Route path="/users" component={UserList}  /> */}
                                </Switch>
                            </Paper>
                        </Grid>
                    </Grid>
                </div>
            </HashRouter>
        );
    }
}


ReactDOM.render(
    <PhotoShare />,
    document.getElementById('photoshareapp'),
);
