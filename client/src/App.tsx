import React, { Component } from "react";
import { DepartmentList } from "./components/DepartmentList";
import { Router, Link, Route, Switch } from "react-router-dom";
import { Grid, Menu, Segment } from "semantic-ui-react";
import { EmployeesList } from "./components/EmployeesList";
import { LogIn } from './components/LogIn';
import { NotFound } from "./components/NotFound";
import Auth from "./auth/Auth";
import { CreateDepartment } from "./components/CreateDepartment";
import { CreateEmployee } from "./components/CreateEmployee";

export interface AppProps {}

export interface AppProps {
  auth: Auth;
  history: any;
}

export interface AppState {}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  handleLogin() {
    this.props.auth.login();
  }

  handleLogout() {
    this.props.auth.logout();
  }

  render() {
    return (
      <div>
        <Segment style={{ padding: "8em 0em" }} vertical>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={16}>
                <Router history={this.props.history}>
                  {this.generateMenu()}

                  {this.generateCurrentPage()}
                </Router>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    );
  }

  generateMenu() {
    return (
      <Menu>
        <Menu.Item name="home">
          <Link to="/">Home</Link>
        </Menu.Item>
        <div style={{ padding: "12px", margin: "auto", color: "#14204d" }}>
          <h3 className="">Employee Management System</h3>
        </div>
        <Menu.Menu position="right">{this.logInLogOutButton()}</Menu.Menu>
      </Menu>
    );
  }

  logInLogOutButton() {
    if (this.props.auth.isAuthenticated()) {
      return (
        <Menu.Item name="logout" onClick={this.handleLogout}>
          Log Out
        </Menu.Item>
      );
    } else {
      return (
        <Menu.Item name="login" onClick={this.handleLogin}>
          Log In
        </Menu.Item>
      );
    }
  }

  generateCurrentPage() {
    if (!this.props.auth.isAuthenticated()) {
      return <LogIn auth={this.props.auth} />
    }

    return (
      <Switch>
        
        <Route 
          path="/" 
          exact 
          render={ props => {
            return <DepartmentList {...props} auth={this.props.auth} />
          }} />

        <Route
          path="/departments/create"
          exact
          render={(props) => {
            return <CreateDepartment {...props} auth={this.props.auth} />;
          }}
        />

        <Route 
          path="/employees/:departmentId" 
          exact  
          render={(props) => {
            return <EmployeesList {...props} auth={this.props.auth.getIdToken().toString()} />
          }} />

        <Route
          path="/employees/:groupId/create"
          exact
          render={(props) => {
            return <CreateEmployee {...props} auth={this.props.auth} />;
          }}
        />

        <Route component={NotFound} />
      </Switch>
    );
  }
}
