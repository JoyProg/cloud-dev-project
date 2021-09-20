import * as React from "react";
import { Employee } from "../types/Employee";
import { getEmployees, deleteEmployee } from "../api/employee-api";
import { Card, Divider, Button, Grid, Icon, Image } from "semantic-ui-react";
import { History } from "history";

enum FetchedState {
  Fetching,
  Fetched
}

enum DeleteState {
  Deleting,
  NoDelete
}

interface EmployeesListProps {
  history: History;
  match: {
    params: {
      departmentId: string;
    };
  };
  auth: string;
}

interface EmployeesListState {
  employees: Employee[],
  fetchedState: FetchedState,
  deleteState: DeleteState
}

export class EmployeesList extends React.PureComponent<
  EmployeesListProps,
  EmployeesListState
> {
  state: EmployeesListState = {
    employees: [],
    fetchedState: FetchedState.Fetching,
    deleteState: DeleteState.NoDelete
  };

  handleCreateImage = () => {
    this.props.history.push(
      `/employees/${this.props.match.params.departmentId}/create`
    );
  };

  onEmployeeDelete = async (employeeId: string) => {
    this.setState({
      deleteState: DeleteState.Deleting
    })
    try {
      await deleteEmployee(this.props.auth, employeeId)
      this.setState({
        employees: this.state.employees.filter(employee=> employee.employeeId != employeeId),
        deleteState: DeleteState.NoDelete
      })
    } catch {
      alert('Employee deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const employees = await getEmployees(this.props.auth, this.props.match.params.departmentId)
      this.setState({
        employees,
        fetchedState: FetchedState.Fetched
      });
    } catch (e: any) {
      alert(`Failed to fetch employees for department : ${e.message}`);
      this.setState({
        fetchedState: FetchedState.Fetched
      });
    }
  }

  render() {
    // return (
    //   <div>
    //     <h1>Employees</h1>

    //     <Button
    //       size="huge"
    //       className="add-button custom-col"
    //       onClick={this.handleCreateImage}
    //     >
    //       Add employee
    //     </Button>

    //     <Divider clearing />

    //     <Card.Group>
    //       {this.state.images.map((image) => {
    //         return <UdagramImage key={image.imageId} image={image} />;
    //       })}
    //     </Card.Group>
    //   </div>
    // );
    return (
      <div>
        <h1>Employees</h1>

        <Button
          size="huge"
          className="add-button custom-col"
          onClick={this.handleCreateImage}
        >
          Add new employee
        </Button>

        <Divider clearing />

        {/* <Card.Group>
          {this.state.images.map((image) => {
            return <UdagramImage key={image.imageId} image={image} />;
          })}
        </Card.Group> */}

        <Grid padded>
          <Grid padded>
          {this.state.fetchedState === FetchedState.Fetching && <div className="loader"></div>}
            {this.state.employees.map((employee) => {
              return (
                <Grid.Row key={employee.employeeId}>
                  <Grid.Column width={10} verticalAlign="middle" style={{ marginBottom: "12px", marginLeft: "-15px", fontSize: "medium"}}>
                    <span><b>Name: </b>{employee.name} </span> <br />
                    <span><b>Joined: </b>{employee.employmentDate}</span>
                  </Grid.Column><br /><br />
                  <Grid.Column width={3} floated="left">
                  {employee.attachmentUrl && (
                    <Image src={employee.attachmentUrl} size="small" wrapped />
                  )}
                  </Grid.Column>
                  <Grid.Column width={1} floated="right">
                    <Button
                      icon
                      color="red"
                      loading={this.state.deleteState !== DeleteState.NoDelete}
                      onClick={() => this.onEmployeeDelete(employee.employeeId)}
                    >
                      <Icon name="delete" />
                    </Button>
                  </Grid.Column>
                  <Grid.Column width={16}>
                    <Divider />
                  </Grid.Column>
                </Grid.Row>
              );
            })}
          </Grid>
        </Grid>
      </div>
    );
  }
}
