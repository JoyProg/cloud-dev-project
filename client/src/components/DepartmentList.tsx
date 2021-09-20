import * as React from 'react'
import { Department } from '../types/Department'
import { DepartmentItem } from './DepartmentItem'
import { getDepartments } from '../api/departments-api'
import { Card, Button, Divider } from 'semantic-ui-react'
import { History } from 'history'
import Auth from '../auth/Auth'

enum FetchedState {
  Fetching,
  Fetched
}

interface DepartmentListProps {
  history: History,
  auth: Auth
}

interface DepartmentListState {
  departments: Department[],
  fetchedState: FetchedState
}

export class DepartmentList extends React.PureComponent<DepartmentListProps, DepartmentListState> {
  state: DepartmentListState = {
    departments: [],
    fetchedState: FetchedState.Fetching
  }

  handleCreateDepartment = () => {
    this.props.history.push(`/departments/create`)
  }

  async componentDidMount() {
    try {
      const departments = await getDepartments(this.props.auth.getIdToken())
      console.log(departments)
      this.setState({
        departments,
        fetchedState: FetchedState.Fetched
      })
    } catch (e: any) {
      alert(`Failed to fetch groups: ${e.message}`)
      this.setState({
        fetchedState: FetchedState.Fetched
      });
    }
  }

  render() {
    return (
      <div>
        <h1>Departments</h1>

        <Button
          size="huge"
          className="custom-col add-button"
          onClick={this.handleCreateDepartment}
        >
          Create new department
        </Button>

        <Divider clearing />

        <Card.Group>
        {this.state.fetchedState === FetchedState.Fetching && <div className="loader"></div>}
          {this.state.departments.map(department => {
            return <DepartmentItem key={department.departmentId} department={department} />
          })}
        </Card.Group>
      </div>
    )
  }
}
